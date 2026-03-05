# E-Commerce Checkout Example

A multi-step checkout wizard with conditional payment fields and country-dependent address options.

## What It Demonstrates

- **Wizard mode**: 3 steps (Shipping, Payment, Review) with linear navigation and validation on step change
- **Dropdown dependencies**: State/Province/County dropdown options change based on selected country
- **Conditional validation**: ZIP/postal code format validation changes per country
- **Payment method branching**: Credit/debit card fields vs PayPal email, controlled by a single rule with an OR condition
- **Custom wizard rendering**: MUI Stepper for step headers, custom Back/Continue/Place Order buttons

## Wizard Steps

### Step 1: Shipping Address
| Field        | Type     | Notes                                    |
|--------------|----------|------------------------------------------|
| firstName    | Textbox  | Required                                 |
| lastName     | Textbox  | Required                                 |
| addressLine1 | Textbox  | Required                                 |
| addressLine2 | Textbox  | Optional                                 |
| city         | Textbox  | Required                                 |
| country      | Dropdown | US/CA/GB, controls state/zip             |
| state        | Dropdown | Options filtered by country              |
| zip          | Textbox  | Validation pattern changes by country    |

### Step 2: Payment
| Field         | Type     | Notes                                   |
|---------------|----------|-----------------------------------------|
| paymentMethod | Dropdown | credit/debit/paypal                     |
| cardName      | Textbox  | Hidden when PayPal selected             |
| cardNumber    | Textbox  | 16-digit pattern validation             |
| cardExpiry    | Textbox  | MM/YY pattern                           |
| cardCvv       | Textbox  | 3-4 digit CVV, password field           |
| paypalEmail   | Textbox  | Hidden when card selected               |

### Step 3: Review & Submit
| Field        | Type     | Notes                                    |
|--------------|----------|------------------------------------------|
| orderNotes   | Textarea | Optional delivery instructions           |
| agreeToTerms | Toggle   | Required to submit                       |

## Key Rule Patterns

```typescript
// OR condition: both credit and debit show card fields
when: {
  operator: "or",
  conditions: [
    { field: "paymentMethod", operator: "equals", value: "credit" },
    { field: "paymentMethod", operator: "equals", value: "debit" },
  ],
}

// Country-dependent state options + validation
when: { field: "country", operator: "equals", value: "US" },
then: {
  fields: {
    state: { label: "State", options: [...] },
    zip: { label: "ZIP Code", validate: [{ name: "pattern", params: { pattern: "^\\d{5}$" } }] },
  },
}
```
