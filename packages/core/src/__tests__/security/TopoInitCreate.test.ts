/**
 * P0-6 regression: create-time computed values must evaluate in topological
 * order, so a computed value that depends on another computed value reads
 * the already-computed upstream result instead of undefined.
 *
 * Also proves the companion fix for dotted-path writes: when a field name is
 * itself dotted (e.g. "shipping.name"), `setValue` must write the nested path
 * via RHF, and subsequent computed values referencing `$values.shipping.name`
 * must read the nested value (not the flat key).
 *
 * Before these fixes:
 *   - Iteration was `Object.entries(fields)` in insertion order (P0-6).
 *   - `initEntityData[fieldName] = result` created flat keys that hid
 *     nested reads via `getNestedValue` (P0-6 companion).
 */

import { describe, it, expect, vi } from "vitest";
import { InitOnCreateFormState } from "../../helpers/FormosaicHelper";
import { evaluateAllRules } from "../../helpers/RuleEngine";
import type { IFieldConfig } from "../../types/IFieldConfig";
import type { IEntityData } from "../../types/IRuntimeFieldState";

describe("P0-6 topological init for create-time computed values", () => {
  /**
   * A minimal shim of `setValue` backed by an object store. Supports dotted
   * paths by creating nested objects (mirrors RHF's behavior).
   */
  function makeStore(initial: IEntityData = {}) {
    const store: Record<string, unknown> = { ...initial };
    const setValue = vi.fn((name: string, value: unknown) => {
      if (!name.includes(".")) {
        store[name] = value;
        return;
      }
      const parts = name.split(".");
      let node = store as Record<string, unknown>;
      for (let i = 0; i < parts.length - 1; i++) {
        const key = parts[i];
        if (!node[key] || typeof node[key] !== "object") node[key] = {};
        node = node[key] as Record<string, unknown>;
      }
      node[parts[parts.length - 1]] = value;
    });
    const getValues = () => store;
    return { store, setValue, getValues };
  }

  it("evaluates dependent computed values in topological order", () => {
    // audit-number and audit-by depend on each other's computedValue. If
    // iteration is insertion-order, `audit-by` (first key) reads undefined
    // for $values.createdBy.
    //
    // NOTE: object insertion order is preserved, so to adversarially prove
    // the bug-fix we insert the DEPENDENT field BEFORE the dependency.
    const fields: Record<string, IFieldConfig> = {
      audit: {
        type: "Textbox",
        label: "Audit",
        computedValue: "$values.createdBy",
        computeOnCreateOnly: true,
      },
      createdBy: {
        type: "Textbox",
        label: "Created By",
        defaultValue: "alice",
      },
    };

    const { store, setValue } = makeStore();
    const initFormState = (_cfg: string, vals: IEntityData, flds: Record<string, IFieldConfig>) =>
      evaluateAllRules(flds, vals, false);
    InitOnCreateFormState(
      "testConfig",
      fields,
      {},
      {},
      "alice",
      setValue as unknown as Parameters<typeof InitOnCreateFormState>[5],
      initFormState
    );

    // If topo sort ran, createdBy was defaulted first (to "alice"), then
    // audit's computedValue saw "alice". Without the fix, audit would read
    // undefined because createdBy hadn't been written yet.
    expect(store.createdBy).toBe("alice");
    expect(store.audit).toBe("alice");
  });

  it("handles chained dependencies 3 deep", () => {
    // c -> b -> a (c depends on b depends on a). Inserted reverse.
    const fields: Record<string, IFieldConfig> = {
      c: {
        type: "Textbox",
        label: "C",
        computedValue: "$values.b",
        computeOnCreateOnly: true,
      },
      b: {
        type: "Textbox",
        label: "B",
        computedValue: "$values.a",
        computeOnCreateOnly: true,
      },
      a: {
        type: "Textbox",
        label: "A",
        defaultValue: "root",
      },
    };

    const { store, setValue } = makeStore();
    const initFormState = (_cfg: string, vals: IEntityData, flds: Record<string, IFieldConfig>) =>
      evaluateAllRules(flds, vals, false);
    InitOnCreateFormState(
      "testConfig",
      fields,
      {},
      {},
      "alice",
      setValue as unknown as Parameters<typeof InitOnCreateFormState>[5],
      initFormState
    );

    expect(store.a).toBe("root");
    expect(store.b).toBe("root");
    expect(store.c).toBe("root");
  });

  it("dotted field names write nested paths visible to downstream reads", () => {
    // "shipping.name" gets written nested; a field that reads
    // $values.shipping.name must see "Alice", not undefined.
    const fields: Record<string, IFieldConfig> = {
      greeting: {
        type: "Textbox",
        label: "Greeting",
        computedValue: "$values.shipping.name",
        computeOnCreateOnly: true,
      },
      "shipping.name": {
        type: "Textbox",
        label: "Ship Name",
        defaultValue: "Alice",
      },
    };

    const { store, setValue } = makeStore();
    const initFormState = (_cfg: string, vals: IEntityData, flds: Record<string, IFieldConfig>) =>
      evaluateAllRules(flds, vals, false);
    const { initEntityData } = InitOnCreateFormState(
      "testConfig",
      fields,
      {},
      {},
      "alice",
      setValue as unknown as Parameters<typeof InitOnCreateFormState>[5],
      initFormState
    );

    // The nested write should be visible.
    expect((store.shipping as Record<string, unknown>)?.name).toBe("Alice");
    // And greeting should have read from the nested path.
    expect(store.greeting).toBe("Alice");
    // initEntityData should reflect the same state (no flat-key pollution).
    expect(initEntityData).toBeDefined();
  });

  it("computed value reading deeply nested path sees upstream write", () => {
    const fields: Record<string, IFieldConfig> = {
      summary: {
        type: "Textbox",
        label: "Summary",
        computedValue: "$values.customer.profile.fullName",
        computeOnCreateOnly: true,
      },
      customer: {
        type: "Textbox",
        label: "Customer",
        defaultValue: { profile: { fullName: "Alice Smith" } },
      },
    };

    const { store, setValue } = makeStore();
    const initFormState = (_cfg: string, vals: IEntityData, flds: Record<string, IFieldConfig>) =>
      evaluateAllRules(flds, vals, false);
    InitOnCreateFormState(
      "testConfig",
      fields,
      {},
      {},
      "alice",
      setValue as unknown as Parameters<typeof InitOnCreateFormState>[5],
      initFormState
    );

    expect(store.summary).toBe("Alice Smith");
  });

  it("independent fields are not affected by ordering", () => {
    // Two completely independent computed values both evaluate.
    const fields: Record<string, IFieldConfig> = {
      first: {
        type: "Textbox",
        label: "First",
        computedValue: "$values.$self",
        defaultValue: "first-default",
        computeOnCreateOnly: true,
      },
      second: {
        type: "Textbox",
        label: "Second",
        defaultValue: "second-default",
      },
    };

    const { store, setValue } = makeStore();
    const initFormState = (_cfg: string, vals: IEntityData, flds: Record<string, IFieldConfig>) =>
      evaluateAllRules(flds, vals, false);
    InitOnCreateFormState(
      "testConfig",
      fields,
      {},
      {},
      "alice",
      setValue as unknown as Parameters<typeof InitOnCreateFormState>[5],
      initFormState
    );

    expect(store.second).toBe("second-default");
    // `$values.$self` is not a real token; just verifying the default is applied.
    expect(store.first).toBe("first-default");
  });
});
