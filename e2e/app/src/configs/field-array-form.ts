import type { IFormConfig } from "@bghcore/dynamic-forms-core";

/**
 * Form with a repeating FieldArray section:
 * - A "Team Name" text field
 * - A "Members" field array with name + role per item
 * - Min 1, max 5 items
 *
 * Tests: add/remove items, min/max enforcement, field values per item.
 */
export const fieldArrayFormConfig: IFormConfig = {
  version: 2,
  fields: {
    teamName: {
      type: "Textbox",
      label: "Team Name",
      required: true,
      placeholder: "Enter team name",
    },
    members: {
      type: "FieldArray",
      label: "Team Members",
      required: false,
      minItems: 1,
      maxItems: 5,
      items: {
        memberName: {
          type: "Textbox",
          label: "Member Name",
          required: true,
          placeholder: "Enter member name",
        },
        memberRole: {
          type: "Dropdown",
          label: "Role",
          required: true,
          options: [
            { value: "developer", label: "Developer" },
            { value: "designer", label: "Designer" },
            { value: "manager", label: "Manager" },
            { value: "qa", label: "QA Engineer" },
          ],
        },
      },
    },
  },
  fieldOrder: ["teamName", "members"],
  settings: {
    manualSave: true,
  },
};

export const fieldArrayFormDefaults: Record<string, unknown> = {
  teamName: "",
  members: [
    { memberName: "", memberRole: "" },
  ],
};
