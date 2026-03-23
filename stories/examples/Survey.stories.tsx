import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Formosaic,
  RulesEngineProvider,
  InjectedFieldProvider,
  type IFormConfig,
} from "@formosaic/core";
import { createFluentFieldRegistry } from "@formosaic/fluent";
import surveyConfig from "../../examples/configs/survey.json";
import { bootstrapSurvey } from "../../examples/configs/survey.bootstrap";

bootstrapSurvey();

const registry = createFluentFieldRegistry();

const meta: Meta = {
  title: "Examples/Survey",
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
        A product feedback survey demonstrating: a Pain Points wizard step that
        becomes visible only when the satisfaction score is below 3; a{" "}
        <code>not</code> operator condition that shows a &ldquo;How did you hear
        about us?&rdquo; field for first-time users; and a computed progress
        indicator (read-only field) that tracks how many of the nine key
        questions have been answered.
      </p>
      <Formosaic
        configName="survey-default"
        formConfig={surveyConfig as unknown as IFormConfig}
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
        Survey prefilled for a dissatisfied returning user — satisfaction is 2
        so the Pain Points step is visible, and the &ldquo;How did you hear about
        us?&rdquo; field is hidden since this is not a first-time user.
      </p>
      <Formosaic
        configName="survey-prefilled"
        formConfig={surveyConfig as unknown as IFormConfig}
        defaultValues={{
          ageRange: "25_34",
          role: "developer",
          industry: "technology",
          usedBefore: true,
          usageFrequency: "weekly",
          featuresUsed: ["rules_engine", "wizard", "computed_values"],
          satisfaction: 2,
          npsScore: 4,
          painPoints: ["performance", "documentation"],
          openFeedback: "The rules engine is powerful but the documentation could be improved with more real-world examples.",
        }}
        saveData={async (data) => {
          console.log("Save:", data);
          return data;
        }}
      />
    </div>
  ),
};
