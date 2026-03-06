import { IFormConfig } from "@form-eng/core";

/**
 * Login + MFA Form Configuration
 *
 * Demonstrates:
 * - Basic field types (Textbox, Toggle)
 * - Conditional field visibility via rules (MFA fields shown when toggle is on)
 * - Validation: email format, required password, MFA code pattern
 * - The `then`/`else` pattern for toggling hidden state
 */
export const loginMfaFormConfig: IFormConfig = {
  version: 2,
  fields: {
    email: {
      type: "Textbox",
      label: "Email Address",
      required: true,
      placeholder: "you@example.com",
      validate: [
        { name: "email", message: "Please enter a valid email address" },
      ],
    },
    password: {
      type: "Textbox",
      label: "Password",
      required: true,
      placeholder: "Enter your password",
      config: { type: "password" },
      validate: [
        {
          name: "minLength",
          params: { min: 8 },
          message: "Password must be at least 8 characters",
        },
      ],
    },
    enableMfa: {
      type: "Toggle",
      label: "Enable Multi-Factor Authentication",
      defaultValue: false,
      description: "Add an extra layer of security to your account",
      rules: [
        {
          id: "mfa-toggle",
          when: { field: "enableMfa", operator: "equals", value: true },
          then: {
            fields: {
              mfaMethod: { hidden: false },
              mfaCode: { hidden: false, required: true },
              rememberDevice: { hidden: false },
            },
          },
          else: {
            fields: {
              mfaMethod: { hidden: true },
              mfaCode: { hidden: true, required: false },
              rememberDevice: { hidden: true },
            },
          },
        },
      ],
    },
    mfaMethod: {
      type: "Dropdown",
      label: "MFA Method",
      hidden: true,
      options: [
        { value: "authenticator", label: "Authenticator App" },
        { value: "sms", label: "SMS Text Message" },
        { value: "email", label: "Email Code" },
      ],
      defaultValue: "authenticator",
      rules: [
        {
          id: "mfa-method-sms",
          when: { field: "mfaMethod", operator: "equals", value: "sms" },
          then: {
            fields: {
              mfaCode: {
                label: "Enter the 6-digit code sent to your phone",
              },
            },
          },
        },
        {
          id: "mfa-method-email",
          when: { field: "mfaMethod", operator: "equals", value: "email" },
          then: {
            fields: {
              mfaCode: {
                label: "Enter the 6-digit code sent to your email",
              },
            },
          },
        },
        {
          id: "mfa-method-authenticator",
          when: {
            field: "mfaMethod",
            operator: "equals",
            value: "authenticator",
          },
          then: {
            fields: {
              mfaCode: {
                label: "Enter the code from your authenticator app",
              },
            },
          },
        },
      ],
    },
    mfaCode: {
      type: "Textbox",
      label: "MFA Code",
      hidden: true,
      required: false,
      placeholder: "000000",
      validate: [
        {
          name: "pattern",
          params: { pattern: "^\\d{6}$" },
          message: "MFA code must be exactly 6 digits",
          when: { field: "enableMfa", operator: "equals", value: true },
        },
      ],
    },
    rememberDevice: {
      type: "Toggle",
      label: "Remember this device for 30 days",
      hidden: true,
      defaultValue: false,
    },
  },
  fieldOrder: [
    "email",
    "password",
    "enableMfa",
    "mfaMethod",
    "mfaCode",
    "rememberDevice",
  ],
  settings: {
    manualSave: true,
  },
};
