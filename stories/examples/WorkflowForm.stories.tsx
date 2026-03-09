import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  FormEngine,
  RulesEngineProvider,
  InjectedFieldProvider,
} from "@form-eng/core";
import { createFluentFieldRegistry } from "@form-eng/fluent";
import { workflowFormConfig } from "../../packages/core/src/__tests__/__fixtures__/businessForms";

const registry = createFluentFieldRegistry();

const meta: Meta = {
  title: "Examples/Workflow Form",
  decorators: [
    (Story) => (
      <RulesEngineProvider>
        <InjectedFieldProvider injectedFields={registry}>
          <Story />
        </InjectedFieldProvider>
      </RulesEngineProvider>
    ),
  ],
};
export default meta;

export const Draft: StoryObj = {
  render: () => (
    <FormEngine
      programName="storybook"
      configName="workflowForm"
      formConfig={workflowFormConfig}
      defaultValues={{
        status: "Draft",
        title: "Fix login bug",
        createdBy: "admin@example.com",
      }}
      saveData={async (data) => {
        console.log("Save:", data);
        return data;
      }}
    />
  ),
};

export const Active: StoryObj = {
  render: () => (
    <FormEngine
      programName="storybook"
      configName="workflowForm"
      formConfig={workflowFormConfig}
      defaultValues={{
        status: "Active",
        title: "Implement dashboard",
        assignees: ["alice", "bob"],
        priority: "High",
        createdBy: "admin@example.com",
      }}
      saveData={async (data) => {
        console.log("Save:", data);
        return data;
      }}
    />
  ),
};

export const Empty: StoryObj = {
  render: () => (
    <FormEngine
      programName="storybook"
      configName="workflowForm"
      formConfig={workflowFormConfig}
      defaultValues={{}}
      saveData={async (data) => {
        console.log("Save:", data);
        return data;
      }}
    />
  ),
};
