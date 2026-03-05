# Login + MFA Form Example

A login form with conditional multi-factor authentication fields.

## What It Demonstrates

- **Basic fields**: Textbox (email, password) and Toggle
- **Conditional visibility**: Toggling "Enable MFA" shows/hides the MFA method dropdown and code input
- **Cross-field rule effects**: A single rule on `enableMfa` controls the visibility and required state of multiple other fields
- **Dynamic labels**: The MFA code field label changes based on the selected MFA method (authenticator, SMS, or email)
- **Conditional validation**: The 6-digit pattern validation on `mfaCode` only runs when `enableMfa` is `true`
- **Manual save mode**: The form renders a submit button instead of auto-saving on each field change

## Form Config Highlights

```typescript
// Rule on enableMfa controls two other fields
rules: [{
  id: "mfa-toggle",
  when: { field: "enableMfa", operator: "equals", value: true },
  then: {
    fields: {
      mfaMethod: { hidden: false },
      mfaCode: { hidden: false, required: true },
    },
  },
  else: {
    fields: {
      mfaMethod: { hidden: true },
      mfaCode: { hidden: true, required: false },
    },
  },
}]

// Conditional validation - only validates when MFA is enabled
validate: [{
  name: "pattern",
  params: { pattern: "^\\d{6}$" },
  message: "MFA code must be exactly 6 digits",
  when: { field: "enableMfa", operator: "equals", value: true },
}]
```

## Fields

| Field           | Type     | Notes                                      |
|-----------------|----------|--------------------------------------------|
| email           | Textbox  | Required, email validation                 |
| password        | Textbox  | Required, min 8 characters                 |
| enableMfa       | Toggle   | Controls visibility of MFA fields          |
| mfaMethod       | Dropdown | Hidden by default, 3 options               |
| mfaCode         | Textbox  | Hidden by default, 6-digit pattern when MFA on |
| rememberDevice  | Toggle   | Hidden by default                          |
