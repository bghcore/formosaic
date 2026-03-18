import React, { useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  RulesEngineProvider,
  InjectedFieldProvider,
  UseInjectedFieldContext,
  ComposedForm,
  FormFragment,
  FormField,
  FormConnection,
  registerFormTemplate,
  registerLookupTables,
  resetFormTemplates,
  resetLookupTables,
  composeForm,
  Formosaic,
} from "@formosaic/core";
import { createFluentFieldRegistry } from "@formosaic/fluent";

/**
 * **Composed Checkout Form** demonstrates the full Template & Composition
 * system using `composeForm()` and the JSX-based `<ComposedForm>` API.
 *
 * Key APIs shown:
 * - `composeForm(options)` — assembles fragments, standalone fields,
 *   connections, and a wizard config into a single `IFormConfig`
 * - `<ComposedForm>` — JSX-first alternative to `composeForm()`
 * - `<FormFragment>` — declares a template-backed section
 * - `<FormField>` — declares a standalone field
 * - `<FormConnection>` — wires a "copy values" connection between two fragments
 * - Wizard: 3-step checkout (Shipping → Billing → Payment)
 */
const meta: Meta = {
  title: "Templates/Composed Checkout Form",
  decorators: [
    (Story) => {
      registerLookupTables({
        usStates: [
          { value: "AL", label: "Alabama" },
          { value: "CA", label: "California" },
          { value: "FL", label: "Florida" },
          { value: "IL", label: "Illinois" },
          { value: "NY", label: "New York" },
          { value: "TX", label: "Texas" },
          { value: "WA", label: "Washington" },
        ],
      });

      // Address template with a port so connections can reference all fields
      registerFormTemplate("address", {
        params: {
          required: { type: "boolean", default: true },
        },
        fields: {
          firstName: {
            type: "Textbox",
            label: "First Name",
            required: "{{params.required}}" as unknown as boolean,
          },
          lastName: {
            type: "Textbox",
            label: "Last Name",
            required: "{{params.required}}" as unknown as boolean,
          },
          street: {
            type: "Textbox",
            label: "Street Address",
            required: "{{params.required}}" as unknown as boolean,
            placeholder: "123 Main St",
          },
          city: {
            type: "Textbox",
            label: "City",
            required: "{{params.required}}" as unknown as boolean,
          },
          state: {
            type: "Dropdown",
            label: "State",
            required: "{{params.required}}" as unknown as boolean,
            options: "$lookup.usStates" as unknown as Array<{ value: string; label: string }>,
          },
          zip: {
            type: "Textbox",
            label: "ZIP Code",
            placeholder: "12345",
          },
        },
        fieldOrder: ["firstName", "lastName", "street", "city", "state", "zip"],
        ports: {
          allFields: ["firstName", "lastName", "street", "city", "state", "zip"],
        },
      });

      // Payment template
      registerFormTemplate("payment", {
        fields: {
          method: {
            type: "Dropdown",
            label: "Payment Method",
            required: true,
            options: [
              { value: "card", label: "Credit / Debit Card" },
              { value: "paypal", label: "PayPal" },
              { value: "bank", label: "Bank Transfer" },
            ],
          },
          cardNumber: {
            type: "Textbox",
            label: "Card Number",
            hidden: false,
            placeholder: "•••• •••• •••• ••••",
            rules: [
              {
                id: "hide-card-unless-card",
                when: { field: "method", operator: "notEquals", value: "card" },
                then: { fields: { cardNumber: { hidden: true }, cardExpiry: { hidden: true } } },
                else: { fields: { cardNumber: { hidden: false }, cardExpiry: { hidden: false } } },
              },
            ],
          },
          cardExpiry: {
            type: "Textbox",
            label: "Expiry Date",
            hidden: false,
            placeholder: "MM/YY",
          },
        },
        fieldOrder: ["method", "cardNumber", "cardExpiry"],
        ports: {
          allFields: ["method", "cardNumber", "cardExpiry"],
        },
      });

      return (
        <RulesEngineProvider>
          <InjectedFieldProvider injectedFields={createFluentFieldRegistry()}>
            <Story />
          </InjectedFieldProvider>
        </RulesEngineProvider>
      );
    },
    (Story) => {
      React.useEffect(() => {
        return () => {
          resetFormTemplates();
          resetLookupTables();
        };
      }, []);
      return <Story />;
    },
  ],
};

export default meta;

// ---------------------------------------------------------------------------
// FieldRegistrar
// ---------------------------------------------------------------------------

function FieldRegistrar({ children }: { children: React.ReactNode }) {
  const { setInjectedFields } = UseInjectedFieldContext();
  useEffect(() => {
    setInjectedFields(createFluentFieldRegistry());
  }, [setInjectedFields]);
  return <>{children}</>;
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/**
 * `composeForm()` imperative API — assembles fragments, a standalone field,
 * a connection, and a 3-step wizard config in a single call.
 *
 * When "Same as shipping" is toggled, `billing.*` fields are computed from
 * the corresponding `shipping.*` values via the `copyValues` connection.
 */
export const ImperativeComposeForm: StoryObj = {
  render: () => {
    const checkoutConfig = composeForm({
      fragments: {
        shipping: { template: "address", params: { required: true } },
        billing: { template: "address", params: { required: false } },
        payment: { template: "payment" },
      },
      fields: {
        sameAsShipping: {
          type: "Toggle",
          label: "Billing same as shipping",
          defaultValue: false,
        },
        orderNotes: {
          type: "Textarea",
          label: "Order Notes",
          required: false,
        },
      },
      connections: [
        {
          name: "copy-shipping-to-billing",
          when: { field: "sameAsShipping", operator: "equals", value: true },
          source: { fragment: "shipping", port: "allFields" },
          target: { fragment: "billing", port: "allFields" },
          effect: "copyValues",
        },
      ],
      wizard: {
        steps: [
          {
            id: "shipping-step",
            title: "Shipping Address",
            description: "Where should we ship your order?",
            fragments: ["shipping"],
          },
          {
            id: "billing-step",
            title: "Billing Address",
            description: 'Confirm billing details or use "Same as shipping".',
            fields: ["sameAsShipping"],
            fragments: ["billing"],
          },
          {
            id: "payment-step",
            title: "Payment",
            description: "How would you like to pay?",
            fields: ["orderNotes"],
            fragments: ["payment"],
          },
        ],
        linearNavigation: true,
        validateOnStepChange: false,
      },
      settings: { manualSave: true },
    });

    return (
      <FieldRegistrar>
        <div style={{ maxWidth: 640 }}>
          <p style={{ color: "#555", fontSize: 14, marginBottom: 16 }}>
            A 3-step checkout assembled with <code>composeForm()</code>.
            The shipping and billing sections both use the{" "}
            <strong>address</strong> template. A <em>copyValues</em>{" "}
            connection copies shipping fields into billing when the toggle
            is active.
          </p>
          <Formosaic
            configName="checkout-imperative"
            formConfig={checkoutConfig}
            defaultValues={{
              sameAsShipping: false,
              "payment.method": "card",
            }}
            isManualSave={true}
            saveData={async (data) => {
              console.log("Checkout data:", data);
              return data;
            }}
          />
        </div>
      </FieldRegistrar>
    );
  },
};

/**
 * JSX-based `<ComposedForm>` API — fragments and connections declared as
 * child components rather than a plain options object. Functionally identical
 * to `ImperativeComposeForm` but uses the declarative JSX surface.
 */
export const JsxComposedForm: StoryObj = {
  render: () => (
    <FieldRegistrar>
      <div style={{ maxWidth: 640 }}>
        <p style={{ color: "#555", fontSize: 14, marginBottom: 16 }}>
          The same checkout form using the JSX{" "}
          <code>&lt;ComposedForm&gt;</code> API.{" "}
          <code>&lt;FormFragment&gt;</code>,{" "}
          <code>&lt;FormField&gt;</code>, and{" "}
          <code>&lt;FormConnection&gt;</code> are declaration-only components
          — they render nothing and are read by <code>ComposedForm</code> at
          compose time.
        </p>
        <ComposedForm
          configName="checkout-jsx"
          entityData={{ sameAsShipping: false, "payment.method": "card" }}
          settings={{ manualSave: true }}
          onSave={async (data) => {
            console.log("Checkout data:", data);
          }}
        >
          <FormFragment prefix="shipping" template="address" params={{ required: true }} />
          <FormFragment prefix="billing" template="address" params={{ required: false }} />
          <FormFragment prefix="payment" template="payment" />
          <FormField
            name="sameAsShipping"
            config={{
              type: "Toggle",
              label: "Billing same as shipping",
              defaultValue: false,
            }}
          />
          <FormField
            name="orderNotes"
            config={{ type: "Textarea", label: "Order Notes", required: false }}
          />
          <FormConnection
            name="copy-shipping-to-billing"
            when={{ field: "sameAsShipping", operator: "equals", value: true }}
            source={{ fragment: "shipping", port: "allFields" }}
            target={{ fragment: "billing", port: "allFields" }}
            effect="copyValues"
          />
        </ComposedForm>
      </div>
    </FieldRegistrar>
  ),
};

/**
 * Fragments only — no wizard, no connections. Shows the simplest
 * `composeForm()` usage: two address fragments on a single flat form.
 */
export const FlatFragments: StoryObj = {
  render: () => {
    const flatConfig = composeForm({
      fragments: {
        shipping: { template: "address", params: { required: true } },
        billing: {
          template: "address",
          params: { required: false },
          defaultValues: {
            firstName: "Jane",
            lastName: "Doe",
            street: "100 Commerce Blvd",
            city: "Austin",
            state: "TX",
            zip: "78701",
          },
        },
      },
      settings: { manualSave: true },
    });

    return (
      <FieldRegistrar>
        <div style={{ maxWidth: 640 }}>
          <p style={{ color: "#555", fontSize: 14, marginBottom: 16 }}>
            Two address fragments on a flat form. The billing fragment uses{" "}
            <code>defaultValues</code> to pre-fill fields at resolve time.
          </p>
          <Formosaic
            configName="checkout-flat"
            formConfig={flatConfig}
            defaultValues={{}}
            isManualSave={true}
            saveData={async (data) => {
              console.log("Saved:", data);
              return data;
            }}
          />
        </div>
      </FieldRegistrar>
    );
  },
};
