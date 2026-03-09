import type { IFormConfig } from "../../types/IFormConfig";

/**
 * Profile form: covers Textbox, Textarea, Number, Toggle, Dropdown, RadioGroup,
 * CheckboxGroup, DateControl, ReadOnly. Includes a rule that makes bio required
 * when notifications are enabled.
 */
export const profileFormConfig: IFormConfig = {
  version: 2,
  fields: {
    name: { type: "Textbox", label: "Full Name", required: true },
    email: {
      type: "Textbox",
      label: "Email Address",
      required: true,
      validate: [{ name: "email" }],
    },
    bio: { type: "Textarea", label: "Biography" },
    age: {
      type: "Number",
      label: "Age",
      validate: [
        { name: "min", params: { min: 0 } },
        { name: "max", params: { max: 150 } },
      ],
    },
    notifications: {
      type: "Toggle",
      label: "Enable Notifications",
      rules: [
        {
          id: "bio-required",
          when: { field: "notifications", operator: "equals", value: true },
          then: { fields: { bio: { required: true } } },
        },
      ],
    },
    timezone: {
      type: "Dropdown",
      label: "Timezone",
      options: [
        { value: "utc", label: "UTC" },
        { value: "est", label: "Eastern Time" },
        { value: "cst", label: "Central Time" },
        { value: "pst", label: "Pacific Time" },
      ],
    },
    theme: {
      type: "RadioGroup",
      label: "Theme Preference",
      options: [
        { value: "light", label: "Light" },
        { value: "dark", label: "Dark" },
        { value: "system", label: "System" },
      ],
    },
    interests: {
      type: "CheckboxGroup",
      label: "Interests",
      options: [
        { value: "tech", label: "Technology" },
        { value: "sports", label: "Sports" },
        { value: "music", label: "Music" },
        { value: "art", label: "Art" },
      ],
    },
    birthdate: { type: "DateControl", label: "Date of Birth" },
    memberSince: { type: "ReadOnly", label: "Member Since", readOnly: true },
  },
  fieldOrder: [
    "name",
    "email",
    "bio",
    "age",
    "notifications",
    "timezone",
    "theme",
    "interests",
    "birthdate",
    "memberSince",
  ],
  settings: { manualSave: false },
};

/**
 * Workflow form: covers Dropdown (with cross-field rules), Multiselect,
 * Textbox, Textarea, DynamicFragment, ReadOnly. Rules hide priority when
 * status is Draft and require assignees when status is Active.
 */
export const workflowFormConfig: IFormConfig = {
  version: 2,
  fields: {
    status: {
      type: "Dropdown",
      label: "Status",
      required: true,
      options: [
        { value: "Draft", label: "Draft" },
        { value: "Active", label: "Active" },
        { value: "Closed", label: "Closed" },
      ],
      rules: [
        {
          id: "hide-priority-draft",
          when: { field: "status", operator: "equals", value: "Draft" },
          then: { fields: { priority: { hidden: true } } },
          else: { fields: { priority: { hidden: false } } },
        },
        {
          id: "require-assignees-active",
          when: { field: "status", operator: "equals", value: "Active" },
          then: { fields: { assignees: { required: true } } },
          else: { fields: { assignees: { required: false } } },
        },
      ],
    },
    assignees: {
      type: "Multiselect",
      label: "Assignees",
      options: [
        { value: "alice", label: "Alice" },
        { value: "bob", label: "Bob" },
        { value: "charlie", label: "Charlie" },
      ],
    },
    priority: {
      type: "Dropdown",
      label: "Priority",
      options: [
        { value: "High", label: "High" },
        { value: "Medium", label: "Medium" },
        { value: "Low", label: "Low" },
      ],
    },
    title: { type: "Textbox", label: "Title", required: true },
    description: { type: "Textarea", label: "Description" },
    ticketId: { type: "DynamicFragment", label: "Ticket ID" },
    createdBy: { type: "ReadOnly", label: "Created By", readOnly: true },
  },
  fieldOrder: [
    "status",
    "assignees",
    "priority",
    "title",
    "description",
    "ticketId",
    "createdBy",
  ],
};

/**
 * Option-heavy form: stress-tests rendering with large option lists.
 * 100-option Dropdown, 50-option Multiselect, 20-option SimpleDropdown.
 */
const manyOptions = Array.from({ length: 100 }, (_, i) => ({
  value: `opt${i}`,
  label: `Option ${i + 1}`,
}));

const mediumOptions = Array.from({ length: 50 }, (_, i) => ({
  value: `tag${i}`,
  label: `Tag ${i + 1}`,
}));

const smallOptions = Array.from({ length: 20 }, (_, i) => `Choice ${i + 1}`);

export const optionHeavyFormConfig: IFormConfig = {
  version: 2,
  fields: {
    largeDropdown: {
      type: "Dropdown",
      label: "Large Dropdown (100 options)",
      options: manyOptions,
    },
    largeMultiSelect: {
      type: "Multiselect",
      label: "Large Multi-Select (50 options)",
      options: mediumOptions,
    },
    simpleChoices: {
      type: "SimpleDropdown",
      label: "Simple Choices (20 options)",
      config: { dropdownOptions: smallOptions },
    },
  },
  fieldOrder: ["largeDropdown", "largeMultiSelect", "simpleChoices"],
};
