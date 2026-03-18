import React, { useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Formosaic,
  RulesEngineProvider,
  InjectedFieldProvider,
  UseInjectedFieldContext,
  registerFormTemplate,
  registerLookupTables,
  resetFormTemplates,
  resetLookupTables,
  resolveTemplates,
} from "@formosaic/core";
import type { IFormConfig } from "@formosaic/core";
import { createFluentFieldRegistry } from "@formosaic/fluent";

/**
 * **Basic Template** demonstrates `registerFormTemplate()` + `resolveTemplates()`.
 *
 * A single `address` template is instantiated twice — once for the shipping
 * address and once for the billing address — without duplicating field
 * definitions. A top-level "Same as shipping" toggle is wired up via rules.
 *
 * Key APIs shown:
 * - `registerFormTemplate(name, template)` — registers a reusable field group
 * - `registerLookupTables(tables)` — registers shared option lists
 * - `resolveTemplates(config)` — expands `templateRef` entries into flat fields
 * - `resetFormTemplates()` / `resetLookupTables()` — cleanup (used in decorators)
 */
const meta: Meta = {
  title: "Templates/Basic Template",
  decorators: [
    (Story) => {
      // Register the address template and US state options before each story.
      // Reset on unmount so other stories start with a clean registry.
      registerLookupTables({
        usStates: [
          { value: "AL", label: "Alabama" },
          { value: "AK", label: "Alaska" },
          { value: "AZ", label: "Arizona" },
          { value: "CA", label: "California" },
          { value: "CO", label: "Colorado" },
          { value: "FL", label: "Florida" },
          { value: "GA", label: "Georgia" },
          { value: "IL", label: "Illinois" },
          { value: "NY", label: "New York" },
          { value: "TX", label: "Texas" },
          { value: "WA", label: "Washington" },
        ],
      });

      registerFormTemplate("address", {
        params: {
          required: { type: "boolean", default: false },
          sectionLabel: { type: "string", default: "Address" },
        },
        fields: {
          street: {
            type: "Textbox",
            label: "Street",
            required: "{{params.required}}" as unknown as boolean,
            placeholder: "123 Main St",
          },
          city: {
            type: "Textbox",
            label: "City",
            required: "{{params.required}}" as unknown as boolean,
            placeholder: "Springfield",
          },
          state: {
            type: "Dropdown",
            label: "State",
            options: "$lookup.usStates" as unknown as Array<{ value: string; label: string }>,
          },
          zip: {
            type: "Textbox",
            label: "ZIP Code",
            placeholder: "12345",
            validate: [{ name: "pattern", params: { pattern: "^\\d{5}(-\\d{4})?$" }, message: "Enter a valid ZIP code" }],
          },
        },
        fieldOrder: ["street", "city", "state", "zip"],
        ports: {
          allFields: ["street", "city", "state", "zip"],
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
      // Cleanup after each story render cycle
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
// Shared form config — built once at module level after templates are
// registered in the decorator. The decorator runs before every story render,
// so by the time this is evaluated the templates are available.
//
// We use resolveTemplates() to expand the templateRef entries into a flat
// IFormConfig the rules engine can consume directly.
// ---------------------------------------------------------------------------

function buildAddressFormConfig(): IFormConfig {
  const raw: IFormConfig = {
    version: 2,
    fields: {
      // Top-level "same as shipping" toggle
      sameAsShipping: {
        type: "Toggle",
        label: "Billing same as shipping",
        defaultValue: false,
      },
      // Two address fragments — same template, different prefixes
      shipping: {
        templateRef: "address",
        templateParams: { required: true, sectionLabel: "Shipping Address" },
      } as unknown as IFormConfig["fields"][string],
      billing: {
        templateRef: "address",
        templateParams: { required: false, sectionLabel: "Billing Address" },
        // When "sameAsShipping" is true the billing fields become read-only
        // (the connection is handled via rules on the top-level field below)
      } as unknown as IFormConfig["fields"][string],
    },
    fieldOrder: ["sameAsShipping", "shipping", "billing"],
    settings: { manualSave: true },
  };

  // Resolve template refs → flat IFormConfig
  const resolved = resolveTemplates(raw);

  // Add a rule: when sameAsShipping = true, make billing fields read-only
  const firstBillingField = resolved.fields["billing.street"];
  if (firstBillingField) {
    firstBillingField.rules = [
      ...(firstBillingField.rules ?? []),
      {
        id: "billing-readonly-when-same",
        when: { field: "sameAsShipping", operator: "equals", value: true },
        then: {
          fields: {
            "billing.street": { readOnly: true },
            "billing.city": { readOnly: true },
            "billing.state": { readOnly: true },
            "billing.zip": { readOnly: true },
          },
        },
        else: {
          fields: {
            "billing.street": { readOnly: false },
            "billing.city": { readOnly: false },
            "billing.state": { readOnly: false },
            "billing.zip": { readOnly: false },
          },
        },
      },
    ];
  }

  return resolved;
}

// ---------------------------------------------------------------------------
// FieldRegistrar — registers the Fluent field components
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

/** Address template used twice (shipping + billing) with a "same as shipping" toggle. */
export const Default: StoryObj = {
  render: () => {
    const formConfig = buildAddressFormConfig();
    return (
      <FieldRegistrar>
        <div style={{ maxWidth: 640 }}>
          <p style={{ color: "#555", fontSize: 14, marginBottom: 16 }}>
            The <strong>address</strong> template is registered once and
            instantiated as both a <em>shipping</em> and <em>billing</em>{" "}
            fragment. Toggle "Billing same as shipping" to make the billing
            fields read-only.
          </p>
          <Formosaic
            configName="address-template-demo"
            formConfig={formConfig}
            defaultValues={{
              sameAsShipping: false,
              "shipping.street": "",
              "shipping.city": "",
              "shipping.state": "",
              "shipping.zip": "",
              "billing.street": "",
              "billing.city": "",
              "billing.state": "",
              "billing.zip": "",
            }}
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

/** Pre-filled shipping address — billing starts as read-only (same as shipping toggled on). */
export const PrefilledSameAsShipping: StoryObj = {
  render: () => {
    const formConfig = buildAddressFormConfig();
    return (
      <FieldRegistrar>
        <div style={{ maxWidth: 640 }}>
          <p style={{ color: "#555", fontSize: 14, marginBottom: 16 }}>
            Billing is locked to "same as shipping". Toggle off to unlock.
          </p>
          <Formosaic
            configName="address-template-prefilled"
            formConfig={formConfig}
            defaultValues={{
              sameAsShipping: true,
              "shipping.street": "742 Evergreen Terrace",
              "shipping.city": "Springfield",
              "shipping.state": "IL",
              "shipping.zip": "62701",
              "billing.street": "742 Evergreen Terrace",
              "billing.city": "Springfield",
              "billing.state": "IL",
              "billing.zip": "62701",
            }}
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

/** Template params — shipping fields are required, billing fields are optional. */
export const RequiredShipping: StoryObj = {
  render: () => {
    // Resolve a variant where only shipping is required
    const raw: IFormConfig = {
      version: 2,
      fields: {
        shipping: {
          templateRef: "address",
          templateParams: { required: true },
        } as unknown as IFormConfig["fields"][string],
        billing: {
          templateRef: "address",
          templateParams: { required: false },
        } as unknown as IFormConfig["fields"][string],
      },
      fieldOrder: ["shipping", "billing"],
      settings: { manualSave: true },
    };
    const formConfig = resolveTemplates(raw);

    return (
      <FieldRegistrar>
        <div style={{ maxWidth: 640 }}>
          <p style={{ color: "#555", fontSize: 14, marginBottom: 16 }}>
            The <code>required</code> template parameter controls which fields
            are required. Shipping is required; billing is optional.
          </p>
          <Formosaic
            configName="address-required-params"
            formConfig={formConfig}
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
