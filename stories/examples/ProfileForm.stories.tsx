import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  FormEngine,
  RulesEngineProvider,
  InjectedFieldProvider,
} from "@form-eng/core";
import { createFluentFieldRegistry } from "@form-eng/fluent";
import { profileFormConfig } from "../../packages/core/src/__tests__/__fixtures__/businessForms";

const registry = createFluentFieldRegistry();

const meta: Meta = {
  title: "Examples/Profile Form",
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

export const Default: StoryObj = {
  render: () => (
    <FormEngine
      programName="storybook"
      configName="profileForm"
      formConfig={profileFormConfig}
      defaultValues={{
        name: "Jane Doe",
        email: "jane@example.com",
        age: 30,
        timezone: "pst",
        theme: "dark",
        memberSince: "2023-01-15",
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
      configName="profileForm"
      formConfig={profileFormConfig}
      defaultValues={{}}
      saveData={async (data) => {
        console.log("Save:", data);
        return data;
      }}
    />
  ),
};
