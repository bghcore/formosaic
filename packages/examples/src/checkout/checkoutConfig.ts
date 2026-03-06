import { IFormConfig } from "@form-eng/core";

/**
 * E-Commerce Checkout Configuration (Wizard Mode)
 *
 * Demonstrates:
 * - Wizard with 3 steps: Shipping, Payment, Review
 * - Conditional fields: payment fields change based on payment method
 * - Cross-step validation
 * - Dropdown dependencies: state options depend on country
 * - Read-only review step using ReadOnly component type
 */
export const checkoutFormConfig: IFormConfig = {
  version: 2,
  fields: {
    // -- Step 1: Shipping Address --
    firstName: {
      type: "Textbox",
      label: "First Name",
      required: true,
      placeholder: "John",
    },
    lastName: {
      type: "Textbox",
      label: "Last Name",
      required: true,
      placeholder: "Doe",
    },
    addressLine1: {
      type: "Textbox",
      label: "Address Line 1",
      required: true,
      placeholder: "123 Main Street",
    },
    addressLine2: {
      type: "Textbox",
      label: "Address Line 2",
      required: false,
      placeholder: "Apt 4B",
    },
    city: {
      type: "Textbox",
      label: "City",
      required: true,
      placeholder: "New York",
    },
    country: {
      type: "Dropdown",
      label: "Country",
      required: true,
      defaultValue: "US",
      options: [
        { value: "US", label: "United States" },
        { value: "CA", label: "Canada" },
        { value: "GB", label: "United Kingdom" },
      ],
      rules: [
        {
          id: "country-us-states",
          when: { field: "country", operator: "equals", value: "US" },
          then: {
            fields: {
              state: {
                label: "State",
                options: [
                  { value: "NY", label: "New York" },
                  { value: "CA", label: "California" },
                  { value: "TX", label: "Texas" },
                  { value: "FL", label: "Florida" },
                  { value: "IL", label: "Illinois" },
                  { value: "WA", label: "Washington" },
                ],
              },
              zip: {
                label: "ZIP Code",
                validate: [
                  {
                    name: "pattern",
                    params: { pattern: "^\\d{5}(-\\d{4})?$" },
                    message: "Enter a valid US ZIP code (e.g., 12345 or 12345-6789)",
                  },
                ],
              },
            },
          },
        },
        {
          id: "country-ca-provinces",
          when: { field: "country", operator: "equals", value: "CA" },
          then: {
            fields: {
              state: {
                label: "Province",
                options: [
                  { value: "ON", label: "Ontario" },
                  { value: "QC", label: "Quebec" },
                  { value: "BC", label: "British Columbia" },
                  { value: "AB", label: "Alberta" },
                ],
              },
              zip: {
                label: "Postal Code",
                validate: [
                  {
                    name: "pattern",
                    params: { pattern: "^[A-Z]\\d[A-Z] ?\\d[A-Z]\\d$" },
                    message: "Enter a valid Canadian postal code (e.g., K1A 0B1)",
                  },
                ],
              },
            },
          },
        },
        {
          id: "country-gb-counties",
          when: { field: "country", operator: "equals", value: "GB" },
          then: {
            fields: {
              state: {
                label: "County",
                options: [
                  { value: "LDN", label: "Greater London" },
                  { value: "MAN", label: "Greater Manchester" },
                  { value: "WMD", label: "West Midlands" },
                ],
              },
              zip: {
                label: "Postcode",
                validate: [
                  {
                    name: "pattern",
                    params: { pattern: "^[A-Z]{1,2}\\d[A-Z\\d]? ?\\d[A-Z]{2}$" },
                    message: "Enter a valid UK postcode (e.g., SW1A 1AA)",
                  },
                ],
              },
            },
          },
        },
      ],
    },
    state: {
      type: "Dropdown",
      label: "State",
      required: true,
      options: [],
    },
    zip: {
      type: "Textbox",
      label: "ZIP Code",
      required: true,
      placeholder: "12345",
    },

    // -- Step 2: Payment --
    paymentMethod: {
      type: "Dropdown",
      label: "Payment Method",
      required: true,
      defaultValue: "credit",
      options: [
        { value: "credit", label: "Credit Card" },
        { value: "debit", label: "Debit Card" },
        { value: "paypal", label: "PayPal" },
      ],
      rules: [
        {
          id: "payment-card",
          when: {
            operator: "or",
            conditions: [
              { field: "paymentMethod", operator: "equals", value: "credit" },
              { field: "paymentMethod", operator: "equals", value: "debit" },
            ],
          },
          then: {
            fields: {
              cardNumber: { hidden: false, required: true },
              cardExpiry: { hidden: false, required: true },
              cardCvv: { hidden: false, required: true },
              cardName: { hidden: false, required: true },
              paypalEmail: { hidden: true, required: false },
            },
          },
          else: {
            fields: {
              cardNumber: { hidden: true, required: false },
              cardExpiry: { hidden: true, required: false },
              cardCvv: { hidden: true, required: false },
              cardName: { hidden: true, required: false },
              paypalEmail: { hidden: false, required: true },
            },
          },
        },
      ],
    },
    cardName: {
      type: "Textbox",
      label: "Name on Card",
      required: true,
      placeholder: "John Doe",
    },
    cardNumber: {
      type: "Textbox",
      label: "Card Number",
      required: true,
      placeholder: "4242 4242 4242 4242",
      validate: [
        {
          name: "pattern",
          params: { pattern: "^\\d{4} ?\\d{4} ?\\d{4} ?\\d{4}$" },
          message: "Enter a valid 16-digit card number",
        },
      ],
    },
    cardExpiry: {
      type: "Textbox",
      label: "Expiry Date",
      required: true,
      placeholder: "MM/YY",
      validate: [
        {
          name: "pattern",
          params: { pattern: "^(0[1-9]|1[0-2])/\\d{2}$" },
          message: "Enter a valid expiry date (MM/YY)",
        },
      ],
    },
    cardCvv: {
      type: "Textbox",
      label: "CVV",
      required: true,
      placeholder: "123",
      config: { type: "password" },
      validate: [
        {
          name: "pattern",
          params: { pattern: "^\\d{3,4}$" },
          message: "CVV must be 3 or 4 digits",
        },
      ],
    },
    paypalEmail: {
      type: "Textbox",
      label: "PayPal Email",
      hidden: true,
      required: false,
      placeholder: "paypal@example.com",
      validate: [{ name: "email", message: "Enter a valid PayPal email" }],
    },

    // -- Step 3: Review --
    orderNotes: {
      type: "Textarea",
      label: "Order Notes (optional)",
      required: false,
      placeholder: "Any special delivery instructions?",
    },
    agreeToTerms: {
      type: "Toggle",
      label: "I agree to the Terms & Conditions",
      required: true,
      defaultValue: false,
    },
  },
  fieldOrder: [
    "firstName",
    "lastName",
    "addressLine1",
    "addressLine2",
    "city",
    "country",
    "state",
    "zip",
    "paymentMethod",
    "cardName",
    "cardNumber",
    "cardExpiry",
    "cardCvv",
    "paypalEmail",
    "orderNotes",
    "agreeToTerms",
  ],
  wizard: {
    steps: [
      {
        id: "shipping",
        title: "Shipping Address",
        description: "Where should we send your order?",
        fields: [
          "firstName",
          "lastName",
          "addressLine1",
          "addressLine2",
          "city",
          "country",
          "state",
          "zip",
        ],
      },
      {
        id: "payment",
        title: "Payment",
        description: "How would you like to pay?",
        fields: [
          "paymentMethod",
          "cardName",
          "cardNumber",
          "cardExpiry",
          "cardCvv",
          "paypalEmail",
        ],
      },
      {
        id: "review",
        title: "Review & Submit",
        description: "Review your order before placing it",
        fields: ["orderNotes", "agreeToTerms"],
      },
    ],
    linearNavigation: true,
    validateOnStepChange: true,
  },
  settings: {
    manualSave: true,
  },
};
