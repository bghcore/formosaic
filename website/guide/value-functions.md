---
title: Value Functions Reference
---

# Value Functions Reference

This document covers value functions in Formosaic -- imperative, named functions that compute or set field values at specific lifecycle moments. It also covers how value functions differ from computed values (`computedValue`).

All value function infrastructure is in `packages/core/src/helpers/ValueFunctionRegistry.ts`.

---

## Built-in Value Functions

| Name | What It Does | Returns | When Triggered |
|---|---|---|---|
| `setDate` | Sets the field to the current date/time | `new Date()` | On create / on dependency trigger |
| `setDateIfNull` | Sets the field to the current date/time only if the field has no existing value | `new Date()` if value is falsy; otherwise existing value | On create / on dependency trigger |
| `setLoggedInUser` | Sets the field to the current user's identity object | `{ id: currentUserId }` | On create |
| `inheritFromParent` | Copies the value from the parent entity using the same field name | `parentEntity[fieldName]` | On create |

### Example config

```json
{
  "createdDate": {
    "type": "DateControl",
    "label": "Created Date",
    "computedValue": "$fn.setDate()",
    "computeOnCreateOnly": true,
    "readOnly": true
  }
}
```

---

## Custom Value Functions

### Registration

```typescript
import { registerValueFunctions, ValueFunction } from "@formosaic/core";

const calculateEndDate: ValueFunction = ({ fieldValue, parentEntity }) => {
  const startDate = parentEntity?.["startDate"] as string;
  const durationDays = parentEntity?.["durationDays"] as number;

  if (startDate && durationDays) {
    const end = new Date(startDate);
    end.setDate(end.getDate() + durationDays);
    return end;
  }
  return fieldValue;
};

registerValueFunctions({
  calculateEndDate,
});
```

### Function Signature

```typescript
type ValueFunction = (context: {
  fieldName: string;
  fieldValue?: SubEntityType;
  parentEntity?: IEntityData;
  currentUserId?: string;
}) => SubEntityType;
```

---

## Value Functions vs Computed Values

| Aspect | Value Functions | Computed Value Expressions |
|---|---|---|
| **Definition style** | Imperative: named function registered in code | Declarative: expression string in JSON config |
| **Config syntax** | `computedValue: "$fn.functionName()"` | `computedValue: "$values.qty * $values.price"` |
| **Registration** | `registerValueFunctions({ name: fn })` | None needed |
| **Access to data** | `fieldName`, `fieldValue`, `parentEntity`, `currentUserId` | All form field values via `$values.fieldName` |
| **Complexity** | Unlimited (full JavaScript/TypeScript) | Simple arithmetic and string expressions |
| **`computeOnCreateOnly` support** | Yes | No -- always reactive |

### When to Use Value Functions

- You need access to `currentUserId` or `parentEntity`
- The computation requires API calls, complex logic, or external dependencies
- You want the function to run only during entity creation (`computeOnCreateOnly: true`)

### When to Use Computed Value Expressions

- The value is a simple arithmetic expression based on other form field values
- You want reactive updates whenever referenced fields change
- You prefer configuration-only solutions without writing code

---

## Registration API Reference

```typescript
function registerValueFunctions(custom: Record<string, ValueFunction>): void;
function getValueFunction(name: string): ValueFunction | undefined;
function executeValueFunction(
  fieldName: string,
  valueFunction: string,
  fieldValue?: SubEntityType,
  parentEntity?: IEntityData,
  currentUserId?: string
): SubEntityType;
```

**Important:** `registerValueFunctions()` **merges** into the existing registry. Call it at application startup before rendering forms.
