import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Formosaic,
  RulesEngineProvider,
  InjectedFieldProvider,
} from "@formosaic/core";
import { createFluentFieldRegistry } from "@formosaic/fluent";
import { loginMfaFormConfig } from "../../packages/examples/src/login-mfa/loginMfaConfig";

const registry = createFluentFieldRegistry();

const meta: Meta = {
  title: "Examples/Login + MFA",
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
        A login form with optional multi-factor authentication demonstrating:
        a Toggle that conditionally shows MFA fields via{" "}
        <code>then</code>/<code>else</code> rules; dynamic MFA code label that
        updates based on the selected method (Authenticator App, SMS, or Email);
        and conditional validation so the 6-digit code pattern only applies when
        MFA is enabled.
      </p>
      <Formosaic
        configName="loginMfa-default"
        formConfig={loginMfaFormConfig}
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
        Login form prefilled with MFA enabled and the SMS method selected &mdash;
        all three MFA fields are visible, the code label reads &ldquo;Enter the
        6-digit code sent to your phone&rdquo;, and the remember-device toggle is
        shown.
      </p>
      <Formosaic
        configName="loginMfa-prefilled"
        formConfig={loginMfaFormConfig}
        defaultValues={{
          email: "user@example.com",
          password: "SecurePass1",
          enableMfa: true,
          mfaMethod: "sms",
          mfaCode: "",
          rememberDevice: false,
        }}
        saveData={async (data) => {
          console.log("Save:", data);
          return data;
        }}
      />
    </div>
  ),
};
