import type { IFormConfig } from "@form-eng/core";

/**
 * Form with various rule scenarios:
 * - Show/hide: selecting status "Active" shows the priority field
 * - Required toggle: status "Active" makes priority required
 * - Option filtering: country selection filters region options
 * - AND condition: notes required when status=Active AND type=Bug
 */
export const rulesFormConfig: IFormConfig = {
  version: 2,
  fields: {
    status: {
      type: "Dropdown",
      label: "Status",
      required: true,
      options: [
        { value: "Active", label: "Active" },
        { value: "Inactive", label: "Inactive" },
        { value: "Pending", label: "Pending" },
      ],
      rules: [
        {
          id: "status-active-shows-priority",
          when: { field: "status", operator: "equals", value: "Active" },
          then: { fields: { priority: { hidden: false, required: true } } },
          else: { fields: { priority: { hidden: true, required: false } } },
        },
      ],
    },
    priority: {
      type: "Dropdown",
      label: "Priority",
      required: false,
      hidden: true,
      options: [
        { value: "High", label: "High" },
        { value: "Medium", label: "Medium" },
        { value: "Low", label: "Low" },
      ],
    },
    country: {
      type: "Dropdown",
      label: "Country",
      required: true,
      options: [
        { value: "US", label: "United States" },
        { value: "CA", label: "Canada" },
      ],
      rules: [
        {
          id: "country-us-regions",
          when: { field: "country", operator: "equals", value: "US" },
          then: {
            fields: {
              region: {
                options: [
                  { value: "East", label: "East Coast" },
                  { value: "West", label: "West Coast" },
                  { value: "Central", label: "Central" },
                ],
              },
            },
          },
        },
        {
          id: "country-ca-regions",
          when: { field: "country", operator: "equals", value: "CA" },
          then: {
            fields: {
              region: {
                options: [
                  { value: "Ontario", label: "Ontario" },
                  { value: "Quebec", label: "Quebec" },
                  { value: "BC", label: "British Columbia" },
                ],
              },
            },
          },
        },
      ],
    },
    region: {
      type: "Dropdown",
      label: "Region",
      required: false,
      options: [],
    },
    issueType: {
      type: "Dropdown",
      label: "Issue Type",
      required: true,
      options: [
        { value: "Bug", label: "Bug" },
        { value: "Feature", label: "Feature" },
        { value: "Task", label: "Task" },
      ],
    },
    notes: {
      type: "Textbox",
      label: "Notes",
      required: false,
      rules: [
        {
          id: "notes-required-when-active-bug",
          when: {
            operator: "and",
            conditions: [
              { field: "status", operator: "equals", value: "Active" },
              { field: "issueType", operator: "equals", value: "Bug" },
            ],
          },
          then: { required: true },
          else: { required: false },
        },
      ],
    },
    readOnlyWhenInactive: {
      type: "Textbox",
      label: "Details",
      required: false,
      rules: [
        {
          id: "readonly-when-inactive",
          when: { field: "status", operator: "equals", value: "Inactive" },
          then: { readOnly: true },
          else: { readOnly: false },
        },
      ],
    },
  },
  fieldOrder: [
    "status",
    "priority",
    "country",
    "region",
    "issueType",
    "notes",
    "readOnlyWhenInactive",
  ],
  settings: {
    manualSave: true,
  },
};

export const rulesFormDefaults: Record<string, unknown> = {
  status: "",
  priority: "",
  country: "",
  region: "",
  issueType: "",
  notes: "",
  readOnlyWhenInactive: "",
};
