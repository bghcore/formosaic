import React from "react";
import type { Preview, Decorator } from "@storybook/react";
import {
  FluentProvider,
  webLightTheme,
  webDarkTheme,
} from "@fluentui/react-components";
import {
  RulesEngineProvider,
  InjectedFieldProvider,
} from "@form-eng/core";

/** Wraps every story with Fluent UI theming + the required library providers */
const withProviders: Decorator = (Story, context) => {
  const theme =
    context.globals.theme === "dark" ? webDarkTheme : webLightTheme;

  return (
    <FluentProvider theme={theme}>
      <RulesEngineProvider>
        <InjectedFieldProvider>
          <div style={{ padding: "24px", maxWidth: "600px" }}>
            <Story />
          </div>
        </InjectedFieldProvider>
      </RulesEngineProvider>
    </FluentProvider>
  );
};

const preview: Preview = {
  decorators: [withProviders],
  globalTypes: {
    theme: {
      description: "Fluent UI theme",
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "light",
  },
  parameters: {
    controls: { expanded: true },
    docs: {
      toc: true,
    },
  },
};

export default preview;
