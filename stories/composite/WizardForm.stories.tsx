import React, { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  WizardForm,
  Formosaic,
  UseInjectedFieldContext,
  IFormConfig,
} from "@formosaic/core";
import type {
  IWizardNavigationProps,
  IWizardStepHeaderProps,
} from "@formosaic/core";
import { createFluentFieldRegistry } from "@formosaic/fluent";
import { Button } from "@fluentui/react-components";

/**
 * **WizardForm** provides multi-step form navigation with conditional step
 * visibility. It uses render props for step content, navigation, and headers.
 */
const meta: Meta = {
  title: "Composite/WizardForm",
};

export default meta;

function FieldRegistrar(props: { children: React.ReactNode }) {
  const { setInjectedFields } = UseInjectedFieldContext();
  useEffect(() => {
    setInjectedFields(createFluentFieldRegistry());
  }, [setInjectedFields]);
  return <>{props.children}</>;
}

const wizardConfig: IFormConfig = {
  version: 2,
  fields: {
    name: { type: "Textbox", required: true, label: "Full Name" },
    email: {
      type: "Textbox",
      required: true,
      label: "Email",
      validate: [{ name: "email" }],
    },
    role: {
      type: "Dropdown",
      required: true,
      label: "Role",
      options: [
        { value: "admin", label: "Admin" },
        { value: "editor", label: "Editor" },
        { value: "viewer", label: "Viewer" },
      ],
    },
    permissions: {
      type: "Multiselect",
      required: false,
      label: "Permissions",
      options: [
        { value: "read", label: "Read" },
        { value: "write", label: "Write" },
        { value: "delete", label: "Delete" },
        { value: "admin", label: "Admin" },
      ],
    },
    notifications: {
      type: "Toggle",
      required: false,
      label: "Enable Notifications",
    },
    bio: {
      type: "Textarea",
      required: false,
      label: "Bio",
    },
  },
  fieldOrder: ["name", "email", "role", "permissions", "notifications", "bio"],
  wizard: {
    steps: [
      {
        id: "personal",
        title: "Personal Info",
        description: "Enter your name and email.",
        fields: ["name", "email"],
      },
      {
        id: "access",
        title: "Access & Permissions",
        description: "Configure your role and permissions.",
        fields: ["role", "permissions"],
      },
      {
        id: "preferences",
        title: "Preferences",
        description: "Set your notification and profile preferences.",
        fields: ["notifications", "bio"],
      },
    ],
    linearNavigation: true,
    validateOnStepChange: false,
  },
};

const defaultValues = {
  name: "",
  email: "",
  role: "",
  permissions: [],
  notifications: true,
  bio: "",
};

function StepHeader({ step, stepIndex, totalSteps }: IWizardStepHeaderProps) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ fontSize: "12px", color: "#666" }}>
        Step {stepIndex + 1} of {totalSteps}
      </div>
      <h3 style={{ margin: "4px 0" }}>{step.title}</h3>
      {step.description && (
        <p style={{ margin: 0, color: "#888", fontSize: "14px" }}>
          {step.description}
        </p>
      )}
      <div
        style={{
          height: "4px",
          background: "#e0e0e0",
          borderRadius: "2px",
          marginTop: "12px",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${((stepIndex + 1) / totalSteps) * 100}%`,
            background: "#0078d4",
            borderRadius: "2px",
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}

function StepNavigation({
  canGoPrev,
  canGoNext,
  goPrev,
  goNext,
  currentStepIndex,
  steps,
}: IWizardNavigationProps) {
  const isLast = currentStepIndex === steps.length - 1;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: "24px",
        paddingTop: "16px",
        borderTop: "1px solid #e0e0e0",
      }}
    >
      <Button appearance="secondary" disabled={!canGoPrev} onClick={goPrev}>
        Previous
      </Button>
      {isLast ? (
        <Button
          appearance="primary"
          onClick={() => alert("Wizard complete!")}
        >
          Submit
        </Button>
      ) : (
        <Button appearance="primary" disabled={!canGoNext} onClick={goNext}>
          Next
        </Button>
      )}
    </div>
  );
}

export const Default: StoryObj = {
  render: () => (
    <FieldRegistrar>
      <WizardForm
        wizardConfig={wizardConfig.wizard!}
        entityData={defaultValues}
        renderStepContent={(fields) => (
          <div>
            {fields.map((field) => (
              <div key={field} style={{ marginBottom: "8px", color: "#333" }}>
                Field: <code>{field}</code>
              </div>
            ))}
          </div>
        )}
        renderStepHeader={(props) => <StepHeader {...props} />}
        renderStepNavigation={(props) => <StepNavigation {...props} />}
      />
    </FieldRegistrar>
  ),
};

export const WithFormIntegration: StoryObj = {
  render: () => (
    <FieldRegistrar>
      <div>
        <p style={{ color: "#666", fontSize: "14px", marginBottom: "16px" }}>
          This demonstrates WizardForm managing step navigation while
          Formosaic handles each step's fields.
        </p>
        <WizardForm
          wizardConfig={wizardConfig.wizard!}
          entityData={defaultValues}
          renderStepContent={(fields) => (
            <div
              style={{
                padding: "16px",
                border: "1px solid #e0e0e0",
                borderRadius: "4px",
              }}
            >
              <p style={{ fontSize: "13px", color: "#888" }}>
                Fields in this step:{" "}
                {fields.map((f) => (
                  <code
                    key={f}
                    style={{
                      background: "#f0f0f0",
                      padding: "2px 6px",
                      borderRadius: "3px",
                      marginRight: "4px",
                    }}
                  >
                    {f}
                  </code>
                ))}
              </p>
            </div>
          )}
          renderStepHeader={(props) => <StepHeader {...props} />}
          renderStepNavigation={(props) => <StepNavigation {...props} />}
        />
      </div>
    </FieldRegistrar>
  ),
};
