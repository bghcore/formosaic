# Value Functions Reference

This document covers value functions in `form-engine` -- imperative, named functions that compute or set field values at specific lifecycle moments. It also covers how value functions differ from computed values (`computedValue`).

All value function infrastructure is in `packages/core/src/helpers/ValueFunctionRegistry.ts`.

---

## Built-in Value Functions

| Name | What It Does | Parameters Used | Returns | When Triggered |
|---|---|---|---|---|
| `setDate` | Sets the field to the current date/time | None | `new Date()` | On create / on dependency trigger |
| `setDateIfNull` | Sets the field to the current date/time only if the field has no existing value | `fieldValue` | `new Date()` if `fieldValue` is falsy; otherwise returns the existing `fieldValue` | On create / on dependency trigger |
| `setLoggedInUser` | Sets the field to the current user's identity object | `currentUserId` | `{ id: currentUserId }` if `currentUserId` is truthy; otherwise `undefined` | On create |
| `inheritFromParent` | Copies the value from the parent entity using the same field name | `fieldName`, `parentEntity` | `parentEntity[fieldName]` if `parentEntity` exists; otherwise `undefined` | On create |

### Detailed Descriptions

#### setDate

Sets the field value to a `Date` object representing the current moment. Ignores all context parameters.

```typescript
// Internal implementation
setDate: () => new Date()
```

**Typical use:** Auto-populating "created date" or "modified date" fields.

**Example config:**
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

#### setDateIfNull

Like `setDate`, but only sets the value if the field is currently empty/null. If the field already has a value, it preserves the existing value.

```typescript
// Internal implementation
setDateIfNull: ({ fieldValue }) => fieldValue ? fieldValue : new Date()
```

**Typical use:** Setting a default date that should not be overwritten on subsequent evaluations.

**Example config:**
```json
{
  "firstContactDate": {
    "type": "DateControl",
    "label": "First Contact Date",
    "computedValue": "$fn.setDateIfNull()"
  }
}
```

#### setLoggedInUser

Sets the field to an object containing the current user's ID. The `currentUserId` is passed through from the form's `currentUserUpn` prop.

```typescript
// Internal implementation
setLoggedInUser: ({ currentUserId }) => currentUserId ? { id: currentUserId } : undefined
```

**Typical use:** Auto-populating "created by" or "assigned to" fields with the current user.

**Example config:**
```json
{
  "createdBy": {
    "type": "ReadOnly",
    "label": "Created By",
    "computedValue": "$fn.setLoggedInUser()",
    "computeOnCreateOnly": true
  }
}
```

#### inheritFromParent

Copies the value from the parent entity's same-named field. When editing a child entity (e.g., a sub-task within a project), this function pulls the value from the parent entity using the field's own name as the key.

```typescript
// Internal implementation
inheritFromParent: ({ fieldName, parentEntity }) =>
  parentEntity ? parentEntity[fieldName] as SubEntityType : undefined
```

**Typical use:** Pre-populating child entity fields with parent values (e.g., inheriting a project's program name into a child task).

**Example config:**
```json
{
  "programName": {
    "type": "ReadOnly",
    "label": "Program",
    "computedValue": "$fn.inheritFromParent()",
    "computeOnCreateOnly": true
  }
}
```

---

## How Value Functions Work

### Configuration

In v2, value functions are activated through the `computedValue` property using the `$fn.` prefix:

```json
{
  "myField": {
    "computedValue": "$fn.setDate()",
    "computeOnCreateOnly": true
  }
}
```

The `$fn.functionName()` syntax tells the engine to look up `functionName` in the `ValueFunctionRegistry` and invoke it.

### Lifecycle / Trigger Points

Value functions execute at two distinct points:

#### 1. On Create

When a form is initialized in "create" mode, the engine calls `GetValueFunctionsOnCreate()` which collects all fields where:
- `valueFunction` is set (non-empty)
- `computeOnCreateOnly` is `true`

These functions run once during `InitOnCreateBusinessRules()` before the form renders, and their return values are set into the form via `setValue()`.

#### 2. On Dependency Trigger

When a field's value changes, the business rules engine evaluates dependent fields. If a dependent field has a value function and `computeOnCreateOnly` is **not** `true`, the function is re-executed with the updated context.

This is handled by `GetValueFunctionsOnDirtyFields()`, which iterates through dirty field names, finds their dependent fields, and collects value functions to execute -- **excluding** any with `computeOnCreateOnly: true`.

### The `computeOnCreateOnly` Flag

| `computeOnCreateOnly` | Behavior |
|---|---|
| `true` | Value function runs **only once** during form creation. It does not re-run when dependent fields change during editing. |
| `false` / not set | Value function runs on creation **and** re-runs whenever a triggering dependency field changes. |

### Execution Flow

```
IFieldConfig { computedValue: "$fn.setDate()", computeOnCreateOnly: true }
  |
  v
Business Rules Engine extracts -> { fieldName: "createdDate", valueFunction: "setDate" }
  |
  v
executeValueFunction("createdDate", "setDate", fieldValue, parentEntity, currentUserId)
  |
  v
Registry lookup: valueFunctionRegistry["setDate"]
  |
  v
Function call: setDate({ fieldName: "createdDate", fieldValue: undefined, parentEntity: {...}, currentUserId: "user@example.com" })
  |
  v
Returns: new Date()
  |
  v
setValue("createdDate", <Date object>)
```

### The `executeValueFunction` Helper

The core execution helper is:

```typescript
function executeValueFunction(
  fieldName: string,
  valueFunction: string,    // Name of the registered function
  fieldValue?: SubEntityType,
  parentEntity?: IEntityData,
  currentUserId?: string
): SubEntityType
```

If the named function is not found in the registry, it returns `undefined`.

---

## Custom Value Functions

### Registration

Use `registerValueFunctions()` to add custom value functions:

```typescript
import { registerValueFunctions, ValueFunction } from "@form-engine/core";

const calculateFullName: ValueFunction = ({ fieldName, fieldValue, parentEntity, currentUserId }) => {
  // Access other entity values through parentEntity or use your own logic
  const firstName = parentEntity?.["firstName"] as string;
  const lastName = parentEntity?.["lastName"] as string;
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  return fieldValue;
};

const setDefaultPriority: ValueFunction = ({ fieldValue }) => {
  return fieldValue ?? "Medium";
};

registerValueFunctions({
  calculateFullName,
  setDefaultPriority,
});
```

### Function Signature

```typescript
type ValueFunction = (context: {
  fieldName: string;           // Name of the field this function is being executed for
  fieldValue?: SubEntityType;  // Current value of the field (may be undefined on create)
  parentEntity?: IEntityData;  // Parent entity data (if editing a child entity)
  currentUserId?: string;      // Current user's UPN/ID from FormEngine props
}) => SubEntityType;
```

**`SubEntityType`** is defined as: `string | number | boolean | Date | object | null | undefined`

### Example: Custom Computed Value

```typescript
import { registerValueFunctions, ValueFunction } from "@form-engine/core";

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

Field config:
```json
{
  "estimatedEndDate": {
    "type": "DateControl",
    "label": "Estimated End Date",
    "computedValue": "$fn.calculateEndDate()",
    "readOnly": true
  }
}
```

### Example: Generate Identifier

```typescript
const generateIdentifier: ValueFunction = ({ currentUserId }) => {
  const timestamp = Date.now().toString(36);
  const userPrefix = (currentUserId || "unknown").substring(0, 3).toUpperCase();
  return `${userPrefix}-${timestamp}`;
};

registerValueFunctions({ generateIdentifier });
```

### Registration API Reference

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

**Important:** `registerValueFunctions()` **merges** into the existing registry. Call it at application startup before rendering forms. Registering a name that already exists overwrites the previous function.

---

## Value Functions vs Computed Values (computedValue)

`form-engine` has two mechanisms for deriving field values: **value functions** (imperative, via `$fn.` prefix) and **computed values** (declarative, via `$values.` expressions). They serve different purposes and have different execution models.

### Comparison Table

| Aspect | Value Functions | Computed Value Expressions |
|---|---|---|
| **Definition style** | Imperative: named function registered in code | Declarative: expression string in JSON config |
| **Config syntax** | `computedValue: "$fn.functionName()"` | `computedValue: "$values.qty * $values.price"` |
| **Registration** | `registerValueFunctions({ name: fn })` | None needed -- expression is evaluated inline |
| **Access to data** | `fieldName`, `fieldValue`, `parentEntity`, `currentUserId` | All form field values via `$values.fieldName` syntax |
| **Trigger mechanism** | Explicitly on create, or when dependency fields fire | Reactively when any referenced `$values.fieldName` changes |
| **Execution timing** | During `InitOnCreateBusinessRules` or `GetValueFunctionsOnDirtyFields` | During dependency evaluation |
| **`computeOnCreateOnly` support** | Yes -- can restrict to creation only | No -- always reactive |
| **Complexity** | Unlimited (full JavaScript/TypeScript) | Simple arithmetic and string expressions |
| **Side effects** | Possible (but discouraged) | None -- pure expressions |
| **Type safety** | Full TypeScript typing | String-based, no compile-time checking |

### When to Use Value Functions

- You need access to `currentUserId` or `parentEntity`.
- The computation requires API calls, complex logic, or external dependencies.
- You want the function to run only during entity creation (`computeOnCreateOnly: true`).
- The logic is reusable across multiple forms/fields.

**Example:**
```json
{
  "assignee": {
    "computedValue": "$fn.setLoggedInUser()",
    "computeOnCreateOnly": true
  }
}
```

### When to Use Computed Value Expressions

- The value is a simple arithmetic expression based on other form field values.
- You want reactive updates whenever referenced fields change.
- No external data or complex logic is needed.
- You prefer configuration-only solutions without writing code.

**Example:**
```json
{
  "totalCost": {
    "type": "Number",
    "label": "Total Cost",
    "readOnly": true,
    "computedValue": "$values.quantity * $values.unitPrice"
  }
}
```

### Combining Both

A field should typically use one mechanism or the other, not both. If you need initial-value logic **and** reactive computation, consider:

1. Use a value function with `computeOnCreateOnly: true` for the initial value.
2. Use business rule dependencies to trigger recalculation when dependent fields change.

Or use a computed value expression for reactive computation and `defaultValue` for the initial state.

### Static Values: `defaultValue`

For simple static values that do not need functions:

- **`defaultValue`**: Applied whenever the field is visible and its value is `null`.

```json
{
  "priority": {
    "type": "Dropdown",
    "label": "Priority",
    "defaultValue": "Medium",
    "options": [
      { "value": "Low", "label": "Low" },
      { "value": "Medium", "label": "Medium" },
      { "value": "High", "label": "High" }
    ]
  }
}
```
