import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Formosaic,
  RulesEngineProvider,
  InjectedFieldProvider,
} from "@formosaic/core";
import { createFluentFieldRegistry } from "@formosaic/fluent";
import { checkoutFormConfig } from "../../packages/examples/src/checkout/checkoutConfig";

const registry = createFluentFieldRegistry();

const meta: Meta = {
  title: "Examples/Checkout Wizard",
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
        A 3-step e-commerce checkout wizard demonstrating: country-driven
        state/province/county options and ZIP/postal-code validation patterns
        that swap when the country changes; payment method branching that shows
        credit/debit card fields or a PayPal email field depending on the
        selection; and linear wizard navigation with per-step validation before
        advancing to the next step.
      </p>
      <Formosaic
        configName="checkout-default"
        formConfig={checkoutFormConfig}
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
        Checkout prefilled on the payment step with a Canadian shipping address
        (province and postal-code validation active) and PayPal selected as the
        payment method &mdash; card fields are hidden and the PayPal email field
        is shown and required.
      </p>
      <Formosaic
        configName="checkout-prefilled"
        formConfig={checkoutFormConfig}
        defaultValues={{
          firstName: "Sophie",
          lastName: "Tremblay",
          addressLine1: "200 Rue Principale",
          addressLine2: "",
          city: "Ottawa",
          country: "CA",
          state: "ON",
          zip: "K1A 0B1",
          paymentMethod: "paypal",
          paypalEmail: "sophie.tremblay@example.com",
          orderNotes: "",
          agreeToTerms: false,
        }}
        saveData={async (data) => {
          console.log("Save:", data);
          return data;
        }}
      />
    </div>
  ),
};
