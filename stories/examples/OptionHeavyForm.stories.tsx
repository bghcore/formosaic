import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  FormEngine,
  RulesEngineProvider,
  InjectedFieldProvider,
} from "@form-eng/core";
import { createFluentFieldRegistry } from "@form-eng/fluent";
import { optionHeavyFormConfig } from "../../packages/core/src/__tests__/__fixtures__/businessForms";

const registry = createFluentFieldRegistry();

const meta: Meta = {
  title: "Examples/Option Heavy Form",
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
      configName="optionHeavyForm"
      formConfig={optionHeavyFormConfig}
      defaultValues={{
        largeDropdown: "opt50",
        largeMultiSelect: ["tag1", "tag10", "tag20"],
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
      configName="optionHeavyForm"
      formConfig={optionHeavyFormConfig}
      defaultValues={{}}
      saveData={async (data) => {
        console.log("Save:", data);
        return data;
      }}
    />
  ),
};
