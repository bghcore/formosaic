# Data Entry Example

A purchase order form demonstrating field arrays, computed values, dropdown dependencies, and cross-field validation.

## What It Demonstrates

- **Field arrays**: Repeating line items (description, quantity, unit price, computed line total) with min/max item constraints
- **Computed values**: `lineTotal = $values.quantity * $values.unitPrice`, subtotal via `$fn.sumLineItems()`, tax and grand total via `$values` expressions
- **Dropdown dependencies**: Subcategory options change based on selected category (Electronics, Office, Furniture)
- **Cross-field validation**: End date must be after start date
- **Numeric range validation**: Quantity (1-9999), non-negative prices
- **Value functions**: Custom `sumLineItems` registered via `registerValueFunctions()`

## Fields

### Header
| Field         | Type        | Notes                                       |
|---------------|-------------|---------------------------------------------|
| invoiceNumber | Textbox     | Auto-computed on create, read-only           |
| category      | Dropdown    | Electronics/Office/Furniture                 |
| subcategory   | Dropdown    | Options filtered by category                 |
| startDate     | DateControl | Required                                     |
| endDate       | DateControl | Must be after startDate                      |

### Line Items (Field Array)
| Field       | Type   | Notes                                |
|-------------|--------|--------------------------------------|
| description | Textbox| Required                             |
| quantity    | Number | Min 1, max 9999                      |
| unitPrice   | Number | Non-negative                         |
| lineTotal   | Number | Read-only, computed: qty * unitPrice |

### Totals
| Field      | Type     | Notes                             |
|------------|----------|-----------------------------------|
| subtotal   | Number   | Read-only, sum of line totals     |
| taxRate    | Dropdown | 0%, 5%, 8%, 10%, 13%             |
| taxAmount  | Number   | Read-only, subtotal * taxRate     |
| grandTotal | Number   | Read-only, subtotal + taxAmount   |

### Other
| Field | Type     | Notes    |
|-------|----------|----------|
| notes | Textarea | Optional |

## Key Patterns

```typescript
// Computed value expression for line total
lineTotal: {
  type: "Number",
  readOnly: true,
  computedValue: "$values.quantity * $values.unitPrice",
}

// Dropdown dependency via rules
rules: [{
  when: { field: "category", operator: "equals", value: "electronics" },
  then: {
    fields: {
      subcategory: {
        options: [
          { value: "laptops", label: "Laptops" },
          { value: "monitors", label: "Monitors" },
          // ...
        ],
      },
    },
  },
}]

// Cross-field validation
validate: [{
  name: "custom",
  message: "End date must be after start date",
  params: { crossField: "startDate", comparison: "greaterThan" },
}]

// Field array config
lineItems: {
  type: "FieldArray",
  minItems: 1,
  maxItems: 20,
  items: { description: {...}, quantity: {...}, unitPrice: {...}, lineTotal: {...} },
}
```
