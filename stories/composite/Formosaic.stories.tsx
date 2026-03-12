import React, { useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Formosaic,
  UseInjectedFieldContext,
  IFormConfig,
} from "@formosaic/core";
import { createFluentFieldRegistry } from "@formosaic/fluent";

/**
 * **Formosaic** is the main form component. It accepts an `IFormConfig`
 * (v2 schema) and renders the full form with validation, auto-save,
 * rules evaluation, and field interactions.
 */
const meta: Meta = {
  title: "Composite/Formosaic",
  argTypes: {
    areAllFieldsReadonly: { control: "boolean" },
    isManualSave: { control: "boolean" },
  },
};

export default meta;

/** Helper that registers the Fluent field components */
function FieldRegistrar(props: { children: React.ReactNode }) {
  const { setInjectedFields } = UseInjectedFieldContext();
  useEffect(() => {
    setInjectedFields(createFluentFieldRegistry());
  }, [setInjectedFields]);
  return <>{props.children}</>;
}

const contactFormConfig: IFormConfig = {
  version: 2,
  fields: {
    firstName: {
      type: "Textbox",
      required: true,
      label: "First Name",
      placeholder: "Enter first name",
    },
    lastName: {
      type: "Textbox",
      required: true,
      label: "Last Name",
      placeholder: "Enter last name",
    },
    email: {
      type: "Textbox",
      required: true,
      label: "Email",
      validate: [{ name: "email" }],
    },
    department: {
      type: "Dropdown",
      required: true,
      label: "Department",
      options: [
        { value: "engineering", label: "Engineering" },
        { value: "design", label: "Design" },
        { value: "marketing", label: "Marketing" },
        { value: "sales", label: "Sales" },
      ],
    },
    role: {
      type: "SimpleDropdown",
      required: false,
      label: "Role",
      config: {
        dropdownOptions: ["Manager", "Lead", "Senior", "Junior", "Intern"],
      },
    },
    isActive: {
      type: "Toggle",
      required: false,
      label: "Active Employee",
    },
    startDate: {
      type: "DateControl",
      required: false,
      label: "Start Date",
    },
    experience: {
      type: "Slider",
      required: false,
      label: "Years of Experience",
      config: { min: 0, max: 30, step: 1 },
    },
    skills: {
      type: "Multiselect",
      required: false,
      label: "Skills",
      options: [
        { value: "react", label: "React" },
        { value: "typescript", label: "TypeScript" },
        { value: "node", label: "Node.js" },
        { value: "python", label: "Python" },
        { value: "sql", label: "SQL" },
      ],
    },
    bio: {
      type: "Textarea",
      required: false,
      label: "Bio",
    },
  },
  fieldOrder: [
    "firstName",
    "lastName",
    "email",
    "department",
    "role",
    "isActive",
    "startDate",
    "experience",
    "skills",
    "bio",
  ],
  settings: {
    manualSave: true,
  },
};

const defaultValues = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane.doe@example.com",
  department: "engineering",
  role: "Senior",
  isActive: true,
  startDate: "2022-03-15T00:00:00.000Z",
  experience: 8,
  skills: ["react", "typescript"],
  bio: "",
};

export const Default: StoryObj = {
  render: (args) => (
    <FieldRegistrar>
      <Formosaic
        configName="contact-form"
        formConfig={contactFormConfig}
        defaultValues={defaultValues}
        isManualSave={(args.isManualSave as boolean) ?? true}
        areAllFieldsReadonly={(args.areAllFieldsReadonly as boolean) ?? false}
        saveData={async (data) => {
          console.log("Saving:", data);
          return data;
        }}
      />
    </FieldRegistrar>
  ),
  args: {
    areAllFieldsReadonly: false,
    isManualSave: true,
  },
};

export const ReadOnlyForm: StoryObj = {
  render: () => (
    <FieldRegistrar>
      <Formosaic
        configName="contact-form-readonly"
        formConfig={contactFormConfig}
        defaultValues={defaultValues}
        areAllFieldsReadonly={true}
        isManualSave={true}
      />
    </FieldRegistrar>
  ),
};

const rulesFormConfig: IFormConfig = {
  version: 2,
  fields: {
    status: {
      type: "Dropdown",
      required: true,
      label: "Status",
      options: [
        { value: "Active", label: "Active" },
        { value: "Inactive", label: "Inactive" },
      ],
      rules: [
        {
          id: "status-active-rule",
          when: { field: "status", operator: "equals", value: "Active" },
          then: { fields: { priority: { required: true, hidden: false } } },
          else: { fields: { priority: { required: false, hidden: true } } },
        },
      ],
    },
    priority: {
      type: "Dropdown",
      required: false,
      label: "Priority",
      hidden: true,
      options: [
        { value: "High", label: "High" },
        { value: "Medium", label: "Medium" },
        { value: "Low", label: "Low" },
      ],
    },
    notes: {
      type: "Textarea",
      required: false,
      label: "Notes",
    },
  },
  fieldOrder: ["status", "priority", "notes"],
  settings: { manualSave: true },
};

export const WithRules: StoryObj = {
  render: () => (
    <FieldRegistrar>
      <div>
        <p style={{ color: "#666", marginBottom: "16px", fontSize: "14px" }}>
          Change Status to "Active" to reveal the Priority field (rules engine demo).
        </p>
        <Formosaic
          configName="rules-demo"
          formConfig={rulesFormConfig}
          defaultValues={{ status: "Inactive", priority: "", notes: "" }}
          isManualSave={true}
          saveData={async (data) => {
            console.log("Saving:", data);
            return data;
          }}
        />
      </div>
    </FieldRegistrar>
  ),
};
