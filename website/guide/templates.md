---
title: Form Templates & Composition
---

# Form Templates & Composition

Formosaic supports reusable, JSON-serializable form templates with typed parameters. Define field groups once, reference them across forms, and compose complex forms from fragments.

## Why Templates?

Forms often share field groups -- addresses, contact info, payment details. Without templates, you copy-paste field definitions across configs. Templates solve this:

- **DRY** -- Define once, use everywhere
- **Parameterized** -- Same template, different behavior (US vs CA addresses)
- **Composable** -- Assemble complex forms from smaller pieces
- **JSON-serializable** -- Templates are pure data, not code

## Defining a Template

Templates are registered globally or defined inline in your form config.

### Global Registration

```ts
import { registerFormTemplate } from '@formosaic/core';

registerFormTemplate('address', {
  params: {
    country: { type: 'string', default: 'US' },
    required: { type: 'boolean', default: true },
  },
  fields: {
    street: { type: 'Textbox', label: 'Street', required: '{{params.required}}' },
    city: { type: 'Textbox', label: 'City', required: '{{params.required}}' },
    state: {
      type: 'Dropdown',
      label: "{{params.country == 'CA' ? 'Province' : 'State'}}",
      options: '{{$lookup.stateOptions[params.country]}}',
    },
    zip: {
      type: 'Textbox',
      label: "{{params.country == 'UK' ? 'Postcode' : 'ZIP Code'}}",
    },
  },
  ports: {
    allFields: ['street', 'city', 'state', 'zip'],
  },
});
```

### Inline Templates

```ts
const config: IFormConfig = {
  version: 2,
  templates: {
    address: { /* same as above */ },
  },
  fields: {
    shipping: { templateRef: 'address', templateParams: { country: 'US' } },
  },
};
```

## Template Parameters

Parameters use `{{expression}}` syntax, resolved at template expansion time (before rendering).

| Syntax | Description | Example |
|--------|-------------|---------|
| `{{params.name}}` | Parameter value | `{{params.country}}` -> `"US"` |
| `{{params.x == 'y' ? 'a' : 'b'}}` | Ternary | `{{params.country == 'CA' ? 'Province' : 'State'}}` |
| `{{$lookup.table[params.key]}}` | Lookup table access | `{{$lookup.stateOptions[params.country]}}` |

### Lookup Tables

Static data referenced in template expressions:

```ts
import { registerLookupTables } from '@formosaic/core';

registerLookupTables({
  stateOptions: {
    US: [{ value: 'CA', label: 'California' }, { value: 'NY', label: 'New York' }],
    CA: [{ value: 'ON', label: 'Ontario' }, { value: 'BC', label: 'British Columbia' }],
  },
});
```

## Using Templates in Forms

Reference a template by name with `templateRef`:

```json
{
  "version": 2,
  "fields": {
    "shipping": {
      "templateRef": "address",
      "templateParams": { "country": "US" }
    },
    "sameAsShipping": {
      "type": "Toggle",
      "label": "Billing same as shipping"
    },
    "billing": {
      "templateRef": "address",
      "templateParams": { "country": "US" },
      "templateOverrides": {
        "street": { "label": "Billing Street" }
      }
    }
  }
}
```

After resolution, the fields become: `shipping.street`, `shipping.city`, `shipping.state`, `shipping.zip`, `sameAsShipping`, `billing.street`, etc.

### Template Overrides

Patch specific fields without a new parameter:

```json
{
  "templateRef": "address",
  "templateOverrides": {
    "zip": { "required": false },
    "state": { "label": "Region" }
  }
}
```

### Default Values

Pre-fill a fragment with bulk values:

```json
{
  "templateRef": "address",
  "defaultValues": {
    "street": "123 Main St",
    "city": "Springfield",
    "state": "IL"
  }
}
```

## Templates Using Templates

Templates can reference other templates:

```ts
registerFormTemplate('contactInfo', {
  params: {
    country: { type: 'string', default: 'US' },
  },
  fields: {
    name: { type: 'Textbox', label: 'Full Name', required: true },
    email: { type: 'Textbox', label: 'Email', validate: [{ name: 'email' }] },
    phone: { type: 'Textbox', label: 'Phone' },
    address: {
      templateRef: 'address',
      templateParams: { country: '{{params.country}}' },
    },
  },
  ports: {
    identity: ['name', 'email'],
    address: ['address.street', 'address.city', 'address.state', 'address.zip'],
  },
});
```

## Runtime Composition

### Config-Driven: `composeForm()`

```ts
import { composeForm } from '@formosaic/core';

const config = composeForm({
  fragments: {
    shipping: { template: 'contactInfo', params: { country: 'US' } },
    billing: { template: 'contactInfo', params: { country: 'US' } },
  },
  fields: {
    sameAsShipping: { type: 'Toggle', label: 'Same as shipping' },
  },
  connections: [{
    name: 'copyShippingToBilling',
    when: { field: 'sameAsShipping', operator: 'equals', value: true },
    source: { fragment: 'shipping', port: 'allFields' },
    target: { fragment: 'billing', port: 'allFields' },
    effect: 'copyValues',
  }],
});

// config is a standard IFormConfig — pass to <Formosaic>
<Formosaic formConfig={config} />
```

### JSX API: `<ComposedForm>`

```tsx
import { ComposedForm, FormFragment, FormField, FormConnection } from '@formosaic/core';

<ComposedForm onSave={handleSave}>
  <FormField name="sameAsShipping" config={{ type: 'Toggle', label: 'Same as shipping' }} />
  <FormFragment template="contactInfo" prefix="shipping" params={{ country: 'US' }} />
  <FormFragment template="contactInfo" prefix="billing" params={{ country: 'US' }} />
  <FormConnection
    name="copyShippingToBilling"
    when={{ field: 'sameAsShipping', operator: 'equals', value: true }}
    source={{ fragment: 'shipping', port: 'allFields' }}
    target={{ fragment: 'billing', port: 'allFields' }}
    effect="copyValues"
  />
</ComposedForm>
```

### Connection Effects

| Effect | Behavior |
|--------|----------|
| `copyValues` | Target fields get `computedValue` from source fields |
| `hide` | Target fields become hidden |
| `readOnly` | Target fields become read-only |
| `computeFrom` | Same as `copyValues` (semantic alias) |

Ports match by **field suffix** (not array position). `shipping.name` maps to `billing.name`.

## Wizard Integration

Wizard steps can reference fragments:

```json
{
  "wizard": {
    "steps": [
      { "id": "shipping", "title": "Shipping", "fragments": ["shipping"] },
      { "id": "billing", "title": "Billing", "fields": ["sameAsShipping"], "fragments": ["billing"] },
      { "id": "payment", "title": "Payment", "fields": ["paymentMethod"] }
    ]
  }
}
```

Fragments expand to their resolved field names during template resolution.

### Sub-Wizard Modes

Templates with their own wizard steps support two modes via `fragmentWizardMode`:

- **`"inline"`** (default) -- Sub-wizard steps are flattened into the outer wizard
- **`"nested"`** -- The fragment is treated as a single step with internal navigation

## Rules Inside Templates

Template-internal rules use **local field names**. They are automatically prefixed during resolution:

```ts
registerFormTemplate('address', {
  fields: {
    country: { type: 'Dropdown', label: 'Country', options: [...] },
    state: { type: 'Dropdown', label: 'State', options: [] },
  },
  rules: [{
    when: { field: 'country', operator: 'equals', value: 'US' },
    then: { fields: { state: { options: usStates } } },
  }],
});
```

To reference fields **outside** the template, use `$root`:

```ts
rules: [{
  when: { field: '$root.globalToggle', operator: 'equals', value: true },
  then: { hidden: true },
}]
```

## Expression Scoping

Inside templates, `$values` references are **local by default**:

- `$values.street` -> resolves to `$values.shipping.address.street` (prefixed)
- `$root.fieldName` -> resolves to `$values.fieldName` (root scope)

## Debugging

FormDevTools shows template provenance in the **Deps tab** -- a "Source" column showing which template and fragment each field came from. See [Debugging Rules](/guide/debugging-rules) for more on using FormDevTools.

## Error Handling

| Error | When |
|-------|------|
| `TemplateResolutionError` (template_not_found) | `templateRef` references unregistered template |
| `TemplateResolutionError` (template_cycle) | Circular template references (A -> B -> A) |
| `TemplateResolutionError` (template_max_depth) | Nesting exceeds max depth (default: 10) |
| Console warning | Missing optional param, missing lookup table, port referencing unknown field |
