import type { IFormConfig } from "@form-eng/core";

/**
 * Multi-step wizard form:
 * - Step 1: Personal Info (name, email)
 * - Step 2: Role Selection (role dropdown)
 * - Step 3: Admin Permissions (conditional -- only visible when role=admin)
 * - Step 4: Review
 *
 * Tests: step navigation, step validation, conditional step visibility.
 */
export const wizardFormConfig: IFormConfig = {
  version: 2,
  fields: {
    name: {
      type: "Textbox",
      label: "Full Name",
      required: true,
      placeholder: "Enter your full name",
    },
    email: {
      type: "Textbox",
      label: "Email",
      required: true,
      placeholder: "Enter email",
      validate: [{ name: "email" }],
    },
    role: {
      type: "Dropdown",
      label: "Role",
      required: true,
      options: [
        { value: "user", label: "User" },
        { value: "editor", label: "Editor" },
        { value: "admin", label: "Admin" },
      ],
    },
    adminLevel: {
      type: "Dropdown",
      label: "Admin Level",
      required: true,
      options: [
        { value: "super", label: "Super Admin" },
        { value: "standard", label: "Standard Admin" },
      ],
    },
    adminNotes: {
      type: "Textbox",
      label: "Admin Notes",
      required: false,
      placeholder: "Justification for admin access",
    },
    summary: {
      type: "Textbox",
      label: "Summary",
      required: false,
      readOnly: true,
      description: "Review your selections before submitting.",
    },
  },
  fieldOrder: ["name", "email", "role", "adminLevel", "adminNotes", "summary"],
  wizard: {
    steps: [
      {
        id: "personal",
        title: "Personal Info",
        fields: ["name", "email"],
      },
      {
        id: "role-selection",
        title: "Role",
        fields: ["role"],
      },
      {
        id: "admin-config",
        title: "Admin Configuration",
        fields: ["adminLevel", "adminNotes"],
        visibleWhen: { field: "role", operator: "equals", value: "admin" },
      },
      {
        id: "review",
        title: "Review",
        fields: ["summary"],
      },
    ],
    linearNavigation: true,
    validateOnStepChange: true,
  },
  settings: {
    manualSave: true,
  },
};

export const wizardFormDefaults: Record<string, unknown> = {
  name: "",
  email: "",
  role: "",
  adminLevel: "",
  adminNotes: "",
  summary: "",
};
