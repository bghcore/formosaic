import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Formosaic,
  RulesEngineProvider,
  InjectedFieldProvider,
  type IFormConfig,
} from "@formosaic/core";
import { createFluentFieldRegistry } from "@formosaic/fluent";
import jobApplicationConfig from "../../examples/configs/job-application.json";
import { bootstrapJobApplication } from "../../examples/configs/job-application.bootstrap";

bootstrapJobApplication();

const registry = createFluentFieldRegistry();

const meta: Meta = {
  title: "Examples/Job Application",
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
        A multi-step job application wizard demonstrating: a conditional
        Portfolio step that appears only for Designer and Frontend Engineer
        roles; a Slider-driven seniority filter that restricts dropdown options
        based on years of experience (8+ years unlocks Staff/Principal/Director);
        and a computed <code>overallRating</code> read-only field that averages
        the four self-assessment Rating fields via a registered value function.
      </p>
      <Formosaic
        configName="jobApplication-default"
        formConfig={jobApplicationConfig as unknown as IFormConfig}
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
        Job application prefilled for a senior frontend engineer — Portfolio
        step is visible, seniority options are expanded (8+ years), and all
        four rating fields are set so the computed average is shown.
      </p>
      <Formosaic
        configName="jobApplication-prefilled"
        formConfig={jobApplicationConfig as unknown as IFormConfig}
        defaultValues={{
          fullName: "Alex Kim",
          email: "alex.kim@example.com",
          phone: "+14155550192",
          linkedIn: "https://linkedin.com/in/alexkim",
          role: "frontend",
          department: "engineering",
          startDate: "2026-05-01",
          salaryExpectation: 155000,
          yearsExperience: 10,
          seniority: "staff",
          portfolioUrl: "https://alexkim.dev",
          coverLetter: "I am excited to join your engineering team...",
          ratingCommunication: 4,
          ratingTechnical: 5,
          ratingLeadership: 4,
          ratingProblemSolving: 5,
          previousRoles: [
            { company: "Acme Corp", title: "Senior Engineer", duration: "3 years" },
            { company: "Startup Inc", title: "Frontend Lead", duration: "4 years" },
          ],
        }}
        saveData={async (data) => {
          console.log("Save:", data);
          return data;
        }}
      />
    </div>
  ),
};
