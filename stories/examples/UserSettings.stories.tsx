import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Formosaic,
  RulesEngineProvider,
  InjectedFieldProvider,
  type IFormConfig,
} from "@formosaic/core";
import { createFluentFieldRegistry } from "@formosaic/fluent";
import userSettingsConfig from "../../examples/configs/user-settings.json";
import { bootstrapUserSettings } from "../../examples/configs/user-settings.bootstrap";

bootstrapUserSettings();

const registry = createFluentFieldRegistry();

const meta: Meta = {
  title: "Examples/User Settings",
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
    <div>
      <p>
        A user settings form demonstrating: selecting the &ldquo;Custom&rdquo; theme
        reveals a ColorPicker for accent color and a Slider for font size;
        enabling email notifications reveals a digest frequency dropdown;
        and a language selector that wires into the{" "}
        <code>LocaleRegistry</code> so all form labels and system strings
        switch locale live.
      </p>
      <Formosaic
        configName="userSettings-default"
        formConfig={userSettingsConfig as unknown as IFormConfig}
        defaultValues={{}}
        saveData={async (data) => {
          console.log("Save:", data);
          return data;
        }}
      />
    </div>
  ),
};

export const Prefilled: StoryObj = {
  render: () => (
    <div>
      <p>
        User settings prefilled with a Custom theme (ColorPicker and font-size
        Slider visible) and email notifications enabled (digest frequency
        visible).
      </p>
      <Formosaic
        configName="userSettings-prefilled"
        formConfig={userSettingsConfig as unknown as IFormConfig}
        defaultValues={{
          displayName: "Sam Rivera",
          language: "en",
          theme: "custom",
          accentColor: "#6366f1",
          fontScale: 125,
          emailNotifications: true,
          digestFrequency: "daily",
          twoFactorAuth: true,
          twoFactorMethod: "authenticator_app",
          sessionTimeout: "8h",
          dataExportFormat: "json",
          marketingOptIn: false,
        }}
        saveData={async (data) => {
          console.log("Save:", data);
          return data;
        }}
      />
    </div>
  ),
};
