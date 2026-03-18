# Template & Composition System Design

**Date:** 2026-03-18
**Status:** Approved (pending implementation plan)
**Scope:** `@formosaic/core` — new subsystem, additive to existing architecture

## Problem

Formosaic forms are defined as monolithic `IFormConfig` objects. Organizations with shared field groups (addresses, contact info, payment details) must copy-paste field definitions across configs. There is no mechanism for reusable form fragments, parameterized templates, or runtime form assembly from composable parts.

## Goals

1. **Reusable templates** — Define field groups once, reference them by name with typed parameters
2. **JSON-serializable** — Templates, parameters, and compositions are pure data (no functions required)
3. **Runtime composition** — Assemble forms dynamically from fragments with cross-fragment rules
4. **Wizard integration** — Outer wizards organize fragments into steps; fragments can define internal sub-wizards
5. **Zero breaking changes** — Templates are a pre-processing layer; the rules engine, validation, and rendering pipeline see only resolved `IFormConfig`

## Non-Goals

- Visual form builder (separate future project)
- Server-side template storage/fetching (consumer responsibility)
- Template versioning or migration tooling

---

## Section 1: Template Registry

Templates are JSON-serializable field group definitions with typed parameter contracts and port declarations.

### Template Schema

```typescript
interface IFormTemplate<TParams extends Record<string, unknown> = Record<string, unknown>> {
  params?: Record<string, ITemplateParamSchema>;
  fields: Record<string, IFieldConfig | ITemplateFieldRef>;
  fieldOrder?: string[];
  rules?: IRule[];
  wizard?: IWizardConfig;
  ports?: Record<string, string[]>;
}

interface ITemplateParamSchema {
  type: "string" | "number" | "boolean";
  enum?: unknown[];
  default?: unknown;
  required?: boolean;
}

interface ITemplateFieldRef {
  templateRef: string;
  templateParams?: Record<string, unknown>;
  templateOverrides?: Record<string, Partial<IFieldConfig>>;
}
```

### JSON Example

```json
{
  "templates": {
    "address": {
      "params": {
        "country": { "type": "string", "enum": ["US", "CA", "UK"], "default": "US" },
        "required": { "type": "boolean", "default": true }
      },
      "fields": {
        "street": { "type": "Textbox", "label": "Street", "required": "{{params.required}}" },
        "city": { "type": "Textbox", "label": "City", "required": "{{params.required}}" },
        "state": {
          "type": "Dropdown",
          "label": "{{params.country == 'CA' ? 'Province' : params.country == 'UK' ? 'County' : 'State'}}",
          "options": "{{$lookup.stateOptions[params.country]}}"
        },
        "zip": {
          "type": "Textbox",
          "label": "{{params.country == 'UK' ? 'Postcode' : 'ZIP Code'}}",
          "validate": [{ "name": "pattern", "params": { "pattern": "{{$lookup.zipPatterns[params.country]}}" } }]
        }
      },
      "ports": {
        "allFields": ["street", "city", "state", "zip"],
        "location": ["state", "zip"]
      }
    }
  }
}
```

### Templates Using Templates

```json
{
  "templates": {
    "contactInfo": {
      "params": {
        "country": { "type": "string", "enum": ["US", "CA", "UK"], "default": "US" }
      },
      "fields": {
        "name": { "type": "Textbox", "label": "Full Name", "required": true },
        "email": { "type": "Textbox", "label": "Email", "validate": [{ "name": "email" }] },
        "phone": { "type": "Textbox", "label": "Phone" },
        "address": {
          "templateRef": "address",
          "templateParams": { "country": "{{params.country}}", "required": true }
        }
      },
      "ports": {
        "identity": ["name", "email"],
        "address": "address.*"
      }
    }
  }
}
```

### Registry API

```typescript
// Programmatic registration (typed)
registerFormTemplate<AddressParams>("address", templateDef);

// Retrieve
getFormTemplate("address"): IFormTemplate | undefined;

// Reset (for testing)
resetFormTemplates(): void;

// Bulk registration
registerFormTemplates(templates: Record<string, IFormTemplate>): void;
```

### Lookup Tables

Static data referenced via `$lookup` in template expressions. JSON-serializable.

```json
{
  "lookups": {
    "stateOptions": {
      "US": [{ "value": "AL", "label": "Alabama" }],
      "CA": [{ "value": "AB", "label": "Alberta" }],
      "UK": [{ "value": "LND", "label": "London" }]
    },
    "zipPatterns": {
      "US": "^\\d{5}(-\\d{4})?$",
      "CA": "^[A-Z]\\d[A-Z] \\d[A-Z]\\d$",
      "UK": "^[A-Z]{1,2}\\d[A-Z\\d]? \\d[A-Z]{2}$"
    }
  }
}
```

Registry API:
```typescript
registerLookupTables(tables: Record<string, unknown>): void;
getLookupTable(name: string): unknown | undefined;
resetLookupTables(): void;
```

### Port Declarations

Ports are named groups of fields that a template exposes for cross-fragment wiring. They enable controlled cross-communication without breaking template portability.

- Ports reference local field names (pre-prefix)
- Wildcard syntax: `"address.*"` expands to all fields under the `address` sub-template
- Ports are resolved to prefixed paths during template resolution

### Template Overrides

When referencing a template, sparse overrides can patch specific fields without requiring a new parameter:

```json
{
  "templateRef": "address",
  "templateParams": { "country": "US" },
  "templateOverrides": {
    "zip": { "required": false },
    "state": { "label": "Region" }
  }
}
```

Overrides are shallow-merged into the resolved field configs after parameter interpolation.

---

## Section 2: Template Resolution

A pure pre-processing transform that converts template references into a flat `IFieldConfig` tree. Runs before the rules engine, validation, or rendering.

### Resolution Pipeline

```
Input: IFormConfig with templateRef fields + registered templates + lookup tables
  1. Collect     — Walk config tree, find all templateRef nodes
  2. Params      — Evaluate {{expression}} strings against params + $lookup tables
  3. Expand      — Replace templateRef node with template's fields, prefixed by field name
  4. Override    — Apply templateOverrides (shallow merge per field)
  5. Recurse     — If expanded fields contain templateRef, repeat (with cycle detection)
  6. Rewrite     — Prefix internal rule field references to match resolved paths
  7. Scope       — Rewrite $values references in expressions to use prefixed paths
  8. Merge ports — Collect port declarations, rewrite to prefixed paths
  9. Attach meta — Build _templateMeta mapping for DevTools (dev mode only)
  10. Output     — Standard IFormConfig with no template references remaining
```

### Path Prefixing Example

```
Input:
  fields.shipping = { templateRef: "contactInfo", templateParams: { country: "US" } }

After resolution:
  fields.shipping.name           = { type: "Textbox", label: "Full Name", ... }
  fields.shipping.email          = { type: "Textbox", label: "Email", ... }
  fields.shipping.phone          = { type: "Textbox", label: "Phone", ... }
  fields.shipping.address.street = { type: "Textbox", label: "Street", ... }
  fields.shipping.address.city   = { type: "Textbox", label: "City", ... }
  fields.shipping.address.state  = { type: "Dropdown", label: "State", ... }
  fields.shipping.address.zip    = { type: "Textbox", label: "ZIP Code", ... }
```

### Expression Interpolation

`{{expression}}` strings in template fields are evaluated using the existing `expr-eval` engine:

- `{{params.country}}` — resolves to the provided parameter value
- `{{params.country == 'CA' ? 'Province' : 'State'}}` — ternary expressions
- `{{$lookup.stateOptions[params.country]}}` — lookup table access
- `{{params.required}}` — boolean parameter for required/hidden/readOnly

Interpolation happens at resolution time (before rendering), not at runtime.

### Expression Scoping

Inside templates, `$values` references are **local by default**:
- `$values.street` inside the address template resolves to `$values.shipping.address.street` after prefixing
- `$root.fieldName` escapes the fragment scope and references the form root
- This mirrors how `$parent` already works for FieldArrays

### Cycle Detection

Track the resolution stack during recursive expansion. If template A references template B which references template A, throw a `ConfigValidationError` in dev mode. Same pattern as `DependencyGraphValidator`.

Maximum resolution depth: 10 levels (configurable). Exceeding this throws a descriptive error.

### Template Metadata (Dev Mode)

Resolution produces a `_templateMeta` map attached to the resolved config:

```typescript
interface ITemplateMeta {
  [resolvedFieldName: string]: {
    template: string;      // e.g., "contactInfo"
    fragment: string;      // e.g., "shipping"
    originalName: string;  // e.g., "name" (pre-prefix)
  };
}
```

Used by FormDevTools to show template provenance. Stripped in production builds.

### Public API

```typescript
// Core resolution function
resolveTemplates(
  config: IFormConfig,
  options?: {
    templates?: Record<string, IFormTemplate>;  // inline templates (merged with registry)
    lookups?: Record<string, unknown>;           // inline lookups (merged with registry)
    maxDepth?: number;                           // default: 10
  }
): IResolvedFormConfig;

// IResolvedFormConfig extends IFormConfig with:
interface IResolvedFormConfig extends IFormConfig {
  _templateMeta?: ITemplateMeta;          // dev mode only
  _resolvedPorts?: Record<string, string[]>;  // prefixed port mappings
}
```

---

## Section 3: Runtime Composition

Two APIs for assembling forms from fragments: a config-driven function and a JSX component layer. Both produce the same resolved `IFormConfig`.

### Config-Driven API: `composeForm()`

```typescript
interface IComposeFormOptions {
  fragments: Record<string, IFragmentDef>;
  fields?: Record<string, IFieldConfig>;       // standalone fields alongside fragments
  connections?: IFormConnection[];
  fieldOrder?: string[];                        // intermixes fragment prefixes + field names
  wizard?: IWizardConfig;
  settings?: IFormSettings;
  lookups?: Record<string, unknown>;
}

interface IFragmentDef {
  template?: string;                           // template name from registry
  config?: IFormConfig;                        // inline config (alternative to template)
  params?: Record<string, unknown>;            // template parameters
  prefix: string;                              // field name prefix
  overrides?: Record<string, Partial<IFieldConfig>>;
}

interface IFormConnection {
  name: string;
  when: ICondition;
  source: { fragment: string; port: string };
  target: { fragment: string; port: string };
  effect: "copyValues" | "hide" | "readOnly" | "computeFrom" | "syncOptions";
}

function composeForm(options: IComposeFormOptions): IFormConfig;
```

#### Example

```typescript
const config = composeForm({
  fragments: {
    shipping: { template: "contactInfo", params: { country: "US" }, prefix: "shipping" },
    billing: { template: "contactInfo", params: { country: "US" }, prefix: "billing" },
    payment: { config: paymentConfig, prefix: "payment" },
  },
  fields: {
    sameAsShipping: { type: "Toggle", label: "Same as shipping address" },
  },
  connections: [
    {
      name: "copyShippingToBilling",
      when: { field: "sameAsShipping", operator: "equals", value: true },
      source: { fragment: "shipping", port: "allFields" },
      target: { fragment: "billing", port: "allFields" },
      effect: "copyValues",
    },
  ],
  fieldOrder: ["shipping", "sameAsShipping", "billing", "payment"],
});

// Result is a normal IFormConfig
<Formosaic config={config} onSave={handleSave} />
```

### Connection Effect Compilation

Connections are sugar that compile to standard `IRule[]`. No new runtime concepts.

| Effect | Compiles To |
|--------|-------------|
| `copyValues` | `computedValue: "$values.{source.prefix}.{fieldName}"` on each target port field |
| `hide` | `hidden: true` on each target port field |
| `readOnly` | `readOnly: true` on each target port field |
| `computeFrom` | `computedValue: "$values.{source.prefix}.{fieldName}"` (same as copyValues, kept for semantic clarity) |
| `syncOptions` | `options` effect copying source field's current options to target |

#### Expansion Example

```
Connection: copyShippingToBilling
  source: shipping.allFields → ["shipping.name", "shipping.email", "shipping.phone", "shipping.address.street", ...]
  target: billing.allFields → ["billing.name", "billing.email", "billing.phone", "billing.address.street", ...]

Compiles to rules:
  { when: { field: "sameAsShipping", operator: "equals", value: true },
    then: { fields: {
      "billing.name": { computedValue: "$root.shipping.name" },
      "billing.email": { computedValue: "$root.shipping.email" },
      "billing.phone": { computedValue: "$root.shipping.phone" },
      "billing.address.street": { computedValue: "$root.shipping.address.street" },
      "billing.address.city": { computedValue: "$root.shipping.address.city" },
      "billing.address.state": { computedValue: "$root.shipping.address.state" },
      "billing.address.zip": { computedValue: "$root.shipping.address.zip" },
    }}
  }
```

### JSX API: `<ComposedForm>` / `<FormFragment>`

```tsx
<ComposedForm onSave={handleSave} settings={settings}>
  <FormField name="sameAsShipping" config={{ type: "Toggle", label: "Same as shipping" }} />

  <FormFragment template="contactInfo" params={{ country: "US" }} prefix="shipping" />
  <FormFragment template="contactInfo" params={{ country: "US" }} prefix="billing" />
  <FormFragment config={paymentConfig} prefix="payment" />

  <FormConnection
    name="copyShippingToBilling"
    when={{ field: "sameAsShipping", operator: "equals", value: true }}
    source={{ fragment: "shipping", port: "allFields" }}
    target={{ fragment: "billing", port: "allFields" }}
    effect="copyValues"
  />
</ComposedForm>
```

#### How it works

1. `<ComposedForm>` collects children declaratively via React context
2. Builds an `IComposeFormOptions` object from the JSX tree
3. Calls `composeForm()` internally
4. Renders `<Formosaic config={resolvedConfig} />` with all standard props forwarded

`<FormFragment>`, `<FormField>`, and `<FormConnection>` are **declaration-only components** — they render nothing themselves. They register their config into the parent `<ComposedForm>` context during render, similar to how React Router's `<Route>` works.

#### Mixing config and JSX

```tsx
const base = composeForm({ fragments: { shipping: ... } });

<ComposedForm config={base}>
  <FormFragment template="contactInfo" prefix="billing" />
  <FormConnection ... />
</ComposedForm>
```

JSX declarations merge into the base config.

### Type-Safe Composition

```typescript
function defineComposedForm<T extends Record<string, IFragmentDef | IFieldConfig>>(
  options: IComposeFormOptions & { fragments: T }
): IFormConfig;
```

TypeScript infers available fragment prefixes and field names for rule targets. Not perfect for deeply nested templates-using-templates, but covers the common case. Runtime `ConfigValidator` catches the rest.

---

## Section 4: Wizard Integration

Bidirectional: outer wizards organize fragments into steps, and fragments can define internal sub-wizards.

### Outer Wizard Referencing Fragments

```typescript
interface IWizardStep {
  id: string;
  title: string;
  fields?: string[];              // existing — top-level field names
  fragments?: string[];           // NEW — fragment prefixes
  visibleWhen?: ICondition;       // existing
  fragmentWizardMode?: "inline" | "nested";  // NEW — default: "inline"
}
```

#### Example

```json
{
  "wizard": {
    "steps": [
      { "id": "shipping", "title": "Shipping", "fragments": ["shipping"] },
      {
        "id": "billing", "title": "Billing",
        "fields": ["sameAsShipping"],
        "fragments": ["billing"],
        "visibleWhen": { "field": "sameAsShipping", "operator": "equals", "value": false }
      },
      { "id": "payment", "title": "Payment", "fragments": ["payment"] }
    ]
  }
}
```

After resolution, `fragments: ["shipping"]` expands to all resolved fields under the `shipping` prefix. The wizard helper sees only flat field names.

### Fragment-Internal Sub-Wizards

Templates can define their own wizard steps:

```json
{
  "templates": {
    "onboarding": {
      "params": {
        "role": { "type": "string", "enum": ["employee", "contractor"] }
      },
      "fields": {
        "personalInfo": { "templateRef": "contactInfo", "templateParams": { "country": "US" } },
        "taxId": { "type": "Textbox", "label": "Tax ID" },
        "bankAccount": { "type": "Textbox", "label": "Bank Account" },
        "startDate": { "type": "DatePicker", "label": "Start Date" }
      },
      "wizard": {
        "steps": [
          { "id": "personal", "title": "Personal Info", "fragments": ["personalInfo"] },
          { "id": "tax", "title": "Tax & Banking", "fields": ["taxId", "bankAccount"] },
          { "id": "schedule", "title": "Schedule", "fields": ["startDate"] }
        ]
      },
      "ports": { "identity": "personalInfo.*" }
    }
  }
}
```

### Sub-Wizard Rendering Modes

**Inline mode** (default): Sub-wizard steps are flattened into the outer wizard with prefixed step IDs.

```
Outer step 1: "Shipping"
Outer step 2: "Onboarding - Personal Info"     ← from fragment
Outer step 3: "Onboarding - Tax & Banking"     ← from fragment
Outer step 4: "Onboarding - Schedule"          ← from fragment
Outer step 5: "Review"
```

Step IDs are prefixed: `onboarding.personal`, `onboarding.tax`, `onboarding.schedule`.

**Nested mode** (`fragmentWizardMode: "nested"`): The fragment renders its own wizard navigation within the outer step. The outer wizard treats the entire fragment as one step.

```
Outer step 1: "Shipping"
Outer step 2: "Onboarding"     ← contains prev/next for 3 internal sub-steps
Outer step 3: "Review"
```

### Validation

Per-step validation works unchanged. `validateStepFields()` receives the expanded field list for the step, whether the fields came from `fields`, `fragments`, or a sub-wizard. No new validation runtime needed.

---

## Section 5: Dependency Graph Enhancement

The only section that modifies existing core code. Required for cross-fragment rules to trigger incremental re-evaluation correctly.

### Current Limitation

```typescript
// Today: "shipping.address.street" → extracts "shipping" only
deps.add(fieldRef.includes('.') ? fieldRef.split('.')[0] : fieldRef);
```

FieldArray indices are dynamic, so top-level tracking was correct. But fragment paths are static and need full tracking.

### Two-Tier Dependency Graph

```typescript
interface IDependencyGraph {
  topLevel: Map<string, Set<string>>;      // existing behavior (FieldArray)
  qualified: Map<string, Set<string>>;     // new: full paths (fragment fields)
}
```

### How it distinguishes fragment vs FieldArray paths

After resolution, each field carries origin metadata (`IResolvedFieldMeta`). The graph builder checks:

- **Fragment field** (source: "template") → full qualified path tracking
- **FieldArray item** (source: "direct", type: "FieldArray") → top-level only (existing behavior)
- **Direct field** (source: "direct") → top-level (existing behavior)

### Incremental Evaluation

```
User changes: shipping.address.country

Graph lookup: qualified["shipping.address.country"]
  → affects: ["shipping.address.state", "shipping.address.zip"]

Only those 2 fields re-evaluate. Same incremental approach as today.
```

### Cross-Fragment Connection Dependencies

Connections produce rules with `$root` references. These appear in the qualified graph:

```
sameAsShipping → ["billing.name", "billing.email", "billing.phone",
                   "billing.address.street", "billing.address.city",
                   "billing.address.state", "billing.address.zip"]
```

### FieldArray Inside Templates

Deep paths like `shipping.lineItems.0.description`:
- `shipping.lineItems` is the tracked qualified node (fragment + FieldArray parent)
- Array indices still collapse to the FieldArray parent
- Consistent rule: fragment prefixes get qualified tracking; FieldArray indices don't

### Cycle Detection

`DependencyGraphValidator` (Kahn's algorithm) works on graph edges. Adding qualified paths means more nodes but the same algorithm. No changes to cycle detection logic.

### Files Changed

| File | Change | Scope |
|------|--------|-------|
| `RuleEngine.ts` | Two-tier graph, qualified path extraction based on field origin | ~50 lines modified |
| `DependencyGraphValidator.ts` | Accept qualified graph alongside topLevel | ~10 lines |
| `FormosaicHelper.ts` | Pass resolution metadata to graph builder | ~5 lines |
| `ConditionEvaluator.ts` | No change (already supports dot paths) | None |
| `ExpressionEngine.ts` | No change (already supports dot paths) | None |

---

## Section 6: Integration Points

How the template system interacts with existing Formosaic subsystems.

### ConfigValidator

Runs **after** template resolution. Validates the resolved `IFormConfig` (flat field names). No changes to ConfigValidator itself — only pipeline ordering.

### FormDevTools

Shows template provenance via `_templateMeta`:
- **Deps tab:** New "Source" column showing template name and fragment prefix
- **Timeline/Rules/Perf tabs:** Operate on resolved field names (no changes needed)

### Analytics (IAnalyticsCallbacks)

Callbacks receive resolved field names (e.g., `shipping.address.street`). This is the correct granularity — consumers can parse the prefix if they need fragment-level analytics.

### Draft Persistence (useDraftPersistence)

Values-only. Works unchanged with resolved field names.

### Locale Registry

No interaction. Template labels are user-provided strings with `{{expression}}` interpolation, not locale keys.

### defineFormConfig / Type Safety

New `defineComposedForm<T>()` helper provides TypeScript inference for composed forms. Falls back to runtime ConfigValidator for cases TypeScript can't infer (deeply nested template chains).

### fieldOrder

Fragment prefixes can appear in `fieldOrder`:

```json
"fieldOrder": ["heading", "shipping", "sameAsShipping", "billing", "payment"]
```

Resolution expands `"shipping"` to the fragment's internal field order. Standalone fields and fragment prefixes can be intermixed freely.

### IFormConfig Schema

Templates are **additive** — new optional properties on `IFormConfig` and `IFieldConfig`:

```typescript
// On IFormConfig (optional)
interface IFormConfig {
  version: 2;                                    // unchanged
  fields: Record<string, IFieldConfig>;          // unchanged
  templates?: Record<string, IFormTemplate>;     // NEW
  lookups?: Record<string, unknown>;             // NEW
  fieldOrder?: string[];
  wizard?: IWizardConfig;
  settings?: IFormSettings;
}

// On IFieldConfig (optional, mutually exclusive with type)
interface IFieldConfig {
  // existing properties...
  templateRef?: string;                          // NEW
  templateParams?: Record<string, unknown>;      // NEW
  templateOverrides?: Record<string, Partial<IFieldConfig>>;  // NEW
}
```

No version bump needed. Fields with `templateRef` are resolved before any downstream processing.

---

## Section 7: New Files

```
packages/core/src/
  templates/
    TemplateRegistry.ts          — registerFormTemplate, getFormTemplate, resetFormTemplates
    LookupRegistry.ts            — registerLookupTables, getLookupTable, resetLookupTables
    TemplateResolver.ts          — resolveTemplates() pipeline (collect, expand, prefix, rewrite)
    ExpressionInterpolator.ts    — {{expression}} evaluation using expr-eval
    ConnectionCompiler.ts        — IFormConnection → IRule[] compilation
    ComposedFormBuilder.ts       — composeForm() orchestrator
  components/
    ComposedForm.tsx             — JSX composition wrapper
    FormFragment.tsx             — Declaration-only fragment component
    FormConnection.tsx           — Declaration-only connection component
    FormField.tsx                — Declaration-only standalone field component
  types/
    IFormTemplate.ts             — IFormTemplate, ITemplateParamSchema, ITemplateFieldRef
    IFormConnection.ts           — IFormConnection, IFragmentDef, IComposeFormOptions
    IResolvedFormConfig.ts       — IResolvedFormConfig, ITemplateMeta, IResolvedFieldMeta
  __tests__/
    TemplateRegistry.test.ts
    TemplateResolver.test.ts
    ExpressionInterpolator.test.ts
    ConnectionCompiler.test.ts
    ComposedFormBuilder.test.ts
    ComposedForm.test.tsx
    WizardFragmentIntegration.test.ts
    DependencyGraphQualified.test.ts
```

### Estimated Modified Files

```
packages/core/src/
  helpers/RuleEngine.ts          — two-tier dependency graph
  helpers/DependencyGraphValidator.ts — accept qualified graph
  helpers/FormosaicHelper.ts     — template resolution before init
  components/FormDevTools.tsx    — template provenance column
  types/IFormConfig.ts           — templates?, lookups? properties
  types/IFieldConfig.ts          — templateRef?, templateParams?, templateOverrides?
  types/IWizardConfig.ts         — fragments?, fragmentWizardMode? on IWizardStep
  index.ts                       — export new public API
```

---

## Section 8: Public API Surface

### New Exports from `@formosaic/core`

```typescript
// Template Registry
export { registerFormTemplate, registerFormTemplates, getFormTemplate, resetFormTemplates } from './templates/TemplateRegistry';
export { registerLookupTables, getLookupTable, resetLookupTables } from './templates/LookupRegistry';

// Resolution
export { resolveTemplates } from './templates/TemplateResolver';

// Composition
export { composeForm } from './templates/ComposedFormBuilder';
export { defineComposedForm } from './types/IResolvedFormConfig';

// Components
export { ComposedForm } from './components/ComposedForm';
export { FormFragment } from './components/FormFragment';
export { FormConnection } from './components/FormConnection';
export { FormField } from './components/FormField';

// Types
export type { IFormTemplate, ITemplateParamSchema, ITemplateFieldRef } from './types/IFormTemplate';
export type { IFormConnection, IFragmentDef, IComposeFormOptions } from './types/IFormConnection';
export type { IResolvedFormConfig, ITemplateMeta, IResolvedFieldMeta } from './types/IResolvedFormConfig';
```

### Possible Subpath Export

`@formosaic/core/templates` — if the template system is large enough to warrant tree-shaking separation (decision deferred to implementation).

---

## Section 9: Example — Complete Checkout Form with Templates

```json
{
  "version": 2,
  "templates": {
    "address": {
      "params": {
        "country": { "type": "string", "default": "US" },
        "required": { "type": "boolean", "default": true }
      },
      "fields": {
        "street": { "type": "Textbox", "label": "Street Address", "required": "{{params.required}}" },
        "city": { "type": "Textbox", "label": "City", "required": "{{params.required}}" },
        "state": {
          "type": "Dropdown",
          "label": "{{params.country == 'CA' ? 'Province' : 'State'}}",
          "options": "{{$lookup.stateOptions[params.country]}}",
          "required": "{{params.required}}"
        },
        "zip": {
          "type": "Textbox",
          "label": "{{params.country == 'UK' ? 'Postcode' : 'ZIP Code'}}",
          "required": "{{params.required}}",
          "validate": [{ "name": "pattern", "params": { "pattern": "{{$lookup.zipPatterns[params.country]}}" } }]
        }
      },
      "rules": [
        {
          "when": { "field": "country", "operator": "equals", "value": "UK" },
          "then": { "fields": { "state": { "label": "County" } } }
        }
      ],
      "ports": {
        "allFields": ["street", "city", "state", "zip"],
        "location": ["state", "zip"]
      }
    }
  },
  "lookups": {
    "stateOptions": {
      "US": [{ "value": "CA", "label": "California" }, { "value": "NY", "label": "New York" }],
      "CA": [{ "value": "ON", "label": "Ontario" }, { "value": "BC", "label": "British Columbia" }]
    },
    "zipPatterns": {
      "US": "^\\d{5}(-\\d{4})?$",
      "CA": "^[A-Z]\\d[A-Z] \\d[A-Z]\\d$"
    }
  },
  "fields": {
    "shipping": {
      "templateRef": "address",
      "templateParams": { "country": "US" }
    },
    "sameAsShipping": {
      "type": "Toggle",
      "label": "Billing address same as shipping"
    },
    "billing": {
      "templateRef": "address",
      "templateParams": { "country": "US" },
      "templateOverrides": {
        "street": { "label": "Billing Street" }
      }
    },
    "paymentMethod": {
      "type": "Dropdown",
      "label": "Payment Method",
      "options": [
        { "value": "card", "label": "Credit Card" },
        { "value": "paypal", "label": "PayPal" }
      ]
    }
  },
  "fieldOrder": ["shipping", "sameAsShipping", "billing", "paymentMethod"],
  "wizard": {
    "steps": [
      { "id": "shipping", "title": "Shipping", "fragments": ["shipping"] },
      {
        "id": "billing", "title": "Billing",
        "fields": ["sameAsShipping"],
        "fragments": ["billing"]
      },
      { "id": "payment", "title": "Payment", "fields": ["paymentMethod"] }
    ]
  }
}
```

---

## Open Questions (Deferred to Implementation)

1. **Should `@formosaic/core/templates` be a separate subpath export?** Depends on bundle size impact after implementation.
2. **Should templates support `defaultValue` at the fragment level?** (e.g., pre-fill an entire address block from saved data) — likely yes, but mechanics TBD.
3. **Should `resolveTemplates()` be callable standalone for tooling/CLI use?** Likely yes (it's a pure function), but export strategy TBD.
