# Validators Reference

This document covers all validation capabilities in `form-engine`, including the 9 built-in sync validators, 5 factory functions for creating parameterized validators, async validation support, cross-field validation, and patterns for writing custom validators.

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

**"Skips Empty"** means the validator returns `undefined` (passes) when the value is `null`, `undefined`, or an empty string. This is intentional -- use the `required` flag on `IFieldConfig` for presence validation.

### Detailed Validator Descriptions

#### EmailValidation
Validates against the regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`. Catches missing `@` signs, spaces in the address, and missing domain parts.

```json
{
  "email": {
    "type": "Textbox",
    "label": "Email Address",
    "validate": [{ "validator": "EmailValidation" }]
  }
}
```

#### PhoneNumberValidation
Validates against `/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/`. Supports international formats with optional `+` prefix, country codes in parentheses, and common separators (dashes, spaces, dots, slashes).

```json
{
  "phone": {
    "type": "Textbox",
    "label": "Phone Number",
    "validate": [{ "validator": "PhoneNumberValidation" }]
  }
}
```

#### YearValidation
Parses the string value as an integer and checks that it falls within the range 1900-2100 inclusive.

```json
{
  "yearFounded": {
    "type": "Textbox",
    "label": "Year Founded",
    "validate": [{ "validator": "YearValidation" }]
  }
}
```

#### Max150KbValidation / Max32KbValidation
Calculates the byte size of the string value using `new Blob([value]).size` and compares against the KB limit (150 or 32). Created using the internal `createMaxKbValidation(maxKb)` factory.

```json
{
  "description": {
    "type": "Textarea",
    "label": "Description",
    "validate": [{ "validator": "Max150KbValidation" }]
  }
}
```

#### isValidUrl
Tests the value against the regex `/(http(s?)):\/\//i` (defined in `FormConstants.urlRegex`). Requires the string to begin with `http://` or `https://`.

```json
{
  "websiteUrl": {
    "type": "Textbox",
    "label": "Website URL",
    "validate": [{ "validator": "isValidUrl" }]
  }
}
```

#### NoSpecialCharactersValidation
Validates against `/[^a-zA-Z0-9\s\-_.]/`. Rejects the value if any character outside the allowed set is found. Allowed characters: letters (a-z, A-Z), digits (0-9), spaces, hyphens, underscores, and periods.

```json
{
  "projectCode": {
    "type": "Textbox",
    "label": "Project Code",
    "validate": [{ "validator": "NoSpecialCharactersValidation" }]
  }
}
```

#### CurrencyValidation
Validates against `/^-?\d{1,}(\.\d{1,2})?$/`. Accepts integers and decimals with up to 2 decimal places. Supports negative values. Also handles numeric values (coerces to string before testing).

```json
{
  "amount": {
    "type": "Number",
    "label": "Amount",
    "validate": [{ "validator": "CurrencyValidation" }]
  }
}
```

#### UniqueInArrayValidation
Only applies to array values. Iterates through the array and checks for duplicate string representations. Returns the first duplicate found.

```json
{
  "tags": {
    "type": "Multiselect",
    "label": "Tags",
    "validate": [{ "validator": "UniqueInArrayValidation" }]
  }
}
```

---

## Factory Validators

Factory functions create parameterized validators. These must be registered at startup using `registerValidators()`.

### createMinLengthValidation(min: number)

**Signature:** `(min: number) => ValidatorFn`

Creates a validator that checks whether the string value has at least `min` characters.

**Error message:** `"Must be at least {min} characters"`

**Skips empty:** Yes

**Example:**
```typescript
import { registerValidators, createMinLengthValidation } from "@form-eng/core";

registerValidators({
  MinLength5: createMinLengthValidation(5),
  MinLength10: createMinLengthValidation(10),
});
```

```json
{
  "password": {
    "type": "Textbox",
    "label": "Password",
    "validate": [{ "validator": "MinLength10" }]
  }
}
```

---

### createMaxLengthValidation(max: number)

**Signature:** `(max: number) => ValidatorFn`

Creates a validator that checks whether the string value has at most `max` characters.

**Error message:** `"Must be at most {max} characters"`

**Skips empty:** Yes

**Example:**
```typescript
import { registerValidators, createMaxLengthValidation } from "@form-eng/core";

registerValidators({
  MaxLength50: createMaxLengthValidation(50),
  MaxLength255: createMaxLengthValidation(255),
});
```

```json
{
  "title": {
    "type": "Textbox",
    "label": "Title",
    "validate": [{ "validator": "MaxLength255" }]
  }
}
```

---

### createNumericRangeValidation(min: number, max: number)

**Signature:** `(min: number, max: number) => ValidatorFn`

Creates a validator that checks whether the value (parsed as a number) falls within the specified range. Returns `"Must be a number"` if the value cannot be parsed.

**Error message:** `"Must be between {min} and {max}"` (or `"Must be a number"`)

**Skips empty:** Yes (passes on `null`, `undefined`, or `""`)

**Example:**
```typescript
import { registerValidators, createNumericRangeValidation } from "@form-eng/core";

registerValidators({
  PercentageRange: createNumericRangeValidation(0, 100),
  AgeRange: createNumericRangeValidation(0, 150),
});
```

```json
{
  "completionPercent": {
    "type": "Number",
    "label": "Completion %",
    "validate": [{ "validator": "PercentageRange" }]
  }
}
```

---

### createPatternValidation(regex: RegExp, message: string)

**Signature:** `(regex: RegExp, message: string) => ValidatorFn`

Creates a validator that tests the string value against a custom regex. Returns the provided message if the pattern does not match.

**Error message:** The custom `message` parameter.

**Skips empty:** Yes

**Example:**
```typescript
import { registerValidators, createPatternValidation } from "@form-eng/core";

registerValidators({
  AlphaOnly: createPatternValidation(/^[a-zA-Z]+$/, "Only letters are allowed"),
  USZipCode: createPatternValidation(/^\d{5}(-\d{4})?$/, "Invalid US ZIP code"),
});
```

```json
{
  "zipCode": {
    "type": "Textbox",
    "label": "ZIP Code",
    "validate": [{ "validator": "USZipCode" }]
  }
}
```

---

### createRequiredIfValidation(dependentFieldName: string, dependentFieldValues: string[])

**Signature:** `(dependentFieldName: string, dependentFieldValues: string[]) => ValidatorFn`

Creates a cross-field-aware sync validator that makes the current field required conditionally. The field is required only if the specified dependent field's value matches one of the provided values.

**Error message:** `"This field is required"`

**Skips empty:** No -- the point of this validator is to enforce presence when conditions are met. Returns `undefined` if the condition is not met or `entityData` is not available.

**Note:** This validator receives `entityData` (all form values) as the second argument via the `ValidatorFn` signature.

**Example:**
```typescript
import { registerValidators, createRequiredIfValidation } from "@form-eng/core";

registerValidators({
  RequiredIfStatusActive: createRequiredIfValidation("status", ["Active", "InProgress"]),
  RequiredIfTypeExternal: createRequiredIfValidation("partnerType", ["External"]),
});
```

```json
{
  "externalPartnerName": {
    "type": "Textbox",
    "label": "Partner Name",
    "validate": [{ "validator": "RequiredIfTypeExternal" }]
  }
}
```

---

## Async Validators

Async validators are used for server-side validation (e.g., uniqueness checks, API-based validation). They run after all sync validators pass.

### Registration

```typescript
import { registerValidators, ValidatorFn } from "@form-eng/core";

const checkUniqueEmail: ValidatorFn = async (value, entityData, signal) => {
  if (!value || typeof value !== "string") return undefined;

  const response = await fetch(`/api/check-email?email=${encodeURIComponent(value)}`, {
    signal, // Pass AbortSignal for cancellation
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

- **`value`**: The current field value.
- **`entityData`**: All current form values (for cross-field awareness).
- **`signal`**: An `AbortSignal` for cancellation. Check `signal?.aborted` before processing results from async operations.

### AbortSignal Support

The `signal` parameter enables cancellation of in-flight async validations when the user changes the field value before the previous validation completes. Always check `signal?.aborted` after `await` calls to avoid stale results:

```typescript
const validateWithApi: ValidatorFn = async (value, entityData, signal) => {
  if (!value) return undefined;

  const response = await fetch(`/api/validate?v=${value}`, { signal });

  // IMPORTANT: Check abort status after every await
  if (signal?.aborted) return undefined;

  const data = await response.json();
  if (signal?.aborted) return undefined;

  return data.valid ? undefined : data.message;
};
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

When the user types, async validation is deferred for the specified number of milliseconds after the last keystroke. This prevents excessive API calls during rapid input.

### Execution Order

In `RenderField`, validation runs in sequence within the `Controller`'s `rules.validate` function:

1. **Sync validators** run first (fast fail). If any sync validator returns an error, async validators are **skipped**.
2. **Async validators** run only after all sync validators pass. They run sequentially (not in parallel), stopping at the first error.
3. If the `AbortSignal` is aborted at any point, the async validator returns `undefined` (no error).

### Field Config Properties

| Property | Type | Description |
|---|---|---|
| `validate` | `IValidationRule[]` | Array of validation rules. Set `async: true` for async validators, `crossField: true` for cross-field validators. |

### Full Example: Server-Side Uniqueness Check

```typescript
import {
  registerValidators,
  createMinLengthValidation,
  ValidatorFn,
} from "@form-eng/core";

// Register sync validators first (fast fail)
registerValidators({
  MinLength3: createMinLengthValidation(3),
});

// Register async validator
const checkUsernameAvailable: ValidatorFn = async (value, entityData, signal) => {
  if (!value || typeof value !== "string" || value.length < 3) return undefined;

  try {
    const response = await fetch(
      `/api/users/check-username?username=${encodeURIComponent(value)}`,
      { signal }
    );
    if (signal?.aborted) return undefined;
    const data = await response.json();
    return data.available ? undefined : `Username "${value}" is already taken`;
  } catch (err) {
    if (signal?.aborted) return undefined;
    return "Unable to verify username availability";
  }
};

registerValidators({
  CheckUsernameAvailable: checkUsernameAvailable,
});
```

Field config:
```json
{
  "username": {
    "type": "Textbox",
    "label": "Username",
    "required": true,
    "validate": [
      { "validator": "MinLength3" },
      { "validator": "NoSpecialCharactersValidation" },
      { "validator": "CheckUsernameAvailable", "async": true, "debounceMs": 500 }
    ]
  }
}
```

---

## Cross-Field Validators

Cross-field validators receive all form values and can validate relationships between multiple fields. Unlike regular validators that only see their own field's value, cross-field validators have access to the full entity data.

### Registration

```typescript
import { registerValidators, ValidatorFn } from "@form-eng/core";

const dateRangeValidation: ValidatorFn = (value, allValues) => {
  const startDate = allValues?.["startDate"] as string;
  const endDate = allValues?.["endDate"] as string;

  if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
    return "End date must be after start date";
  }
  return undefined;
};

const passwordConfirmation: ValidatorFn = (value, allValues) => {
  const password = allValues?.["password"] as string;
  const confirmPassword = allValues?.["confirmPassword"] as string;

  if (password && confirmPassword && password !== confirmPassword) {
    return "Passwords do not match";
  }
  return undefined;
};

registerValidators({
  DateRangeCheck: dateRangeValidation,
  PasswordMatch: passwordConfirmation,
});
```

### How They Differ from Regular Validators

| Aspect | Regular Validators | Cross-Field Validators |
|---|---|---|
| Input | Single field value | All form values via `entityData` parameter |
| Config | `{ validator: "name" }` | `{ validator: "name", crossField: true }` |
| Scope | Own field only | Full form context |
| Async support | Yes | No (sync only) |
| Registration | `registerValidators()` | `registerValidators()` (same registry) |

### Field Config Property

```json
{
  "endDate": {
    "type": "DateControl",
    "label": "End Date",
    "validate": [{ "validator": "DateRangeCheck", "crossField": true }]
  }
}
```

### Example: Date Range Validation

```typescript
const dateRangeValidation: ValidatorFn = (value, allValues) => {
  // This validator is placed on "endDate" but reads "startDate"
  const startDate = allValues?.["startDate"] as string;
  const endDate = allValues?.["endDate"] as string;

  if (!startDate || !endDate) return undefined;

  if (new Date(endDate) <= new Date(startDate)) {
    return "End date must be after the start date";
  }

  return undefined;
};
```

### Example: Conditional Sum Limit

```typescript
const budgetLimitValidation: ValidatorFn = (value, allValues) => {
  const hardware = (allValues?.["hardwareBudget"] as number) || 0;
  const software = (allValues?.["softwareBudget"] as number) || 0;
  const totalBudget = (allValues?.["totalBudget"] as number) || 0;

  if (hardware + software > totalBudget) {
    return `Combined budget ($${hardware + software}) exceeds total budget ($${totalBudget})`;
  }

  return undefined;
};
```

---

## Custom Validator Patterns

### Writing a Sync Validator

A sync validator is a function that takes a value and optional entity data, and returns `undefined` for valid or a `string` error message for invalid.

```typescript
import { registerValidators, ValidatorFn } from "@form-eng/core";

// Simple value-only validator
const noWhitespace: ValidatorFn = (value) => {
  if (!value || typeof value !== "string") return undefined;
  return /\s/.test(value) ? "Value must not contain whitespace" : undefined;
};

// Validator using entity data (cross-field awareness in a sync validator)
const greaterThanMinimum: ValidatorFn = (value, entityData) => {
  if (value == null || value === "") return undefined;
  const num = Number(value);
  const minimum = Number(entityData?.["minimumValue"]) || 0;
  if (isNaN(num)) return "Must be a number";
  return num <= minimum ? `Must be greater than ${minimum}` : undefined;
};

registerValidators({
  NoWhitespace: noWhitespace,
  GreaterThanMinimum: greaterThanMinimum,
});
```

### Writing an Async Validator

An async validator returns a `Promise<string | undefined>`. Always handle the `AbortSignal` parameter.

```typescript
import { registerValidators, ValidatorFn } from "@form-eng/core";

const validatePostalCode: ValidatorFn = async (value, entityData, signal) => {
  if (!value || typeof value !== "string") return undefined;

  const country = entityData?.["country"] as string;
  if (!country) return undefined;

  try {
    const res = await fetch(`/api/validate-postal?code=${value}&country=${country}`, { signal });
    if (signal?.aborted) return undefined;
    const data = await res.json();
    return data.valid ? undefined : `Invalid postal code for ${country}`;
  } catch {
    if (signal?.aborted) return undefined;
    return "Could not validate postal code";
  }
};

registerValidators({
  ValidatePostalCode: validatePostalCode,
});
```

### Return Value Convention

- Return `undefined` to indicate the value is **valid**.
- Return a `string` to indicate the value is **invalid** -- the string is the error message displayed to the user.
- For async validators, return `undefined` if the signal is aborted (prevent stale error messages).

### Multiple Validators on a Single Field

A field can specify multiple validators. They run in order; the first error is displayed first, and subsequent errors are appended with ` & `.

```json
{
  "projectId": {
    "type": "Textbox",
    "label": "Project ID",
    "required": true,
    "validate": [
      { "validator": "NoSpecialCharactersValidation" },
      { "validator": "MinLength5" },
      { "validator": "MaxLength20" }
    ]
  }
}
```

If the value is `"A B"`, the combined error message would be: `"Special characters are not allowed"` (if spaces were treated as special -- note: spaces are actually allowed by `NoSpecialCharactersValidation`). If the value is `"AB"`, the error would be: `"Must be at least 5 characters"`.

Multiple errors are concatenated: `"Error 1 & Error 2"`.

### Registration API Reference

```typescript
// Unified validator registration (sync, async, and cross-field)
function registerValidators(custom: Record<string, ValidatorFn>): void;
function getValidator(name: string): ValidatorFn | undefined;
function getValidationRegistry(): Record<string, ValidatorFn>;
```

**Important:** `registerValidators()` **merges** into the existing registry -- it does not replace it. Call it at application startup before rendering any forms. Registering a name that already exists overwrites the previous validator for that name.
