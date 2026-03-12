---
title: Condition Operators
---

# Condition Operators

Conditions are used in `IRule.when`, `IValidationRule.when`, and `IWizardStep.when`. A condition is either a **field comparison** (`IFieldCondition`) or a **logical combination** (`ILogicalCondition`).

---

## Scalar Operators

These operators compare a single field value against a scalar `value`.

| Operator | Description | Example |
|---|---|---|
| `equals` | Loose equality (`String(a) === String(b)`) | `{ field: "status", operator: "equals", value: "Active" }` |
| `notEquals` | Opposite of equals | `{ field: "type", operator: "notEquals", value: "Hidden" }` |
| `greaterThan` | Numeric `>` | `{ field: "age", operator: "greaterThan", value: 18 }` |
| `lessThan` | Numeric `<` | `{ field: "score", operator: "lessThan", value: 50 }` |
| `greaterThanOrEqual` | Numeric `>=` | `{ field: "qty", operator: "greaterThanOrEqual", value: 1 }` |
| `lessThanOrEqual` | Numeric `<=` | `{ field: "qty", operator: "lessThanOrEqual", value: 100 }` |
| `contains` | String includes substring | `{ field: "name", operator: "contains", value: "Corp" }` |
| `notContains` | String does not include substring | `{ field: "email", operator: "notContains", value: "@test" }` |
| `startsWith` | String starts with prefix | `{ field: "code", operator: "startsWith", value: "US-" }` |
| `endsWith` | String ends with suffix | `{ field: "file", operator: "endsWith", value: ".pdf" }` |
| `in` | Field value is one of the given array | `{ field: "status", operator: "in", value: ["Active", "Pending"] }` |
| `notIn` | Field value is not in the given array | `{ field: "role", operator: "notIn", value: ["guest", "banned"] }` |
| `isEmpty` | Field value is null, undefined, `""`, `[]`, or `{}` | `{ field: "notes", operator: "isEmpty" }` |
| `isNotEmpty` | Opposite of isEmpty | `{ field: "email", operator: "isNotEmpty" }` |
| `matches` | Field value matches a regex pattern | `{ field: "zip", operator: "matches", value: "^\\d{5}$" }` |

---

## Array Operators

These operators work on field values that are arrays (e.g. multiselect fields, tag lists, field arrays).

| Operator | Description | Notes |
|---|---|---|
| `arrayContains` | Array includes a specific item (loose equality) | Returns `false` if field is not an array |
| `arrayNotContains` | Array does not include a specific item | Returns `true` if field is not an array |
| `arrayLengthEquals` | Array length equals N | Returns `false` if field is not an array |
| `arrayLengthGreaterThan` | Array length is strictly greater than N | Returns `false` if field is not an array |
| `arrayLengthLessThan` | Array length is strictly less than N | Returns `false` if field is not an array |

### Examples

```typescript
// Show a "Remove items" button only when the tag list has items
{
  when: { field: "tags", operator: "arrayLengthGreaterThan", value: 0 },
  then: { hidden: false },
}

// Require a reason when more than 3 products are selected
{
  when: { field: "selectedProducts", operator: "arrayLengthGreaterThan", value: 3 },
  then: { required: true },
}

// Hide a warning when a specific required tag is present
{
  when: { field: "categories", operator: "arrayContains", value: "verified" },
  then: { hidden: true },
}
```

---

## Logical Operators

Logical operators combine multiple conditions. They use `ILogicalCondition` which has an `operator` of `"and"`, `"or"`, or `"not"` and a `conditions` array.

| Operator | Description |
|---|---|
| `and` | All child conditions must be true |
| `or` | At least one child condition must be true |
| `not` | Inverts the first child condition |

### Examples

```typescript
// AND: both conditions must be true
{
  operator: "and",
  conditions: [
    { field: "country", operator: "equals", value: "US" },
    { field: "age", operator: "greaterThanOrEqual", value: 21 },
  ],
}

// OR: either condition triggers the rule
{
  operator: "or",
  conditions: [
    { field: "role", operator: "equals", value: "admin" },
    { field: "role", operator: "equals", value: "superuser" },
  ],
}

// NOT: inverts the condition
{
  operator: "not",
  conditions: [
    { field: "status", operator: "equals", value: "Inactive" },
  ],
}

// Nested: (A AND B) OR C
{
  operator: "or",
  conditions: [
    {
      operator: "and",
      conditions: [
        { field: "type", operator: "equals", value: "enterprise" },
        { field: "seats", operator: "greaterThan", value: 100 },
      ],
    },
    { field: "override", operator: "equals", value: true },
  ],
}
```

---

## Type Reference

```typescript
interface IFieldCondition {
  field: string;
  operator: ScalarOperator | ArrayOperator;
  value?: unknown;
}

interface ILogicalCondition {
  operator: "and" | "or" | "not";
  conditions: ICondition[];
}

type ICondition = IFieldCondition | ILogicalCondition;
```
