import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Formosaic,
  RulesEngineProvider,
  InjectedFieldProvider,
  type IFormConfig,
} from "@formosaic/core";
import { createFluentFieldRegistry } from "@formosaic/fluent";
import vehicleInsuranceQuoteConfig from "../../examples/configs/vehicle-insurance-quote.json";
import { bootstrapVehicleInsuranceQuote } from "../../examples/configs/vehicle-insurance-quote.bootstrap";

bootstrapVehicleInsuranceQuote();

const registry = createFluentFieldRegistry();

const meta: Meta = {
  title: "Examples/Vehicle Insurance Quote",
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
        A vehicle insurance quote form demonstrating: 3-level cascading vehicle
        dropdowns (type → make → model); complex AND/OR/NOT logic — for
        example, an accident count field that only appears when the driver has
        accidents AND is not a new customer; and live premium computation via
        three computed read-only fields (monthly, annual, and coverage summary)
        that update instantly as coverage level, vehicle type, usage, and
        deductible change.
      </p>
      <Formosaic
        configName="vehicleInsuranceQuote-default"
        formConfig={vehicleInsuranceQuoteConfig as unknown as IFormConfig}
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
        Insurance quote prefilled for a high-risk driver: commercial truck
        usage, premium coverage, low deductible, and two prior accidents —
        all surcharges are reflected in the live premium fields.
      </p>
      <Formosaic
        configName="vehicleInsuranceQuote-prefilled"
        formConfig={vehicleInsuranceQuoteConfig as unknown as IFormConfig}
        defaultValues={{
          vehicleType: "truck",
          make: "ford",
          model: "f150",
          year: 2022,
          mileage: 25000,
          usage: "commercial",
          coverageLevel: "premium",
          deductible: 500,
          hasAccidents: true,
          accidentCount: 2,
          hasExistingPolicy: true,
        }}
        saveData={async (data) => {
          console.log("Save:", data);
          return data;
        }}
      />
    </div>
  ),
};
