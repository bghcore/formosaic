import type { IFormConfig } from "@form-eng/core";

/**
 * Form with various validation rules:
 * - Required field validation
 * - Email format validation
 * - URL format validation
 * - Phone format validation
 * - Min/max length validation
 */
export const validationFormConfig: IFormConfig = {
  version: 2,
  fields: {
    name: {
      type: "Textbox",
      label: "Full Name",
      required: true,
      placeholder: "Enter your full name",
      validate: [
        { name: "minLength", params: { min: 2 }, message: "Name must be at least 2 characters" },
        { name: "maxLength", params: { max: 50 }, message: "Name must be at most 50 characters" },
      ],
    },
    email: {
      type: "Textbox",
      label: "Email",
      required: true,
      placeholder: "Enter email address",
      validate: [{ name: "email", message: "Please enter a valid email address" }],
    },
    phone: {
      type: "Textbox",
      label: "Phone",
      required: false,
      placeholder: "Enter phone number",
      validate: [{ name: "phone", message: "Please enter a valid phone number" }],
    },
    website: {
      type: "Textbox",
      label: "Website",
      required: false,
      placeholder: "https://example.com",
      validate: [{ name: "url", message: "Please enter a valid URL" }],
    },
    bio: {
      type: "Textbox",
      label: "Bio",
      required: false,
      placeholder: "Tell us about yourself",
      validate: [
        { name: "maxLength", params: { max: 200 }, message: "Bio must be at most 200 characters" },
      ],
    },
    agreeTerms: {
      type: "Toggle",
      label: "I agree to the terms and conditions",
      required: true,
    },
  },
  fieldOrder: ["name", "email", "phone", "website", "bio", "agreeTerms"],
  settings: {
    manualSave: true,
  },
};

export const validationFormDefaults: Record<string, unknown> = {
  name: "",
  email: "",
  phone: "",
  website: "",
  bio: "",
  agreeTerms: false,
};
