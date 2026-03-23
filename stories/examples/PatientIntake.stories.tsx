import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Formosaic,
  RulesEngineProvider,
  InjectedFieldProvider,
  type IFormConfig,
} from "@formosaic/core";
import { createFluentFieldRegistry } from "@formosaic/fluent";
import patientIntakeConfig from "../../examples/configs/patient-intake.json";
import { bootstrapPatientIntake } from "../../examples/configs/patient-intake.bootstrap";

bootstrapPatientIntake();

const registry = createFluentFieldRegistry();

const meta: Meta = {
  title: "Examples/Patient Intake",
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
        A medical patient intake form demonstrating: Toggle-driven conditional
        sections for allergies, medications, and insurance; <code>arrayContains</code>{" "}
        rules that surface an urgent warning and make emergency contact fields
        required when chest pain or shortness of breath are selected; and async
        insurance ID validation (IDs starting with &ldquo;VALID&rdquo; or 8+ chars pass
        after a simulated 500 ms API call).
      </p>
      <Formosaic
        configName="patientIntake-default"
        formConfig={patientIntakeConfig as unknown as IFormConfig}
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
        Patient intake prefilled with a returning patient who has allergies,
        an active medication, and health insurance — demonstrating all three
        conditional sections open simultaneously.
      </p>
      <Formosaic
        configName="patientIntake-prefilled"
        formConfig={patientIntakeConfig as unknown as IFormConfig}
        defaultValues={{
          firstName: "Maria",
          lastName: "Santos",
          dateOfBirth: "1985-03-14",
          gender: "female",
          bloodType: "O+",
          phone: "+15551234567",
          emergencyContactName: "Carlos Santos",
          emergencyContactPhone: "+15559876543",
          symptoms: ["headache", "fatigue"],
          hasAllergies: true,
          allergies: [
            { allergen: "Penicillin", severity: "severe", reaction: "Anaphylaxis" },
          ],
          hasMedications: true,
          medications: [
            { name: "Lisinopril", dosage: "10mg", frequency: "once_daily" },
          ],
          hasInsurance: true,
          insuranceProvider: "bcbs",
          insuranceId: "VALID123456",
          insuranceGroupNumber: "GRP-789",
          notes: "Patient prefers morning appointments.",
        }}
        saveData={async (data) => {
          console.log("Save:", data);
          return data;
        }}
      />
    </div>
  ),
};
