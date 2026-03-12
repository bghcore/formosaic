import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Formosaic,
  RulesEngineProvider,
  InjectedFieldProvider,
} from "@formosaic/core";
import { createShadcnFieldRegistry } from "./shadcn-fields/registry";
import { profileFormConfig } from "../../packages/core/src/__tests__/__fixtures__/businessForms";

const registry = createShadcnFieldRegistry();

const meta: Meta = {
  title: "Examples/shadcn Reference",
  decorators: [
    (Story) => (
      <RulesEngineProvider>
        <InjectedFieldProvider injectedFields={registry}>
          <div style={{ padding: "24px", maxWidth: "600px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
            <Story />
          </div>
        </InjectedFieldProvider>
      </RulesEngineProvider>
    ),
  ],
};
export default meta;

export const HybridRegistry: StoryObj = {
  render: () => (
    <Formosaic

      configName="shadcnProfile"
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
    <Formosaic

      configName="shadcnProfile"
      formConfig={profileFormConfig}
      defaultValues={{}}
      saveData={async (data) => {
        console.log("Save:", data);
        return data;
      }}
    />
  ),
};
