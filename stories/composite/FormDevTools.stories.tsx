import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FormDevTools, IRuntimeFormState } from "@bghcore/dynamic-forms-core";

/**
 * **FormDevTools** is a developer panel that shows the current rules engine state,
 * form values, errors, and dependency graph. It renders as a fixed bottom-right
 * overlay with tabs for Rules, Values, Errors, and Graph.
 */
const meta: Meta = {
  title: "Composite/FormDevTools",
  argTypes: {
    enabled: { control: "boolean" },
  },
};

export default meta;

const sampleFormState: IRuntimeFormState = {
  fieldStates: {
    firstName: {
      required: true,
      hidden: false,
      readOnly: false,
      type: "Textbox",
      dependentFields: [],
      dependsOnFields: [],
    },
    lastName: {
      required: true,
      hidden: false,
      readOnly: false,
      type: "Textbox",
      dependentFields: [],
      dependsOnFields: [],
    },
    status: {
      required: true,
      hidden: false,
      readOnly: false,
      type: "Dropdown",
      dependentFields: ["priority", "notes"],
      dependsOnFields: [],
      activeRuleIds: ["status-active-rule"],
    },
    priority: {
      required: true,
      hidden: false,
      readOnly: false,
      type: "Dropdown",
      dependentFields: [],
      dependsOnFields: ["status"],
    },
    notes: {
      required: false,
      hidden: false,
      readOnly: false,
      type: "Textarea",
      dependentFields: [],
      dependsOnFields: ["status"],
      computedValue: "$values.firstName + ' ' + $values.lastName",
    },
  },
  fieldOrder: ["firstName", "lastName", "status", "priority", "notes"],
};

const sampleValues = {
  firstName: "Jane",
  lastName: "Doe",
  status: "Active",
  priority: "High",
  notes: "",
};

const sampleErrors = {
  notes: { type: "required", message: "Notes are required when status is Active" },
};

export const Default: StoryObj = {
  render: (args) => (
    <div style={{ minHeight: "300px" }}>
      <p>
        The DevTools panel appears in the bottom-right corner. Click it to expand.
      </p>
      <FormDevTools
        configName="demo-form"
        formState={sampleFormState}
        formValues={sampleValues}
        formErrors={sampleErrors}
        enabled={(args.enabled as boolean) ?? true}
      />
    </div>
  ),
  args: {
    enabled: true,
  },
};

export const NoErrors: StoryObj = {
  render: () => (
    <div style={{ minHeight: "300px" }}>
      <p>DevTools with no form errors -- the Errors tab will show "No errors".</p>
      <FormDevTools
        configName="clean-form"
        formState={sampleFormState}
        formValues={sampleValues}
        formErrors={{}}
        enabled={true}
      />
    </div>
  ),
};

export const Disabled: StoryObj = {
  render: () => (
    <div>
      <p>
        When <code>enabled=false</code>, FormDevTools renders nothing.
      </p>
      <FormDevTools
        configName="disabled-form"
        formState={sampleFormState}
        formValues={sampleValues}
        formErrors={{}}
        enabled={false}
      />
    </div>
  ),
};
