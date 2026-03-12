# @formosaic/examples

Example applications demonstrating `@formosaic/core` and `@formosaic/mui`.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/bghcore/formosaic/tree/main/packages/examples?file=src/App.tsx)

## Getting Started

```bash
# From the monorepo root
npm install --legacy-peer-deps
npm run build:core
npm run build --workspace=packages/mui

# Start the examples dev server
npm run dev --workspace=packages/examples
```

Open http://localhost:3000 to view the examples.

## Examples

### 1. Login + MFA Form
**Directory:** `src/login-mfa/`

A simple login form with email and password. Toggling "Enable MFA" reveals MFA method selection and code input fields. Demonstrates conditional visibility, cross-field effects, dynamic labels, conditional validation, and manual save mode.

### 2. E-Commerce Checkout
**Directory:** `src/checkout/`

A 3-step checkout wizard (Shipping, Payment, Review) with the WizardForm component for step navigation and Formosaic for form state. Shows dropdown dependencies (country -> state), payment method branching (card vs PayPal), and cross-field validation effects.

### 3. Data Entry
**Directory:** `src/data-entry/`

A purchase order form with repeating line items (FieldArray), computed values (line total, subtotal, tax, grand total), category-dependent subcategory dropdowns, cross-field date validation, and numeric range validation.

## Tech Stack

- **React 19** + **TypeScript**
- **Material UI (MUI)** for field components
- **Vite** for dev server and build
- **@formosaic/core** for form orchestration and rules engine
- **@formosaic/mui** for MUI field implementations

## Project Structure

```
packages/examples/
  src/
    main.tsx              # ReactDOM entry point
    App.tsx               # Example switcher with MUI navigation
    login-mfa/
      loginMfaConfig.ts   # IFormConfig v2 definition
      LoginMfaExample.tsx # React component
      README.md           # Detailed documentation
    checkout/
      checkoutConfig.ts   # IFormConfig v2 with wizard
      CheckoutExample.tsx # React component
      README.md           # Detailed documentation
    data-entry/
      dataEntryConfig.ts  # IFormConfig v2 with field arrays
      DataEntryExample.tsx# React component
      README.md           # Detailed documentation
  package.json            # Vite + deps
  vite.config.ts          # Vite config
  tsconfig.json           # TypeScript config
  index.html              # HTML entry
```
