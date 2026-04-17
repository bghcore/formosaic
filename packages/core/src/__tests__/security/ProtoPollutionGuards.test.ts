/**
 * P0-7 regression: adversarial proof that __proto__ / constructor / prototype
 * guards are in force at every boundary that walks user-controlled key paths.
 *
 * The guards are defense-in-depth. None of these inputs are expected in
 * normal authored configs, but the audit flagged config as untrusted in
 * multi-tenant deployments (admin UIs, imported JSON, URL params).
 *
 * For each boundary, we assert:
 *  1. The malicious lookup returns undefined (not a function/prototype).
 *  2. Object.prototype is not polluted as a side effect.
 *  3. Legitimate adjacent keys still resolve (guard doesn't over-block).
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { evaluateExpression } from "../../helpers/ExpressionEngine";
import { evaluateCondition } from "../../helpers/ConditionEvaluator";
import { interpolate, interpolateDeep } from "../../templates/ExpressionInterpolator";
import { resolveTemplates } from "../../templates/TemplateResolver";
import { resolveRefs } from "../../utils/rjsf/refResolver";
import type { IFormConfig } from "../../types/IFormConfig";
import type { IJsonSchemaNode } from "../../utils/rjsf/types";

const POLLUTION_KEYS = ["__proto__", "constructor", "prototype"] as const;

// Capture a baseline so we can assert Object.prototype was untouched.
let baselineProto: string;
beforeEach(() => {
  // Snapshot which own keys exist on Object.prototype before each test.
  baselineProto = JSON.stringify(
    Object.getOwnPropertyNames(Object.prototype).sort()
  );
});

afterEach(() => {
  const after = JSON.stringify(
    Object.getOwnPropertyNames(Object.prototype).sort()
  );
  expect(after).toBe(baselineProto);
  // Also confirm no stray polluted property exists on a vanilla object.
  expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  expect(({} as Record<string, unknown>).isAdmin).toBeUndefined();
});

describe("P0-7 adversarial pollution guards", () => {
  // ---- ExpressionEngine ($values / $root / $parent traversal) -------------
  // NOTE: The guard in getNestedValue returns `undefined` on a pollution key;
  // the engine's serializeValue then substitutes `"NaN"` so arithmetic stays
  // well-behaved. So the expected evaluated result is `NaN` (a Number), not
  // the polluted payload and not a Function reference.
  describe("ExpressionEngine.evaluateExpression refuses prototype keys", () => {
    for (const key of POLLUTION_KEYS) {
      it(`does not expose pollution via $values.${key}.polluted`, () => {
        const result = evaluateExpression(
          `$values.${key}.polluted`,
          { user: { name: "alice" } },
          "owner",
          undefined,
          undefined
        );
        expect(result).not.toBe("yes");
        expect(typeof result).not.toBe("function");
        // Arithmetic-sentinel NaN is the expected "missing value" outcome.
        expect(Number.isNaN(result as number)).toBe(true);
      });

      it(`does not expose pollution via $root.${key}`, () => {
        const result = evaluateExpression(
          `$root.${key}`,
          { user: { name: "alice" } },
          "owner",
          undefined,
          undefined
        );
        expect(result).not.toBe("yes");
        expect(typeof result).not.toBe("function");
        expect(Number.isNaN(result as number)).toBe(true);
      });
    }

    it("legitimate nested path still resolves", () => {
      const result = evaluateExpression(
        "$values.user.name",
        { user: { name: "alice" } },
        "owner",
        undefined,
        undefined
      );
      expect(result).toBe("alice");
    });

    it("malicious values object cannot pollute Object.prototype via evaluation", () => {
      // JSON.parse of "__proto__" creates an own property (not an actual
      // prototype-chain link). Even so, the guard blocks traversal.
      const hostile = JSON.parse('{"__proto__":{"polluted":"yes"},"user":{"name":"alice"}}');
      const result = evaluateExpression(
        "$values.__proto__.polluted",
        hostile,
        "owner",
        undefined,
        undefined
      );
      expect(result).not.toBe("yes");
      expect(Number.isNaN(result as number)).toBe(true);
    });
  });

  // ---- ConditionEvaluator ($values traversal via field paths) ------------
  describe("ConditionEvaluator refuses prototype keys in field paths", () => {
    for (const key of POLLUTION_KEYS) {
      it(`field "${key}.polluted" compares to empty for isEmpty`, () => {
        const result = evaluateCondition(
          { field: `${key}.polluted`, operator: "isEmpty" },
          { user: { name: "alice" } }
        );
        // Guard returns undefined -> isEmpty treats undefined as empty.
        expect(result).toBe(true);
      });

      it(`field "user.${key}" is undefined for equals check`, () => {
        const result = evaluateCondition(
          { field: `user.${key}`, operator: "equals", value: "yes" },
          { user: { name: "alice" } }
        );
        expect(result).toBe(false);
      });
    }

    it("legitimate nested field still resolves", () => {
      const result = evaluateCondition(
        { field: "user.name", operator: "equals", value: "alice" },
        { user: { name: "alice" } }
      );
      expect(result).toBe(true);
    });
  });

  // ---- Template ExpressionInterpolator (params / lookup tables) -----------
  describe("ExpressionInterpolator refuses prototype keys in params/lookup", () => {
    for (const key of POLLUTION_KEYS) {
      it(`{{params.${key}.polluted}} returns undefined`, () => {
        const hostileParams = JSON.parse(
          `{"${key}":{"polluted":"yes"},"name":"real"}`
        );
        const result = interpolate(
          `{{params.${key}.polluted}}`,
          hostileParams,
          {}
        );
        expect(result).toBeUndefined();
      });

      it(`{{$lookup.${key}.polluted}} returns undefined`, () => {
        const hostileLookups = JSON.parse(
          `{"${key}":{"polluted":"yes"},"currencies":{"USD":"Dollar"}}`
        );
        const result = interpolate(
          `{{$lookup.${key}.polluted}}`,
          {},
          hostileLookups
        );
        expect(result).toBeUndefined();
      });
    }

    it("legitimate param access still resolves", () => {
      const result = interpolate(
        "{{params.name}}",
        { name: "alice" },
        {}
      );
      expect(result).toBe("alice");
    });

    it("interpolateDeep on a hostile config tree returns safely", () => {
      const tree = {
        label: "{{params.__proto__.polluted}}",
        nested: {
          hint: "{{$lookup.constructor.name}}",
        },
        list: ["{{params.prototype.x}}", "{{params.real}}"],
      };
      const hostileParams = JSON.parse(
        '{"__proto__":{"polluted":"yes"},"prototype":{"x":"bad"},"real":"ok"}'
      );
      const out = interpolateDeep(tree, hostileParams, {}) as Record<
        string,
        unknown
      >;
      expect(out.label).toBeUndefined();
      expect((out.nested as Record<string, unknown>).hint).toBeUndefined();
      expect((out.list as unknown[])[0]).toBeUndefined();
      expect((out.list as unknown[])[1]).toBe("ok");
    });
  });

  // ---- resolveTemplates (safeMerge on templates/lookups maps) -------------
  describe("resolveTemplates safeMerge drops prototype keys in inputs", () => {
    it("hostile config.templates key __proto__ is not merged", () => {
      const hostileTemplates = JSON.parse(
        '{"__proto__":{"fields":{"exploited":{"type":"Textbox","label":"pwned"}}},"realTemplate":{"fields":{"x":{"type":"Textbox","label":"X"}}}}'
      );
      const config: IFormConfig = {
        version: 2,
        templates: hostileTemplates,
        fields: {
          foo: { templateRef: "realTemplate" },
        },
      };
      // Resolver must not have merged the hostile __proto__ template.
      const resolved = resolveTemplates(config);
      expect(Object.keys(resolved.fields)).not.toContain("exploited");
      // Object.prototype must not have gained a `.fields` shortcut.
      expect(({} as Record<string, unknown>).fields).toBeUndefined();
    });

    it("hostile config.lookups key constructor is not merged", () => {
      const hostileLookups = JSON.parse(
        '{"constructor":{"name":"Function"},"currencies":{"USD":"Dollar"}}'
      );
      const config: IFormConfig = {
        version: 2,
        lookups: hostileLookups,
        fields: {
          x: { type: "Textbox", label: "{{$lookup.constructor.name}}" },
        },
      };
      const resolved = resolveTemplates(config);
      const xLabel = (resolved.fields.x as { label?: unknown }).label;
      // Either interpolation failed (undefined) or produced empty string,
      // but must NOT be the word "Function" (which would mean the hostile
      // constructor key was reached via lookups).
      expect(xLabel).not.toBe("Function");
    });
  });

  // ---- RJSF refResolver (walks schema with arbitrary keys) ----------------
  describe("RJSF refResolver skips prototype keys during walk", () => {
    for (const key of POLLUTION_KEYS) {
      // Guard at refResolver.ts:131 protects against a TOP-LEVEL schema key
      // named __proto__ / constructor / prototype (where it would otherwise
      // be blindly copied into `result` via the `else` branch).
      it(`schema with top-level key "${key}" drops it from output`, () => {
        const schema = JSON.parse(
          `{"type":"object","${key}":{"polluted":"yes"},"title":"safe"}`
        ) as IJsonSchemaNode;
        const resolved = resolveRefs(schema);
        // The guard strips the key from the result object. Use hasOwn so
        // we don't confuse with prototype-chain reads (e.g. `.constructor`
        // always falls through to Object.prototype.constructor).
        expect(Object.hasOwn(resolved, key)).toBe(false);
        // Legitimate adjacent key survives.
        expect((resolved as Record<string, unknown>).title).toBe("safe");
      });
    }

    it("maxDepth guards against stack overflow on deeply nested schemas", () => {
      // Build a self-referential chain via $ref cycles detected by the resolver.
      const deep: IJsonSchemaNode = { type: "object", properties: {} };
      let node = deep;
      for (let i = 0; i < 200; i++) {
        const next: IJsonSchemaNode = { type: "object", properties: {} };
        (node.properties as Record<string, IJsonSchemaNode>).child = next;
        node = next;
      }
      // maxDepth is 64 by default; 200 nested levels must throw.
      expect(() => resolveRefs(deep, 64)).toThrow(/recursion depth/i);
    });

    it("maxDepth=200 allows deep-but-not-infinite schemas", () => {
      const deep: IJsonSchemaNode = { type: "object", properties: {} };
      let node = deep;
      for (let i = 0; i < 100; i++) {
        const next: IJsonSchemaNode = { type: "object", properties: {} };
        (node.properties as Record<string, IJsonSchemaNode>).child = next;
        node = next;
      }
      // With headroom, resolution succeeds.
      expect(() => resolveRefs(deep, 200)).not.toThrow();
    });
  });
});
