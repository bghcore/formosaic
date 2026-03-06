# Expression Engine Reference

The expression engine evaluates simple expressions against form values at runtime. It is used by the `computedValue` property on `IFieldConfig` to create reactive computed fields that automatically update when their dependencies change.

**Import:**

```typescript
import { evaluateExpression, extractExpressionDependencies } from "@form-eng/core";
```

---

## Syntax

### Field References

Use `$values.fieldName` to reference form field values in expressions.

```
$values.quantity
$values.unitPrice
$values.nested.path
```

Field references support dotted path traversal for nested objects (e.g., `$values.address.city`).

### Arithmetic Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `+` | Addition / String concatenation | `$values.a + $values.b` |
| `-` | Subtraction | `$values.total - $values.discount` |
| `*` | Multiplication | `$values.quantity * $values.unitPrice` |
| `/` | Division | `$values.total / $values.count` |

### Comparison Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `>` | Greater than | `$values.score > 80` |
| `<` | Less than | `$values.startDate < $values.endDate` |
| `>=` | Greater than or equal | `$values.age >= 18` |
| `<=` | Less than or equal | `$values.quantity <= $values.maxQuantity` |
| `===` | Strict equality | `$values.status === "Active"` |
| `!==` | Strict inequality | `$values.type !== "Archived"` |

### Logical Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `&&` | Logical AND | `$values.enabled && $values.verified` |
| `\|\|` | Logical OR | `$values.primary \|\| $values.secondary` |

### Ternary Operator

The conditional (ternary) operator `? :` is supported:

```
$values.quantity > 0 ? $values.quantity * $values.unitPrice : 0
```

### String Concatenation

The `+` operator also handles string concatenation:

```
$values.firstName + " " + $values.lastName
```

### Math Functions

The following `Math` functions are available in the execution context:

| Function | Description | Example |
|----------|-------------|---------|
| `Math.round()` | Round to nearest integer | `Math.round($values.total)` |
| `Math.floor()` | Round down | `Math.floor($values.score)` |
| `Math.ceil()` | Round up | `Math.ceil($values.hours)` |
| `Math.abs()` | Absolute value | `Math.abs($values.delta)` |
| `Math.min()` | Minimum of arguments | `Math.min($values.a, $values.b)` |
| `Math.max()` | Maximum of arguments | `Math.max($values.a, 0)` |

---

## Examples

### Common Expressions

| Expression | Result Type | Use Case |
|-----------|-------------|----------|
| `$values.quantity * $values.unitPrice` | number | Calculate total |
| `$values.firstName + " " + $values.lastName` | string | Full name |
| `$values.startDate < $values.endDate` | boolean | Date comparison |
| `Math.round($values.total * 100) / 100` | number | Round to 2 decimal places |
| `$values.subtotal + $values.tax` | number | Sum fields |
| `$values.price * (1 - $values.discountPercent / 100)` | number | Apply percentage discount |
| `$values.hoursWorked * $values.hourlyRate` | number | Billing calculation |
| `Math.max($values.score, 0)` | number | Clamp to minimum |
| `$values.quantity > 0 ? $values.quantity * $values.unitPrice : 0` | number | Conditional calculation |
| `$values.approved === true && $values.budget > 0` | boolean | Multi-condition check |

### Usage in Field Config

```typescript
const fieldConfigs = {
  quantity: {
    type: "Number",
    label: "Quantity",
    required: true,
  },
  unitPrice: {
    type: "Number",
    label: "Unit Price",
    required: true,
  },
  subtotal: {
    type: "Number",
    label: "Subtotal",
    readOnly: true,
    computedValue: "$values.quantity * $values.unitPrice",
  },
  tax: {
    type: "Number",
    label: "Tax",
    readOnly: true,
    computedValue: "Math.round($values.subtotal * 0.08 * 100) / 100",
  },
  total: {
    type: "Number",
    label: "Total",
    readOnly: true,
    computedValue: "$values.subtotal + $values.tax",
  },
  fullName: {
    type: "ReadOnly",
    label: "Full Name",
    computedValue: "$values.firstName + \" \" + $values.lastName",
  },
};
```

---

## Dependency Extraction

The `extractExpressionDependencies()` function returns the field names referenced in an expression. This is used internally to auto-detect which fields trigger re-evaluation of computed values.

```typescript
import { extractExpressionDependencies } from "@form-eng/core";

const deps = extractExpressionDependencies("$values.quantity * $values.unitPrice");
// Returns: ["quantity", "unitPrice"]

const deps2 = extractExpressionDependencies(
  "Math.round($values.subtotal * 0.08 * 100) / 100"
);
// Returns: ["subtotal"]

const deps3 = extractExpressionDependencies(
  "$values.firstName + ' ' + $values.lastName"
);
// Returns: ["firstName", "lastName"]
```

**Note:** The extraction uses the regex pattern `$values.([a-zA-Z_][a-zA-Z0-9_]*)` which captures the top-level field name only. For nested paths like `$values.address.city`, only `"address"` is extracted as the dependency.

---

## Programmatic Evaluation

You can evaluate expressions directly using `evaluateExpression()`:

```typescript
import { evaluateExpression } from "@form-eng/core";

const result = evaluateExpression(
  "$values.quantity * $values.unitPrice",
  { quantity: 5, unitPrice: 19.99 }
);
// Returns: 99.95

const greeting = evaluateExpression(
  "$values.firstName + ' ' + $values.lastName",
  { firstName: "Jane", lastName: "Doe" }
);
// Returns: "Jane Doe"

const invalid = evaluateExpression(
  "$values.a +++ $values.b",
  { a: 1, b: 2 }
);
// Returns: undefined (invalid expression, no error thrown)
```

---

## Safety

- **No `eval()`**: The engine uses `new Function()` with a restricted scope. Only the `Math` object is available in the execution context.
- **Strict mode**: Expressions are evaluated inside `"use strict"` to prevent accidental global variable access.
- **Null/undefined handling**: Field values that are `null` or `undefined` resolve to the literal `undefined` in the expression. This may cause arithmetic expressions to return `NaN`.
- **Error suppression**: Invalid expressions return `undefined` instead of throwing errors. The `try/catch` around evaluation ensures malformed expressions do not crash the form.
- **String values**: String field values are automatically JSON-stringified (quoted) in the resolved expression to prevent injection.

---

## Limitations

| Limitation | Workaround |
|-----------|------------|
| No custom function calls (only `Math.*`) | Use value functions (`computedValue: "$fn.name()"`) for complex logic |
| No variable declarations (`let`, `const`, `var`) | Keep expressions as single return expressions |
| No loops (`for`, `while`) | Use value functions for iterative calculations |
| No `if`/`else` statements | Use the ternary operator `? :` instead |
| No regex operations | Use validation functions for pattern matching |
| No `Date` operations (`new Date()`, `.getTime()`) | Use value functions for date calculations |
| No array methods (`.map()`, `.filter()`, etc.) | Use value functions for array operations |
| No `typeof`, `instanceof`, or `in` operators | Use value functions for type checking |
| No template literals (`` `${...}` ``) | Use string concatenation with `+` |
| Nested paths in dependency extraction only capture top-level field | Register explicit dependencies if needed |
