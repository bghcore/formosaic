# Template & Composition System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add reusable, JSON-serializable form templates with typed parameters, runtime composition, cross-fragment connections, and wizard integration to `@formosaic/core`.

**Architecture:** Templates are a pure pre-processing layer. `resolveTemplates()` expands template references into a flat `IFormConfig` before the rules engine ever sees them. The JSX `<ComposedForm>` API and `composeForm()` function both produce resolved configs. The dependency graph gets two-tier tracking (top-level for FieldArrays, qualified paths for fragment fields).

**Tech Stack:** React 18/19, TypeScript strict, react-hook-form v7, vitest, existing expr-eval (runtime only — templates use a custom interpolator)

**Spec:** `docs/superpowers/specs/2026-03-18-template-composition-design.md`

---

## File Map

### New Files

| File | Responsibility |
|------|---------------|
| `packages/core/src/types/IFormTemplate.ts` | `IFormTemplate`, `ITemplateParamSchema`, `ITemplateFieldRef`, `isTemplateFieldRef()` type guard |
| `packages/core/src/types/IFormConnection.ts` | `IFormConnection`, `IFragmentDef`, `IComposeFormOptions` |
| `packages/core/src/types/IResolvedFormConfig.ts` | `IResolvedFormConfig`, `ITemplateMeta`, `IResolvedFieldMeta` |
| `packages/core/src/templates/TemplateRegistry.ts` | Global template registry (register, get, reset, bulk) |
| `packages/core/src/templates/LookupRegistry.ts` | Global lookup table registry |
| `packages/core/src/templates/ExpressionInterpolator.ts` | `{{expression}}` evaluator (custom parser, not expr-eval) |
| `packages/core/src/templates/TemplateResolver.ts` | 11-step resolution pipeline |
| `packages/core/src/templates/ConnectionCompiler.ts` | `IFormConnection[]` → `IRule[]` compilation |
| `packages/core/src/templates/ComposedFormBuilder.ts` | `composeForm()` orchestrator |
| `packages/core/src/components/ComposedForm.tsx` | JSX composition wrapper |
| `packages/core/src/components/FormFragment.tsx` | Declaration-only fragment component |
| `packages/core/src/components/FormConnection.tsx` | Declaration-only connection component |
| `packages/core/src/components/FormField.tsx` | Declaration-only standalone field component |

### Modified Files

| File | What Changes |
|------|-------------|
| `packages/core/src/types/IFormConfig.ts:15` | `fields` type → `Record<string, IFieldConfig \| ITemplateFieldRef>`, add `templates?`, `lookups?` |
| `packages/core/src/types/IWizardConfig.ts:12` | `fields` → optional, add `fragments?`, `fragmentWizardMode?` |
| `packages/core/src/types/index.ts` | Export new type modules |
| `packages/core/src/helpers/ConditionEvaluator.ts:113` | `extractConditionDependencies` returns full dotted paths |
| `packages/core/src/helpers/ExpressionEngine.ts:149` | `extractExpressionDependencies` regex fix: `[a-zA-Z0-9_]*` → `[a-zA-Z0-9_.]*` |
| `packages/core/src/helpers/RuleEngine.ts:14-55` | Two-tier dependency graph in `buildDependencyGraph`, `buildDefaultFieldStates`, `evaluateAffectedFields` |
| `packages/core/src/helpers/WizardHelper.ts` | Null-safe `step.fields`, expand `step.fragments` |
| `packages/core/src/helpers/FormosaicHelper.ts` | `getNestedValue` for `CheckValidDropdownOptions`, `CheckDefaultValues`, `InitOnCreateFormState` |
| `packages/core/src/components/Formosaic.tsx` | Auto-detect `templateRef`, call `resolveTemplates()` |
| `packages/core/src/components/FormDevTools.tsx` | Template provenance column in Deps tab |
| `packages/core/src/index.ts` | Export new public API |

### Test Files

| File | What It Tests |
|------|-------------|
| `packages/core/src/__tests__/templates/TemplateRegistry.test.ts` | Registry CRUD, bulk, reset |
| `packages/core/src/__tests__/templates/LookupRegistry.test.ts` | Lookup table CRUD, reset |
| `packages/core/src/__tests__/templates/ExpressionInterpolator.test.ts` | All interpolation patterns |
| `packages/core/src/__tests__/templates/TemplateResolver.test.ts` | Full resolution pipeline, nesting, cycles, errors |
| `packages/core/src/__tests__/templates/ConnectionCompiler.test.ts` | Connection → rule compilation |
| `packages/core/src/__tests__/templates/ComposedFormBuilder.test.ts` | `composeForm()` integration |
| `packages/core/src/__tests__/templates/ComposedForm.test.tsx` | JSX API component tests |
| `packages/core/src/__tests__/templates/WizardFragmentIntegration.test.ts` | Wizard + fragment expansion |
| `packages/core/src/__tests__/templates/DependencyGraphQualified.test.ts` | Two-tier graph, qualified paths |

---

## Task 1: Type Definitions

**Files:**
- Create: `packages/core/src/types/IFormTemplate.ts`
- Create: `packages/core/src/types/IFormConnection.ts`
- Create: `packages/core/src/types/IResolvedFormConfig.ts`
- Modify: `packages/core/src/types/IFormConfig.ts`
- Modify: `packages/core/src/types/IWizardConfig.ts`
- Modify: `packages/core/src/types/index.ts`

- [ ] **Step 1: Create `IFormTemplate.ts`**

```typescript
// packages/core/src/types/IFormTemplate.ts
import { IFieldConfig } from "./IFieldConfig";
import { IRule } from "./IRule";
import { IWizardConfig } from "./IWizardConfig";

export interface ITemplateParamSchema {
  type: "string" | "number" | "boolean";
  enum?: unknown[];
  default?: unknown;
  required?: boolean;
}

export interface ITemplateFieldRef {
  templateRef: string;
  templateParams?: Record<string, unknown>;
  templateOverrides?: Record<string, Partial<IFieldConfig>>;
  defaultValues?: Record<string, unknown>;
}

export function isTemplateFieldRef(
  field: IFieldConfig | ITemplateFieldRef
): field is ITemplateFieldRef {
  return "templateRef" in field && typeof (field as ITemplateFieldRef).templateRef === "string";
}

// TParams is a marker type for registerFormTemplate<T>() call-site inference only.
export interface IFormTemplate<TParams extends Record<string, unknown> = Record<string, unknown>> {
  params?: Record<string, ITemplateParamSchema>;
  fields: Record<string, IFieldConfig | ITemplateFieldRef>;
  fieldOrder?: string[];
  rules?: IRule[];
  wizard?: IWizardConfig;
  ports?: Record<string, string[]>;
}
```

- [ ] **Step 2: Create `IFormConnection.ts`**

```typescript
// packages/core/src/types/IFormConnection.ts
import { IFieldConfig } from "./IFieldConfig";
import { ICondition } from "./ICondition";
import { IFormConfig } from "./IFormConfig";
import { IFormSettings } from "./IFormConfig";
import { IWizardConfig } from "./IWizardConfig";

export interface IFragmentDef {
  template?: string;
  config?: IFormConfig;
  params?: Record<string, unknown>;
  overrides?: Record<string, Partial<IFieldConfig>>;
  defaultValues?: Record<string, unknown>;
}

export interface IFormConnection {
  name: string;
  when: ICondition;
  source: { fragment: string; port: string };
  target: { fragment: string; port: string };
  effect: "copyValues" | "hide" | "readOnly" | "computeFrom";
}

export interface IComposeFormOptions {
  fragments: Record<string, IFragmentDef>;
  fields?: Record<string, IFieldConfig>;
  connections?: IFormConnection[];
  fieldOrder?: string[];
  wizard?: IWizardConfig;
  settings?: IFormSettings;
  lookups?: Record<string, unknown>;
}
```

- [ ] **Step 3: Create `IResolvedFormConfig.ts`**

```typescript
// packages/core/src/types/IResolvedFormConfig.ts
import { IFieldConfig } from "./IFieldConfig";
import { IFormConfig } from "./IFormConfig";

export interface IResolvedFieldMeta {
  source: "direct" | "template";
  fragmentPrefix?: string;
  templateName?: string;
}

export interface ITemplateMeta {
  [resolvedFieldName: string]: {
    template: string;
    fragment: string;
    originalName: string;
  };
}

export interface IResolvedFormConfig extends IFormConfig {
  fields: Record<string, IFieldConfig>; // narrowed: all templateRefs resolved
  _templateMeta?: ITemplateMeta;
  _resolvedPorts?: Record<string, string[]>;
  _fieldMeta?: Record<string, IResolvedFieldMeta>;
}
```

- [ ] **Step 4: Modify `IFormConfig.ts` — add union type, templates, lookups**

At `packages/core/src/types/IFormConfig.ts`, change the `fields` type and add optional properties. The import for `ITemplateFieldRef` must be added, and the `IFormTemplate` import for the `templates` property.

```typescript
// Add to imports:
import { ITemplateFieldRef } from "./IFormTemplate";
import { IFormTemplate } from "./IFormTemplate";

// Change line 15:
// FROM: fields: Record<string, IFieldConfig>;
// TO:
fields: Record<string, IFieldConfig | ITemplateFieldRef>;

// Add after line 17 (after fieldOrder):
/** Inline template definitions. Merged with global registry during resolution. */
templates?: Record<string, IFormTemplate>;
/** Static lookup tables for template expression interpolation. */
lookups?: Record<string, unknown>;
```

- [ ] **Step 5: Modify `IWizardConfig.ts` — fields optional, add fragments**

At `packages/core/src/types/IWizardConfig.ts`:

```typescript
// Change line 12:
// FROM: fields: string[];
// TO:
fields?: string[];

// Add after fields:
/** Fragment prefixes included in this step (expanded during resolution). */
fragments?: string[];
/** How fragment sub-wizards render: "inline" flattens steps, "nested" keeps internal nav. */
fragmentWizardMode?: "inline" | "nested";
```

- [ ] **Step 6: Modify `types/index.ts` — export new type modules**

Add at the end of `packages/core/src/types/index.ts`:

```typescript
// Template & Composition
export * from "./IFormTemplate";
export * from "./IFormConnection";
export * from "./IResolvedFormConfig";
```

- [ ] **Step 7: Run type check**

Run: `npx tsc --noEmit -p packages/core/tsconfig.json`
Expected: No errors (existing code still compiles — the union type is additive).

- [ ] **Step 8: Commit**

```bash
git add packages/core/src/types/IFormTemplate.ts packages/core/src/types/IFormConnection.ts packages/core/src/types/IResolvedFormConfig.ts packages/core/src/types/IFormConfig.ts packages/core/src/types/IWizardConfig.ts packages/core/src/types/index.ts
git commit -m "feat: add template & composition type definitions"
```

---

## Task 2: Template Registry & Lookup Registry

**Files:**
- Create: `packages/core/src/templates/TemplateRegistry.ts`
- Create: `packages/core/src/templates/LookupRegistry.ts`
- Test: `packages/core/src/__tests__/templates/TemplateRegistry.test.ts`
- Test: `packages/core/src/__tests__/templates/LookupRegistry.test.ts`

- [ ] **Step 1: Write failing tests for TemplateRegistry**

```typescript
// packages/core/src/__tests__/templates/TemplateRegistry.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import {
  registerFormTemplate,
  registerFormTemplates,
  getFormTemplate,
  resetFormTemplates,
} from "../../templates/TemplateRegistry";

describe("TemplateRegistry", () => {
  beforeEach(() => { resetFormTemplates(); });

  it("returns undefined for unregistered template", () => {
    expect(getFormTemplate("nonexistent")).toBeUndefined();
  });

  it("registers and retrieves a template", () => {
    registerFormTemplate("address", {
      fields: { street: { type: "Textbox", label: "Street" } },
    });
    const tmpl = getFormTemplate("address");
    expect(tmpl).toBeDefined();
    expect(tmpl!.fields.street).toBeDefined();
  });

  it("overwrites existing template on re-register", () => {
    registerFormTemplate("address", {
      fields: { street: { type: "Textbox", label: "Street" } },
    });
    registerFormTemplate("address", {
      fields: { city: { type: "Textbox", label: "City" } },
    });
    const tmpl = getFormTemplate("address")!;
    expect("city" in tmpl.fields).toBe(true);
    expect("street" in tmpl.fields).toBe(false);
  });

  it("bulk registers multiple templates", () => {
    registerFormTemplates({
      address: { fields: { street: { type: "Textbox", label: "Street" } } },
      contact: { fields: { email: { type: "Textbox", label: "Email" } } },
    });
    expect(getFormTemplate("address")).toBeDefined();
    expect(getFormTemplate("contact")).toBeDefined();
  });

  it("resetFormTemplates clears all templates", () => {
    registerFormTemplate("address", {
      fields: { street: { type: "Textbox", label: "Street" } },
    });
    resetFormTemplates();
    expect(getFormTemplate("address")).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run packages/core/src/__tests__/templates/TemplateRegistry.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement TemplateRegistry**

```typescript
// packages/core/src/templates/TemplateRegistry.ts
import { IFormTemplate } from "../types/IFormTemplate";

let registry: Record<string, IFormTemplate> = {};

export function registerFormTemplate<TParams extends Record<string, unknown> = Record<string, unknown>>(
  name: string,
  template: IFormTemplate<TParams>
): void {
  registry[name] = template;
}

export function registerFormTemplates(templates: Record<string, IFormTemplate>): void {
  for (const [name, template] of Object.entries(templates)) {
    registry[name] = template;
  }
}

export function getFormTemplate(name: string): IFormTemplate | undefined {
  return registry[name];
}

export function resetFormTemplates(): void {
  registry = {};
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run packages/core/src/__tests__/templates/TemplateRegistry.test.ts`
Expected: PASS (all 5 tests)

- [ ] **Step 5: Write failing tests for LookupRegistry**

```typescript
// packages/core/src/__tests__/templates/LookupRegistry.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import {
  registerLookupTables,
  getLookupTable,
  resetLookupTables,
} from "../../templates/LookupRegistry";

describe("LookupRegistry", () => {
  beforeEach(() => { resetLookupTables(); });

  it("returns undefined for unregistered table", () => {
    expect(getLookupTable("stateOptions")).toBeUndefined();
  });

  it("registers and retrieves a lookup table", () => {
    registerLookupTables({ stateOptions: { US: [{ value: "CA", label: "California" }] } });
    const table = getLookupTable("stateOptions");
    expect(table).toBeDefined();
  });

  it("merges multiple registrations", () => {
    registerLookupTables({ a: 1 });
    registerLookupTables({ b: 2 });
    expect(getLookupTable("a")).toBe(1);
    expect(getLookupTable("b")).toBe(2);
  });

  it("resetLookupTables clears all tables", () => {
    registerLookupTables({ a: 1 });
    resetLookupTables();
    expect(getLookupTable("a")).toBeUndefined();
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npx vitest run packages/core/src/__tests__/templates/LookupRegistry.test.ts`
Expected: FAIL

- [ ] **Step 7: Implement LookupRegistry**

```typescript
// packages/core/src/templates/LookupRegistry.ts
let registry: Record<string, unknown> = {};

export function registerLookupTables(tables: Record<string, unknown>): void {
  registry = { ...registry, ...tables };
}

export function getLookupTable(name: string): unknown | undefined {
  return registry[name];
}

export function resetLookupTables(): void {
  registry = {};
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npx vitest run packages/core/src/__tests__/templates/LookupRegistry.test.ts`
Expected: PASS (all 4 tests)

- [ ] **Step 9: Commit**

```bash
git add packages/core/src/templates/ packages/core/src/__tests__/templates/
git commit -m "feat: add TemplateRegistry and LookupRegistry"
```

---

## Task 3: Expression Interpolator

**Files:**
- Create: `packages/core/src/templates/ExpressionInterpolator.ts`
- Test: `packages/core/src/__tests__/templates/ExpressionInterpolator.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// packages/core/src/__tests__/templates/ExpressionInterpolator.test.ts
import { describe, it, expect } from "vitest";
import { interpolate } from "../../templates/ExpressionInterpolator";

describe("ExpressionInterpolator", () => {
  const params = { country: "US", required: true, count: 3 };
  const lookups = {
    stateOptions: {
      US: [{ value: "CA", label: "California" }],
      CA: [{ value: "ON", label: "Ontario" }],
    },
    zipPatterns: { US: "^\\d{5}$", CA: "^[A-Z]\\d[A-Z]$" },
  };

  describe("simple param substitution", () => {
    it("resolves a string param", () => {
      expect(interpolate("{{params.country}}", params, lookups)).toBe("US");
    });

    it("resolves a boolean param", () => {
      expect(interpolate("{{params.required}}", params, lookups)).toBe(true);
    });

    it("resolves a number param", () => {
      expect(interpolate("{{params.count}}", params, lookups)).toBe(3);
    });
  });

  describe("ternary expressions", () => {
    it("evaluates true branch", () => {
      expect(interpolate("{{params.country == 'CA' ? 'Province' : 'State'}}", params, lookups)).toBe("State");
    });

    it("evaluates true branch when condition matches", () => {
      expect(interpolate("{{params.country == 'US' ? 'State' : 'Province'}}", { ...params, country: "US" }, lookups)).toBe("State");
    });
  });

  describe("lookup table access", () => {
    it("resolves bracket access with param key", () => {
      const result = interpolate("{{$lookup.stateOptions[params.country]}}", params, lookups);
      expect(result).toEqual([{ value: "CA", label: "California" }]);
    });

    it("resolves dot access", () => {
      const result = interpolate("{{$lookup.zipPatterns.US}}", params, lookups);
      expect(result).toBe("^\\d{5}$");
    });
  });

  describe("non-expression strings pass through", () => {
    it("returns plain string as-is", () => {
      expect(interpolate("Hello world", params, lookups)).toBe("Hello world");
    });

    it("returns non-string values as-is", () => {
      expect(interpolate(42 as unknown as string, params, lookups)).toBe(42);
    });
  });

  describe("inequality", () => {
    it("evaluates != correctly", () => {
      expect(interpolate("{{params.country != 'CA' ? 'Not Canada' : 'Canada'}}", params, lookups)).toBe("Not Canada");
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run packages/core/src/__tests__/templates/ExpressionInterpolator.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement ExpressionInterpolator**

The interpolator handles `{{expression}}` strings. It does NOT use expr-eval — it's a lightweight custom parser that supports ternary, property access, bracket access, and equality operators. It can return any JSON value (objects, arrays, booleans, strings, numbers).

```typescript
// packages/core/src/templates/ExpressionInterpolator.ts

/**
 * Interpolates a {{expression}} string against template params and lookup tables.
 * Returns the resolved value (can be any JSON type: string, boolean, number, array, object).
 *
 * NOT based on expr-eval — this is a lightweight custom evaluator for static template resolution.
 */
export function interpolate(
  value: unknown,
  params: Record<string, unknown>,
  lookups: Record<string, unknown>
): unknown {
  if (typeof value !== "string") return value;
  const str = value as string;

  // Check if the entire string is a single {{expression}}
  const fullMatch = /^\{\{(.+)\}\}$/.exec(str.trim());
  if (!fullMatch) return str;

  const expr = fullMatch[1].trim();
  return evaluateExpr(expr, params, lookups);
}

/**
 * Recursively interpolates all string values in a plain object/array.
 */
export function interpolateDeep(
  obj: unknown,
  params: Record<string, unknown>,
  lookups: Record<string, unknown>
): unknown {
  if (typeof obj === "string") return interpolate(obj, params, lookups);
  if (Array.isArray(obj)) return obj.map(item => interpolateDeep(item, params, lookups));
  if (obj !== null && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
      result[key] = interpolateDeep(val, params, lookups);
    }
    return result;
  }
  return obj;
}

function evaluateExpr(
  expr: string,
  params: Record<string, unknown>,
  lookups: Record<string, unknown>
): unknown {
  // Ternary: condition ? trueVal : falseVal
  const ternaryIdx = findTernary(expr);
  if (ternaryIdx !== -1) {
    const condition = expr.slice(0, ternaryIdx).trim();
    const rest = expr.slice(ternaryIdx + 1);
    const colonIdx = findColon(rest);
    if (colonIdx !== -1) {
      const trueExpr = rest.slice(0, colonIdx).trim();
      const falseExpr = rest.slice(colonIdx + 1).trim();
      const condResult = evaluateCondition(condition, params, lookups);
      return condResult
        ? evaluateExpr(trueExpr, params, lookups)
        : evaluateExpr(falseExpr, params, lookups);
    }
  }

  // String literal: 'value'
  const strMatch = /^'([^']*)'$/.exec(expr);
  if (strMatch) return strMatch[1];

  // Number literal
  if (/^-?\d+(\.\d+)?$/.test(expr)) return Number(expr);

  // Boolean literal
  if (expr === "true") return true;
  if (expr === "false") return false;

  // Property/bracket access
  return resolveReference(expr, params, lookups);
}

function evaluateCondition(
  expr: string,
  params: Record<string, unknown>,
  lookups: Record<string, unknown>
): boolean {
  // Handle != first (before ==)
  const neqIdx = expr.indexOf("!=");
  if (neqIdx !== -1) {
    const left = evaluateExpr(expr.slice(0, neqIdx).trim(), params, lookups);
    const right = evaluateExpr(expr.slice(neqIdx + 2).trim(), params, lookups);
    return left !== right;
  }

  const eqIdx = expr.indexOf("==");
  if (eqIdx !== -1) {
    const left = evaluateExpr(expr.slice(0, eqIdx).trim(), params, lookups);
    const right = evaluateExpr(expr.slice(eqIdx + 2).trim(), params, lookups);
    return left === right;
  }

  // Truthy check
  const val = evaluateExpr(expr, params, lookups);
  return !!val;
}

function resolveReference(
  path: string,
  params: Record<string, unknown>,
  lookups: Record<string, unknown>
): unknown {
  // $lookup.tableName[params.key] — bracket access
  const bracketMatch = /^(\$lookup\.[a-zA-Z_][a-zA-Z0-9_.]*)\[(.+)\]$/.exec(path);
  if (bracketMatch) {
    const obj = resolveReference(bracketMatch[1], params, lookups);
    const key = evaluateExpr(bracketMatch[2].trim(), params, lookups);
    if (obj !== null && typeof obj === "object" && key !== null && key !== undefined) {
      return (obj as Record<string, unknown>)[String(key)];
    }
    return undefined;
  }

  // $lookup.path
  if (path.startsWith("$lookup.")) {
    return getNestedValue(lookups, path.slice("$lookup.".length));
  }

  // params.path
  if (path.startsWith("params.")) {
    return getNestedValue(params, path.slice("params.".length));
  }

  return undefined;
}

function getNestedValue(obj: unknown, path: string): unknown {
  const parts = path.split(".");
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

/** Find the ternary ? operator (not inside quotes). */
function findTernary(expr: string): number {
  let inQuote = false;
  for (let i = 0; i < expr.length; i++) {
    if (expr[i] === "'") inQuote = !inQuote;
    if (!inQuote && expr[i] === "?") return i;
  }
  return -1;
}

/** Find the colon : for ternary (not inside quotes). */
function findColon(expr: string): number {
  let inQuote = false;
  for (let i = 0; i < expr.length; i++) {
    if (expr[i] === "'") inQuote = !inQuote;
    if (!inQuote && expr[i] === ":") return i;
  }
  return -1;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run packages/core/src/__tests__/templates/ExpressionInterpolator.test.ts`
Expected: PASS (all tests)

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/templates/ExpressionInterpolator.ts packages/core/src/__tests__/templates/ExpressionInterpolator.test.ts
git commit -m "feat: add ExpressionInterpolator for template param resolution"
```

---

## Task 4: Template Resolver

The core resolution pipeline. This is the largest new module.

**Files:**
- Create: `packages/core/src/templates/TemplateResolver.ts`
- Test: `packages/core/src/__tests__/templates/TemplateResolver.test.ts`

- [ ] **Step 1: Write failing tests**

Test the 11-step resolution pipeline covering: simple expansion, nested templates, param interpolation, overrides, defaultValues, rule rewriting, expression scoping, port merging, wizard expansion, cycle detection, error handling.

```typescript
// packages/core/src/__tests__/templates/TemplateResolver.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { resolveTemplates } from "../../templates/TemplateResolver";
import { registerFormTemplate, resetFormTemplates } from "../../templates/TemplateRegistry";
import { registerLookupTables, resetLookupTables } from "../../templates/LookupRegistry";
import { IFormConfig } from "../../types/IFormConfig";

describe("TemplateResolver", () => {
  beforeEach(() => {
    resetFormTemplates();
    resetLookupTables();
  });

  it("passes through a config with no templateRefs unchanged", () => {
    const config: IFormConfig = {
      version: 2,
      fields: { name: { type: "Textbox", label: "Name" } },
    };
    const resolved = resolveTemplates(config);
    expect(Object.keys(resolved.fields)).toEqual(["name"]);
  });

  it("expands a simple templateRef with prefixed field names", () => {
    registerFormTemplate("address", {
      fields: {
        street: { type: "Textbox", label: "Street" },
        city: { type: "Textbox", label: "City" },
      },
    });
    const config: IFormConfig = {
      version: 2,
      fields: {
        shipping: { templateRef: "address" } as any,
      },
    };
    const resolved = resolveTemplates(config);
    expect(resolved.fields["shipping.street"]).toBeDefined();
    expect(resolved.fields["shipping.city"]).toBeDefined();
    expect(resolved.fields["shipping"]).toBeUndefined();
  });

  it("interpolates template params", () => {
    registerFormTemplate("address", {
      params: { required: { type: "boolean", default: false } },
      fields: {
        street: { type: "Textbox", label: "Street", required: "{{params.required}}" as any },
      },
    });
    const config: IFormConfig = {
      version: 2,
      fields: {
        shipping: { templateRef: "address", templateParams: { required: true } } as any,
      },
    };
    const resolved = resolveTemplates(config);
    expect(resolved.fields["shipping.street"].required).toBe(true);
  });

  it("applies templateOverrides", () => {
    registerFormTemplate("address", {
      fields: {
        street: { type: "Textbox", label: "Street", required: true },
      },
    });
    const config: IFormConfig = {
      version: 2,
      fields: {
        shipping: {
          templateRef: "address",
          templateOverrides: { street: { required: false } },
        } as any,
      },
    };
    const resolved = resolveTemplates(config);
    expect(resolved.fields["shipping.street"].required).toBe(false);
  });

  it("applies defaultValues", () => {
    registerFormTemplate("address", {
      fields: {
        street: { type: "Textbox", label: "Street" },
        city: { type: "Textbox", label: "City" },
      },
    });
    const config: IFormConfig = {
      version: 2,
      fields: {
        shipping: {
          templateRef: "address",
          defaultValues: { street: "123 Main St", city: "Springfield" },
        } as any,
      },
    };
    const resolved = resolveTemplates(config);
    expect(resolved.fields["shipping.street"].defaultValue).toBe("123 Main St");
    expect(resolved.fields["shipping.city"].defaultValue).toBe("Springfield");
  });

  it("expands nested templates (template using template)", () => {
    registerFormTemplate("address", {
      fields: { street: { type: "Textbox", label: "Street" } },
    });
    registerFormTemplate("contact", {
      fields: {
        name: { type: "Textbox", label: "Name" },
        address: { templateRef: "address" } as any,
      },
    });
    const config: IFormConfig = {
      version: 2,
      fields: {
        shipping: { templateRef: "contact" } as any,
      },
    };
    const resolved = resolveTemplates(config);
    expect(resolved.fields["shipping.name"]).toBeDefined();
    expect(resolved.fields["shipping.address.street"]).toBeDefined();
  });

  it("detects cycles and throws", () => {
    registerFormTemplate("a", {
      fields: { ref: { templateRef: "b" } as any },
    });
    registerFormTemplate("b", {
      fields: { ref: { templateRef: "a" } as any },
    });
    const config: IFormConfig = {
      version: 2,
      fields: { x: { templateRef: "a" } as any },
    };
    expect(() => resolveTemplates(config)).toThrow(/[Cc]ycle/);
  });

  it("throws on missing template reference", () => {
    const config: IFormConfig = {
      version: 2,
      fields: { x: { templateRef: "nonexistent" } as any },
    };
    expect(() => resolveTemplates(config)).toThrow(/nonexistent/);
  });

  it("rewrites template-internal rule field references with prefix", () => {
    registerFormTemplate("address", {
      fields: {
        country: { type: "Dropdown", label: "Country", options: [] },
        state: { type: "Dropdown", label: "State", options: [] },
      },
      rules: [{
        when: { field: "country", operator: "equals", value: "US" },
        then: { fields: { state: { options: [{ value: "CA", label: "California" }] } } },
      }],
    });
    const config: IFormConfig = {
      version: 2,
      fields: { shipping: { templateRef: "address" } as any },
    };
    const resolved = resolveTemplates(config);
    // The rule should now reference "shipping.country" and "shipping.state"
    const rules = resolved.fields["shipping.country"]?.rules ?? resolved.fields["shipping.state"]?.rules;
    // Rules get attached to the fields they belong to — check the condition field is prefixed
    // Since rules are on the resolved config, we check that some field has rules with prefixed references
    const allRules = Object.values(resolved.fields).flatMap(f => f.rules ?? []);
    const condField = (allRules[0]?.when as any)?.field;
    expect(condField).toBe("shipping.country");
    const effectKeys = Object.keys(allRules[0]?.then?.fields ?? {});
    expect(effectKeys).toContain("shipping.state");
  });

  it("rewrites $values references in computedValue with prefix", () => {
    registerFormTemplate("calc", {
      fields: {
        qty: { type: "Number", label: "Qty" },
        total: { type: "Number", label: "Total", computedValue: "$values.qty * 2" },
      },
    });
    const config: IFormConfig = {
      version: 2,
      fields: { order: { templateRef: "calc" } as any },
    };
    const resolved = resolveTemplates(config);
    expect(resolved.fields["order.total"].computedValue).toBe("$values.order.qty * 2");
  });

  it("merges ports with prefixed paths", () => {
    registerFormTemplate("address", {
      fields: { street: { type: "Textbox", label: "Street" } },
      ports: { allFields: ["street"] },
    });
    const config: IFormConfig = {
      version: 2,
      fields: { shipping: { templateRef: "address" } as any },
    };
    const resolved = resolveTemplates(config);
    expect(resolved._resolvedPorts?.["shipping.allFields"]).toEqual(["shipping.street"]);
  });

  it("uses inline templates from config.templates", () => {
    const config: IFormConfig = {
      version: 2,
      templates: {
        address: {
          fields: { street: { type: "Textbox", label: "Street" } },
        },
      },
      fields: { shipping: { templateRef: "address" } as any },
    };
    const resolved = resolveTemplates(config);
    expect(resolved.fields["shipping.street"]).toBeDefined();
  });

  it("uses inline lookups from config.lookups", () => {
    const config: IFormConfig = {
      version: 2,
      templates: {
        address: {
          params: { country: { type: "string", default: "US" } },
          fields: {
            state: {
              type: "Dropdown",
              label: "State",
              options: "{{$lookup.states[params.country]}}" as any,
            },
          },
        },
      },
      lookups: { states: { US: [{ value: "CA", label: "California" }] } },
      fields: {
        shipping: { templateRef: "address", templateParams: { country: "US" } } as any,
      },
    };
    const resolved = resolveTemplates(config);
    expect(resolved.fields["shipping.state"].options).toEqual([{ value: "CA", label: "California" }]);
  });

  it("expands fieldOrder fragment prefixes", () => {
    registerFormTemplate("address", {
      fields: {
        street: { type: "Textbox", label: "Street" },
        city: { type: "Textbox", label: "City" },
      },
      fieldOrder: ["street", "city"],
    });
    const config: IFormConfig = {
      version: 2,
      fields: {
        heading: { type: "Textbox", label: "Heading" },
        shipping: { templateRef: "address" } as any,
      },
      fieldOrder: ["heading", "shipping"],
    };
    const resolved = resolveTemplates(config);
    expect(resolved.fieldOrder).toEqual(["heading", "shipping.street", "shipping.city"]);
  });

  it("expands wizard step fragments to field lists", () => {
    registerFormTemplate("address", {
      fields: {
        street: { type: "Textbox", label: "Street" },
        city: { type: "Textbox", label: "City" },
      },
    });
    const config: IFormConfig = {
      version: 2,
      fields: { shipping: { templateRef: "address" } as any },
      wizard: {
        steps: [{ id: "step1", title: "Shipping", fragments: ["shipping"] }],
      },
    };
    const resolved = resolveTemplates(config);
    const step = resolved.wizard!.steps[0];
    expect(step.fields).toContain("shipping.street");
    expect(step.fields).toContain("shipping.city");
  });

  it("strips $root prefix in template-internal rules", () => {
    registerFormTemplate("address", {
      fields: {
        state: { type: "Dropdown", label: "State", options: [] },
      },
      rules: [{
        when: { field: "$root.country", operator: "equals", value: "US" },
        then: { fields: { state: { options: [{ value: "CA", label: "CA" }] } } },
      }],
    });
    const config: IFormConfig = {
      version: 2,
      fields: {
        country: { type: "Dropdown", label: "Country", options: [] },
        shipping: { templateRef: "address" } as any,
      },
    };
    const resolved = resolveTemplates(config);
    const allRules = Object.values(resolved.fields).flatMap(f => f.rules ?? []);
    const condField = (allRules[0]?.when as any)?.field;
    // $root.country should become just "country" (root-level field)
    expect(condField).toBe("country");
  });

  it("throws when max resolution depth is exceeded", () => {
    // Create a deep non-cyclic chain: a -> b -> c -> d -> ... (11 levels)
    for (let i = 0; i < 12; i++) {
      const next = i < 11 ? { ref: { templateRef: `tmpl${i + 1}` } as any } : {};
      const fields = i < 11
        ? { [`field${i}`]: { type: "Textbox", label: `F${i}` }, ref: { templateRef: `tmpl${i + 1}` } as any }
        : { [`field${i}`]: { type: "Textbox", label: `F${i}` } };
      registerFormTemplate(`tmpl${i}`, { fields });
    }
    const config: IFormConfig = {
      version: 2,
      fields: { root: { templateRef: "tmpl0" } as any },
    };
    expect(() => resolveTemplates(config, { maxDepth: 5 })).toThrow(/depth/i);
  });

  it("applies param defaults when param not provided", () => {
    registerFormTemplate("address", {
      params: { country: { type: "string", default: "US" } },
      fields: {
        state: { type: "Textbox", label: "{{params.country}}" as any },
      },
    });
    const config: IFormConfig = {
      version: 2,
      fields: {
        shipping: { templateRef: "address", templateParams: {} } as any,
      },
    };
    const resolved = resolveTemplates(config);
    expect(resolved.fields["shipping.state"].label).toBe("US");
  });

  it("warns on missing lookup table reference", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    registerFormTemplate("address", {
      fields: {
        state: { type: "Dropdown", label: "State", options: "{{$lookup.nonexistent[params.x]}}" as any },
      },
    });
    const config: IFormConfig = {
      version: 2,
      fields: { shipping: { templateRef: "address" } as any },
    };
    resolveTemplates(config);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("builds _templateMeta in dev mode", () => {
    registerFormTemplate("address", {
      fields: { street: { type: "Textbox", label: "Street" } },
    });
    const config: IFormConfig = {
      version: 2,
      fields: { shipping: { templateRef: "address" } as any },
    };
    const resolved = resolveTemplates(config);
    expect(resolved._templateMeta?.["shipping.street"]).toEqual({
      template: "address",
      fragment: "shipping",
      originalName: "street",
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run packages/core/src/__tests__/templates/TemplateResolver.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement TemplateResolver**

This is the largest module. Implement the 11-step resolution pipeline as described in the spec. Key functions: `resolveTemplates()`, `expandTemplateRef()`, `rewriteRules()`, `rewriteExpression()`, `mergePorts()`, `expandWizardFragments()`, `expandFieldOrder()`.

The implementation should:
- Walk `config.fields`, find `ITemplateFieldRef` entries via `isTemplateFieldRef()`
- Resolve params using `interpolateDeep()` from ExpressionInterpolator
- Expand into prefixed field names in a flat `Record<string, IFieldConfig>`
- Apply `templateOverrides` (shallow merge) and `defaultValues`
- Recurse for nested templateRefs (with cycle detection via a resolution stack Set)
- Rewrite rule conditions and effects with prefixed field names
- Rewrite `$values.X` in `computedValue` to `$values.{prefix}.X`
- Merge ports with prefixed paths
- Expand wizard `fragments` arrays to field name lists
- Build `_templateMeta` map
- Return `IResolvedFormConfig`

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run packages/core/src/__tests__/templates/TemplateResolver.test.ts`
Expected: PASS (all tests)

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/templates/TemplateResolver.ts packages/core/src/__tests__/templates/TemplateResolver.test.ts
git commit -m "feat: add TemplateResolver — 11-step resolution pipeline"
```

---

## Task 5: Connection Compiler

**Files:**
- Create: `packages/core/src/templates/ConnectionCompiler.ts`
- Test: `packages/core/src/__tests__/templates/ConnectionCompiler.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// packages/core/src/__tests__/templates/ConnectionCompiler.test.ts
import { describe, it, expect, vi } from "vitest";
import { compileConnections } from "../../templates/ConnectionCompiler";

describe("ConnectionCompiler", () => {
  const resolvedPorts: Record<string, string[]> = {
    "shipping.allFields": ["shipping.name", "shipping.email", "shipping.street"],
    "billing.allFields": ["billing.name", "billing.email", "billing.street"],
  };

  it("compiles copyValues to computedValue rules", () => {
    const rules = compileConnections([{
      name: "copy",
      when: { field: "toggle", operator: "equals", value: true },
      source: { fragment: "shipping", port: "allFields" },
      target: { fragment: "billing", port: "allFields" },
      effect: "copyValues",
    }], resolvedPorts);

    expect(rules).toHaveLength(1);
    const effectFields = rules[0].then?.fields ?? {};
    expect(effectFields["billing.name"]?.computedValue).toBe("$root.shipping.name");
    expect(effectFields["billing.email"]?.computedValue).toBe("$root.shipping.email");
    expect(effectFields["billing.street"]?.computedValue).toBe("$root.shipping.street");
  });

  it("compiles hide to hidden rules", () => {
    const rules = compileConnections([{
      name: "hideAll",
      when: { field: "toggle", operator: "equals", value: true },
      source: { fragment: "shipping", port: "allFields" },
      target: { fragment: "billing", port: "allFields" },
      effect: "hide",
    }], resolvedPorts);

    const effectFields = rules[0].then?.fields ?? {};
    expect(effectFields["billing.name"]?.hidden).toBe(true);
    expect(effectFields["billing.email"]?.hidden).toBe(true);
  });

  it("compiles readOnly to readOnly rules", () => {
    const rules = compileConnections([{
      name: "lockAll",
      when: { field: "toggle", operator: "equals", value: true },
      source: { fragment: "shipping", port: "allFields" },
      target: { fragment: "billing", port: "allFields" },
      effect: "readOnly",
    }], resolvedPorts);

    const effectFields = rules[0].then?.fields ?? {};
    expect(effectFields["billing.name"]?.readOnly).toBe(true);
  });

  it("matches ports by field suffix, not array index", () => {
    const ports: Record<string, string[]> = {
      "a.port": ["a.x", "a.y"],
      "b.port": ["b.y", "b.x"],  // different order
    };
    const rules = compileConnections([{
      name: "copy",
      when: { field: "toggle", operator: "equals", value: true },
      source: { fragment: "a", port: "port" },
      target: { fragment: "b", port: "port" },
      effect: "copyValues",
    }], ports);

    const effectFields = rules[0].then?.fields ?? {};
    expect(effectFields["b.x"]?.computedValue).toBe("$root.a.x");
    expect(effectFields["b.y"]?.computedValue).toBe("$root.a.y");
  });

  it("warns on mismatched port fields", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const ports: Record<string, string[]> = {
      "a.port": ["a.x", "a.y", "a.z"],
      "b.port": ["b.x", "b.y"],  // missing z
    };
    compileConnections([{
      name: "copy",
      when: { field: "t", operator: "equals", value: true },
      source: { fragment: "a", port: "port" },
      target: { fragment: "b", port: "port" },
      effect: "copyValues",
    }], ports);

    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run packages/core/src/__tests__/templates/ConnectionCompiler.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement ConnectionCompiler**

`compileConnections(connections, resolvedPorts)` → `IRule[]`. For each connection, look up source and target port field lists from `resolvedPorts`. Match by field suffix (strip the fragment prefix to get the local name). For each matched pair, generate the appropriate effect (`computedValue`, `hidden`, or `readOnly`). Warn on unmatched fields.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run packages/core/src/__tests__/templates/ConnectionCompiler.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/templates/ConnectionCompiler.ts packages/core/src/__tests__/templates/ConnectionCompiler.test.ts
git commit -m "feat: add ConnectionCompiler — connections to IRule[] compilation"
```

---

## Task 6: ComposedFormBuilder (`composeForm()`)

**Files:**
- Create: `packages/core/src/templates/ComposedFormBuilder.ts`
- Test: `packages/core/src/__tests__/templates/ComposedFormBuilder.test.ts`

- [ ] **Step 1: Write failing tests**

Test: fragments expanded with prefix, standalone fields merged, connections compiled, fieldOrder expanded, wizard config passed through, lookups forwarded.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run packages/core/src/__tests__/templates/ComposedFormBuilder.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement ComposedFormBuilder**

`composeForm(options)` → `IFormConfig`. Orchestrates: build IFormConfig from fragments + fields, add connections as rules, call `resolveTemplates()`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run packages/core/src/__tests__/templates/ComposedFormBuilder.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/templates/ComposedFormBuilder.ts packages/core/src/__tests__/templates/ComposedFormBuilder.test.ts
git commit -m "feat: add composeForm() orchestrator"
```

---

## Task 7: Dependency Graph & Core Modifications

Modify existing files to support qualified dotted paths for fragment fields.

**Files:**
- Modify: `packages/core/src/helpers/ConditionEvaluator.ts:108-114`
- Modify: `packages/core/src/helpers/ExpressionEngine.ts:147-155`
- Modify: `packages/core/src/helpers/RuleEngine.ts` (multiple functions)
- Modify: `packages/core/src/helpers/FormosaicHelper.ts`
- Modify: `packages/core/src/helpers/WizardHelper.ts`
- Test: `packages/core/src/__tests__/templates/DependencyGraphQualified.test.ts`

- [ ] **Step 1: Write failing test for extractConditionDependencies returning full paths**

```typescript
// packages/core/src/__tests__/templates/DependencyGraphQualified.test.ts
import { describe, it, expect } from "vitest";
import { extractConditionDependencies } from "../../helpers/ConditionEvaluator";
import { extractExpressionDependencies } from "../../helpers/ExpressionEngine";
import { buildDependencyGraph, buildDefaultFieldStates } from "../../helpers/RuleEngine";

describe("Qualified dependency paths", () => {
  it("extractConditionDependencies returns full dotted path", () => {
    const deps = extractConditionDependencies({
      field: "shipping.address.country",
      operator: "equals",
      value: "US",
    });
    expect(deps).toContain("shipping.address.country");
  });

  it("extractExpressionDependencies returns full dotted path", () => {
    const deps = extractExpressionDependencies("$values.shipping.address.qty * 2");
    expect(deps).toContain("shipping.address.qty");
  });

  it("buildDependencyGraph creates edges for dotted field names", () => {
    const fields = {
      "shipping.country": {
        type: "Dropdown",
        label: "Country",
        options: [],
      },
      "shipping.state": {
        type: "Dropdown",
        label: "State",
        options: [],
        rules: [{
          when: { field: "shipping.country", operator: "equals", value: "US" },
          then: { options: [{ value: "CA", label: "California" }] },
        }],
      },
    };
    const graph = buildDependencyGraph(fields);
    expect(graph["shipping.country"]?.has("shipping.state")).toBe(true);
  });

  it("buildDefaultFieldStates wires dependentFields for dotted names", () => {
    const fields = {
      "shipping.country": {
        type: "Dropdown",
        label: "Country",
        options: [],
      },
      "shipping.state": {
        type: "Dropdown",
        label: "State",
        options: [],
        rules: [{
          when: { field: "shipping.country", operator: "equals", value: "US" },
          then: { options: [{ value: "CA", label: "California" }] },
        }],
      },
    };
    const states = buildDefaultFieldStates(fields);
    expect(states["shipping.country"].dependentFields).toContain("shipping.state");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run packages/core/src/__tests__/templates/DependencyGraphQualified.test.ts`
Expected: FAIL (extractConditionDependencies returns "shipping" not "shipping.address.country")

- [ ] **Step 3: Fix `extractConditionDependencies` in ConditionEvaluator.ts**

At `packages/core/src/helpers/ConditionEvaluator.ts:112-113`, change:

```typescript
// FROM:
deps.add(fieldRef.includes('.') ? fieldRef.split('.')[0] : fieldRef);
// TO:
deps.add(fieldRef);
```

This returns the full dotted path. Existing non-dotted field names are unaffected.

**IMPORTANT — FieldArray safety:** This change means FieldArray item paths like `items.0.name` would also return the full path. However, FieldArray item fields are NOT registered as top-level keys in the `fields` record (they live inside `IFieldConfig.items`), so `buildDependencyGraph` will not have `items.0.name` as a graph key — the `if (dep in graph)` check at RuleEngine.ts:30 will fail gracefully. The FieldArray parent `items` IS a top-level key, so rules referencing just `items` still work. This is safe because resolved template fields ARE top-level keys (e.g., `shipping.address.street`), so the full path matches correctly for them.

- [ ] **Step 4: Fix `extractExpressionDependencies` in ExpressionEngine.ts**

At `packages/core/src/helpers/ExpressionEngine.ts:149`, change:

```typescript
// FROM:
const valuesRegex = /\$(?:values|root)\.([a-zA-Z_][a-zA-Z0-9_]*)/g;
// TO:
const valuesRegex = /\$(?:values|root)\.([a-zA-Z_][a-zA-Z0-9_.]*)/g;
```

This captures the full dotted path (e.g., `shipping.address.qty`), aligning with the regex already used in `evaluateExpression()` at lines 110, 116, 122.

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run packages/core/src/__tests__/templates/DependencyGraphQualified.test.ts`
Expected: PASS

- [ ] **Step 6: Run existing tests to check for regressions**

Run: `npx vitest run packages/core/src/__tests__/helpers/RuleEngine.test.ts packages/core/src/__tests__/helpers/ExpressionEngine.test.ts packages/core/src/__tests__/helpers/CspSafeExpression.test.ts`
Expected: PASS (existing behavior unchanged for non-dotted field names)

- [ ] **Step 7: Fix WizardHelper.ts — null-safe step.fields**

At `packages/core/src/helpers/WizardHelper.ts`, update all functions that access `step.fields` to handle the now-optional property:

```typescript
// getStepFields (line 20-25):
// Change: return step.fields.filter(...)
// To: return (step.fields ?? []).filter(...)

// getStepFieldOrder (line 32):
// Change: return visibleSteps.flatMap(step => step.fields);
// To: return visibleSteps.flatMap(step => step.fields ?? []);

// validateStepFields (line 39):
// Change: return step.fields.filter(...)
// To: return (step.fields ?? []).filter(...)
```

- [ ] **Step 8: Run WizardHelper tests**

Run: `npx vitest run packages/core/src/__tests__/helpers/WizardHelper.test.ts`
Expected: PASS

- [ ] **Step 9: Fix FormosaicHelper.ts — use getNestedValue for dotted field names**

At `packages/core/src/helpers/FormosaicHelper.ts`, add a local `getNestedValue` utility (same pattern as `ConditionEvaluator.ts:119-127`) and replace bracket notation in three functions:

```typescript
// Add near the top of the file:
function getNestedFormValue(obj: IEntityData, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

// In CheckValidDropdownOptions: replace formValues[fieldName] with getNestedFormValue(formValues, fieldName)
// In CheckDefaultValues: replace formValues[fieldName] with getNestedFormValue(formValues, fieldName)
// In InitOnCreateFormState: replace entityData[fieldName] with getNestedFormValue(entityData, fieldName) where applicable
```

- [ ] **Step 10: Run FormosaicHelper tests**

Run: `npx vitest run packages/core/src/__tests__/helpers/FormosaicHelper.test.ts`
Expected: PASS

- [ ] **Step 11: Fix DependencyGraphValidator.ts — handle dotted field names**

At `packages/core/src/helpers/DependencyGraphValidator.ts`, the existing Kahn's algorithm works on graph edges passed in. Since `buildDependencyGraph` now creates edges with full dotted paths (e.g., `"shipping.country" → "shipping.state"`), the validator receives these full paths automatically. Verify the existing tests pass with no changes. If the validator does string matching on field names, update to handle dots.

Run: `npx vitest run packages/core/src/__tests__/helpers/DependencyGraphValidator.test.ts`
Expected: PASS

- [ ] **Step 12: Run full test suite to check for regressions**

Run: `npx vitest run`
Expected: All 6296+ tests PASS

- [ ] **Step 13: Commit**

```bash
git add packages/core/src/helpers/ConditionEvaluator.ts packages/core/src/helpers/ExpressionEngine.ts packages/core/src/helpers/WizardHelper.ts packages/core/src/helpers/FormosaicHelper.ts packages/core/src/__tests__/templates/DependencyGraphQualified.test.ts
git commit -m "feat: support qualified dotted paths in dependency graph, wizard, and form helpers"
```

---

## Task 8: JSX Components (ComposedForm, FormFragment, FormConnection, FormField)

**Files:**
- Create: `packages/core/src/components/ComposedForm.tsx`
- Create: `packages/core/src/components/FormFragment.tsx`
- Create: `packages/core/src/components/FormConnection.tsx`
- Create: `packages/core/src/components/FormField.tsx`
- Test: `packages/core/src/__tests__/templates/ComposedForm.test.tsx`

- [ ] **Step 1: Create declaration-only components**

```typescript
// packages/core/src/components/FormFragment.tsx
import { IFormConfig } from "../types/IFormConfig";
import { IFieldConfig } from "../types/IFieldConfig";

export interface IFormFragmentProps {
  template?: string;
  config?: IFormConfig;
  params?: Record<string, unknown>;
  prefix: string;
  overrides?: Record<string, Partial<IFieldConfig>>;
  defaultValues?: Record<string, unknown>;
}

/** Declaration-only component. Returns null. Props read by ComposedForm. */
export function FormFragment(_props: IFormFragmentProps): null {
  return null;
}
FormFragment.displayName = "FormFragment";
```

```typescript
// packages/core/src/components/FormConnection.tsx
import { ICondition } from "../types/ICondition";

export interface IFormConnectionProps {
  name: string;
  when: ICondition;
  source: { fragment: string; port: string };
  target: { fragment: string; port: string };
  effect: "copyValues" | "hide" | "readOnly" | "computeFrom";
}

/** Declaration-only component. Returns null. Props read by ComposedForm. */
export function FormConnection(_props: IFormConnectionProps): null {
  return null;
}
FormConnection.displayName = "FormConnection";
```

```typescript
// packages/core/src/components/FormField.tsx
import { IFieldConfig } from "../types/IFieldConfig";

export interface IFormFieldProps {
  name: string;
  config: IFieldConfig;
}

/** Declaration-only component. Returns null. Props read by ComposedForm. */
export function FormField(_props: IFormFieldProps): null {
  return null;
}
FormField.displayName = "FormField";
```

- [ ] **Step 2: Write failing tests for ComposedForm**

Test that `<ComposedForm>` reads children props via `React.Children.forEach`, builds a config, and renders a `<Formosaic>`. Use `@testing-library/react`.

- [ ] **Step 3: Implement ComposedForm**

`<ComposedForm>` uses `React.Children.forEach` to walk children, extracts props from `FormFragment`, `FormConnection`, and `FormField` elements by checking `child.type.displayName`. Builds `IComposeFormOptions`, calls `composeForm()` in `useMemo`, renders `<Formosaic>`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run packages/core/src/__tests__/templates/ComposedForm.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/components/ComposedForm.tsx packages/core/src/components/FormFragment.tsx packages/core/src/components/FormConnection.tsx packages/core/src/components/FormField.tsx packages/core/src/__tests__/templates/ComposedForm.test.tsx
git commit -m "feat: add ComposedForm JSX composition API"
```

---

## Task 9: Formosaic Auto-Resolution & Public API Exports

**Files:**
- Modify: `packages/core/src/components/Formosaic.tsx`
- Modify: `packages/core/src/index.ts`

- [ ] **Step 1: Modify Formosaic.tsx to auto-detect and resolve templates**

Near the top of the `Formosaic` component (after extracting `formConfig`), add template detection:

```typescript
import { isTemplateFieldRef } from "../types/IFormTemplate";
import { resolveTemplates } from "../templates/TemplateResolver";

// Inside the component, after: const fields = formConfig?.fields ?? props.fieldConfigs ?? {};
// Add:
const hasTemplateRefs = Object.values(fields).some(f => isTemplateFieldRef(f));
const resolvedConfig = hasTemplateRefs && formConfig
  ? resolveTemplates(formConfig)
  : formConfig;
const resolvedFields = resolvedConfig?.fields ?? fields;
// Then use resolvedFields and resolvedConfig downstream instead of fields and formConfig
```

- [ ] **Step 2: Add exports to index.ts**

Append to `packages/core/src/index.ts`:

```typescript
// Template & Composition
export { registerFormTemplate, registerFormTemplates, getFormTemplate, resetFormTemplates } from "./templates/TemplateRegistry";
export { registerLookupTables, getLookupTable, resetLookupTables } from "./templates/LookupRegistry";
export { resolveTemplates } from "./templates/TemplateResolver";
export { composeForm } from "./templates/ComposedFormBuilder";
export { ComposedForm } from "./components/ComposedForm";
export type { IComposedFormProps } from "./components/ComposedForm";
export { FormFragment } from "./components/FormFragment";
export type { IFormFragmentProps } from "./components/FormFragment";
export { FormConnection } from "./components/FormConnection";
export type { IFormConnectionProps } from "./components/FormConnection";
export { FormField } from "./components/FormField";
export type { IFormFieldProps } from "./components/FormField";
```

- [ ] **Step 3: Build the package**

Run: `npm run build:core`
Expected: Build succeeds, no TypeScript errors

- [ ] **Step 4: Run full test suite**

Run: `npm run test`
Expected: All tests PASS (6296+ existing + new template tests)

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/components/Formosaic.tsx packages/core/src/index.ts
git commit -m "feat: auto-resolve templates in Formosaic, export public API"
```

---

## Task 10: Wizard Fragment Integration Tests

**Files:**
- Test: `packages/core/src/__tests__/templates/WizardFragmentIntegration.test.ts`

- [ ] **Step 1: Write integration tests**

Test: outer wizard with `fragments`, fragment-internal sub-wizard inline mode, fragment-internal sub-wizard nested mode, mixed `fields` + `fragments` on a step, `visibleWhen` on steps with fragments.

- [ ] **Step 2: Run tests**

Run: `npx vitest run packages/core/src/__tests__/templates/WizardFragmentIntegration.test.ts`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add packages/core/src/__tests__/templates/WizardFragmentIntegration.test.ts
git commit -m "test: wizard + fragment integration tests"
```

---

## Task 11: FormDevTools Template Provenance

**Files:**
- Modify: `packages/core/src/components/FormDevTools.tsx`

- [ ] **Step 1: Add "Source" column to Deps tab**

In `FormDevTools.tsx`, in the Deps tab section, read `_templateMeta` from the config (passed via context or props) and display a "Source" column showing the template name and fragment prefix for each field.

- [ ] **Step 2: Run Storybook to visually verify**

Run: `npm run storybook`
Navigate to FormDevTools stories, verify the Deps tab shows template provenance for composed forms.

- [ ] **Step 3: Commit**

```bash
git add packages/core/src/components/FormDevTools.tsx
git commit -m "feat: show template provenance in FormDevTools Deps tab"
```

---

## Task 12: Final Build, Full Test Suite, Clean Up

- [ ] **Step 1: Build all packages**

Run: `npm run build`
Expected: All 13 packages build successfully

- [ ] **Step 2: Run full test suite**

Run: `npm run test`
Expected: All tests PASS

- [ ] **Step 3: Run E2E tests**

Run: `npm run test:e2e`
Expected: All 54 E2E tests PASS (no regressions)

- [ ] **Step 4: Final commit with any remaining clean-up**

```bash
git add -A
git commit -m "chore: template & composition system — final cleanup"
```
