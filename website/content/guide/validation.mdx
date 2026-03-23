---
title: Validators Reference
---

# Validators Reference

This document covers all validation capabilities in Formosaic, including the 9 built-in sync validators, 5 factory functions for creating parameterized validators, async validation support, cross-field validation, and patterns for writing custom validators.

All validation infrastructure is in `packages/core/src/helpers/ValidationRegistry.ts`.

---

## Built-in Sync Validators

These validators are registered by default and can be referenced by name in `IFieldConfig.validate`:

| Name | Checks | Error Message | Skips Empty |
|---|---|---|---|
| `EmailValidation` | Valid email format (`user@domain.tld`) | `"Invalid email address"` | Yes |
| `PhoneNumberValidation` | Valid phone number pattern (international formats supported) | `"Invalid phone number"` | Yes |
| `YearValidation` | Integer year between 1900 and 2100 | `"Invalid year"` | Yes |
| `Max150KbValidation` | String content does not exceed 150 KB | `"Content exceeds maximum size of 150KB"` | Yes |
| `Max32KbValidation` | String content does not exceed 32 KB | `"Content exceeds maximum size of 32KB"` | Yes |
| `isValidUrl` | String starts with `http://` or `https://` | `"Invalid URL"` | Yes |
| `NoSpecialCharactersValidation` | String contains only alphanumeric characters, spaces, hyphens, underscores, and periods | `"Special characters are not allowed"` | Yes |
| `CurrencyValidation` | Valid currency format (optional negative, digits, optional 1-2 decimal places) | `"Invalid currency format"` | Yes |
| `UniqueInArrayValidation` | Array contains no duplicate values | `"Duplicate value: {value}"` | Yes |

**"Skips Empty"** means the validator returns `undefined` (passes) when the value is `null`, `undefined`, or an empty string. Use the `required` flag on `IFieldConfig` for presence validation.

---

## Factory Validators

Factory functions create parameterized validators. These must be registered at startup using `registerValidators()`.

### createMinLengthValidation(min)

Creates a validator that checks whether the string value has at least `min` characters.

```typescript
import { registerValidators, createMinLengthValidation } from "@formosaic/core";

registerValidators({
  MinLength5: createMinLengthValidation(5),
  MinLength10: createMinLengthValidation(10),
});
```

### createMaxLengthValidation(max)

Creates a validator that checks whether the string value has at most `max` characters.

### createNumericRangeValidation(min, max)

Creates a validator that checks whether the value (parsed as a number) falls within the specified range.

```typescript
registerValidators({
  PercentageRange: createNumericRangeValidation(0, 100),
  AgeRange: createNumericRangeValidation(0, 150),
});
```

### createPatternValidation(regex, message)

Creates a validator that tests the string value against a custom regex.

```typescript
registerValidators({
  AlphaOnly: createPatternValidation(/^[a-zA-Z]+$/, "Only letters are allowed"),
  USZipCode: createPatternValidation(/^\d{5}(-\d{4})?$/, "Invalid US ZIP code"),
});
```

### createRequiredIfValidation(dependentFieldName, dependentFieldValues)

Creates a cross-field-aware sync validator that makes the current field required conditionally.

```typescript
registerValidators({
  RequiredIfStatusActive: createRequiredIfValidation("status", ["Active", "InProgress"]),
});
```

---

## Async Validators

Async validators are used for server-side validation (e.g., uniqueness checks, API-based validation). They run after all sync validators pass.

### Registration

```typescript
import { registerValidators, ValidatorFn } from "@formosaic/core";

const checkUniqueEmail: ValidatorFn = async (value, entityData, signal) => {
  if (!value || typeof value !== "string") return undefined;

  const response = await fetch(`/api/check-email?email=${encodeURIComponent(value)}`, {
    signal,
  });

  if (signal?.aborted) return undefined;

  const result = await response.json();
  return result.exists ? "This email is already in use" : undefined;
};

registerValidators({
  UniqueEmailCheck: checkUniqueEmail,
});
```

### Function Signature

```typescript
type ValidatorFn = (
  value: unknown,
  entityData?: IEntityData,
  signal?: AbortSignal
) => string | undefined | Promise<string | undefined>;
```

### Debounce Behavior

Use `debounceMs` in the validation rule to debounce async validation triggering:

```json
{
  "username": {
    "type": "Textbox",
    "label": "Username",
    "validate": [
      { "validator": "CheckUsernameAvailable", "async": true, "debounceMs": 500 }
    ]
  }
}
```

### Execution Order

1. **Sync validators** run first (fast fail). If any sync validator returns an error, async validators are **skipped**.
2. **Async validators** run only after all sync validators pass. They run sequentially, stopping at the first error.
3. If the `AbortSignal` is aborted at any point, the async validator returns `undefined` (no error).

---

## Cross-Field Validators

Cross-field validators receive all form values and can validate relationships between multiple fields.

```typescript
const dateRangeValidation: ValidatorFn = (value, allValues) => {
  const startDate = allValues?.["startDate"] as string;
  const endDate = allValues?.["endDate"] as string;

  if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
    return "End date must be after start date";
  }
  return undefined;
};

registerValidators({
  DateRangeCheck: dateRangeValidation,
});
```

Field config:
```json
{
  "endDate": {
    "type": "DateControl",
    "label": "End Date",
    "validate": [{ "validator": "DateRangeCheck", "crossField": true }]
  }
}
```

---

## Validator Metadata

Use `registerValidatorMetadata()` to attach display metadata to custom validators for use in tooling.

```typescript
import { registerValidators, registerValidatorMetadata } from "@formosaic/core";

registerValidatorMetadata("minWords", {
  label: "Minimum Word Count",
  description: "Ensures the field contains a minimum number of words.",
  params: {
    min: { type: "number", label: "Minimum words", required: true },
  },
});
```

---

## Registration API Reference

```typescript
function registerValidators(custom: Record<string, ValidatorFn>): void;
function getValidator(name: string): ValidatorFn | undefined;
function getValidationRegistry(): Record<string, ValidatorFn>;
```

**Important:** `registerValidators()` **merges** into the existing registry -- it does not replace it. Call it at application startup before rendering any forms.
