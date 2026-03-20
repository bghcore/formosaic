import React, { useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Formosaic,
  RulesEngineProvider,
  InjectedFieldProvider,
  UseInjectedFieldContext,
  registerFormTemplate,
  registerFormTemplates,
  registerLookupTables,
  resetFormTemplates,
  resetLookupTables,
  resolveTemplates,
} from "@formosaic/core";
import type { IFormConfig } from "@formosaic/core";
import { createFluentFieldRegistry } from "@formosaic/fluent";

/**
 * **Nested Templates** demonstrates templates that reference other templates,
 * building a hierarchy of reusable field groups.
 *
 * Hierarchy:
 * ```
 * contactInfo  (template)
 *   ├─ name         — standalone fields
 *   ├─ email        — standalone fields
 *   └─ address      ← templateRef (uses the "address" template)
 *        ├─ street
 *        ├─ city
 *        ├─ state
 *        └─ zip
 * ```
 *
 * A form config then uses `contactInfo` twice (primary + emergency contact)
 * showing that deep nesting resolves correctly.
 *
 * Key APIs shown:
 * - `registerFormTemplates(map)` — bulk template registration
 * - Nested `templateRef` inside a template's `fields`
 * - `resolveTemplates()` — recursive expansion with depth guard
 * - `templateOverrides` — per-fragment field overrides applied at resolve time
 */
const meta: Meta = {
  title: "Templates/Nested Templates",
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
        relationships: [
          { value: "spouse", label: "Spouse" },
          { value: "parent", label: "Parent" },
          { value: "sibling", label: "Sibling" },
          { value: "friend", label: "Friend" },
          { value: "colleague", label: "Colleague" },
        ],
      });

      // Leaf template: address fields only
      const addressTemplate = {
        params: {
          required: { type: "boolean" as const, default: false },
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
          },
          state: {
            type: "Dropdown",
            label: "State",
            options: "{{$lookup.usStates}}" as unknown as Array<{ value: string; label: string }>,
          },
          zip: {
            type: "Textbox",
            label: "ZIP Code",
            placeholder: "12345",
          },
        },
        fieldOrder: ["street", "city", "state", "zip"],
        ports: {
          allFields: ["street", "city", "state", "zip"],
        },
      };

      // Parent template: contactInfo contains personal fields + an address templateRef
      const contactInfoTemplate = {
        params: {
          required: { type: "boolean" as const, default: false },
          showRelationship: { type: "boolean" as const, default: false },
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
          email: {
            type: "Textbox",
            label: "Email",
            validate: [{ name: "email" }],
          },
          phone: {
            type: "Textbox",
            label: "Phone",
            placeholder: "(555) 555-5555",
          },
          relationship: {
            type: "Dropdown",
            label: "Relationship",
            hidden: true,
            options: "{{$lookup.relationships}}" as unknown as Array<{ value: string; label: string }>,
            rules: [
              {
                id: "show-relationship",
                when: {
                  field: "showRelationship",
                  operator: "equals" as const,
                  value: true,
                },
                then: { fields: { relationship: { hidden: false } } },
                else: { fields: { relationship: { hidden: true } } },
              },
            ],
          },
          // Nested templateRef — contactInfo uses address internally
          address: {
            templateRef: "address",
            templateParams: { required: "{{params.required}}" },
          } as unknown as IFormConfig["fields"][string],
        },
        fieldOrder: [
          "firstName",
          "lastName",
          "email",
          "phone",
          "relationship",
          "address",
        ],
        ports: {
          allFields: [
            "firstName",
            "lastName",
            "email",
            "phone",
            "relationship",
          ],
        },
      };

      registerFormTemplates({ address: addressTemplate, contactInfo: contactInfoTemplate });

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
 * Primary contact using `contactInfo` template.
 *
 * Resolved field names follow the nesting path:
 * `primary.firstName`, `primary.address.street`, etc.
 */
export const SingleContactInfo: StoryObj = {
  render: () => {
    const raw: IFormConfig = {
      version: 2,
      fields: {
        primary: {
          templateRef: "contactInfo",
          templateParams: { required: true, showRelationship: false },
        } as unknown as IFormConfig["fields"][string],
      },
      fieldOrder: ["primary"],
      settings: { manualSave: true },
    };
    const formConfig = resolveTemplates(raw);

    return (
      <FieldRegistrar>
        <div style={{ maxWidth: 640 }}>
          <p style={{ color: "#555", fontSize: 14, marginBottom: 16 }}>
            A single <strong>contactInfo</strong> template that internally
            nests an <strong>address</strong> template. Resolved fields:
            {" "}<code>primary.firstName</code>,{" "}
            <code>primary.address.street</code>, etc.
          </p>
          <Formosaic
            configName="nested-single-contact"
            formConfig={formConfig}
            defaultValues={{
              "primary.firstName": "Jane",
              "primary.lastName": "Doe",
              "primary.email": "jane@example.com",
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

/**
 * Primary + emergency contact — the `contactInfo` template is used twice.
 * The emergency contact shows the "Relationship" dropdown via the
 * `showRelationship` template parameter.
 */
export const PrimaryAndEmergencyContact: StoryObj = {
  render: () => {
    const raw: IFormConfig = {
      version: 2,
      fields: {
        primary: {
          templateRef: "contactInfo",
          templateParams: { required: true, showRelationship: false },
        } as unknown as IFormConfig["fields"][string],
        emergency: {
          templateRef: "contactInfo",
          templateParams: { required: false, showRelationship: true },
        } as unknown as IFormConfig["fields"][string],
      },
      fieldOrder: ["primary", "emergency"],
      settings: { manualSave: true },
    };
    const formConfig = resolveTemplates(raw);

    return (
      <FieldRegistrar>
        <div style={{ maxWidth: 640 }}>
          <p style={{ color: "#555", fontSize: 14, marginBottom: 16 }}>
            The <strong>contactInfo</strong> template is instantiated twice.
            The emergency contact uses{" "}
            <code>showRelationship: true</code> to expose the Relationship
            dropdown. Both fragments nest the <strong>address</strong>{" "}
            template, resolving to paths like{" "}
            <code>emergency.address.street</code>.
          </p>
          <Formosaic
            configName="nested-primary-emergency"
            formConfig={formConfig}
            defaultValues={{
              "primary.firstName": "Jane",
              "primary.lastName": "Doe",
              "primary.email": "jane@example.com",
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

/**
 * `templateOverrides` — demonstrates overriding individual fields of a
 * nested template at the parent's instantiation site.
 *
 * The `primary.address.zip` field is made required via overrides even
 * though the address template defaults it to optional.
 */
export const WithTemplateOverrides: StoryObj = {
  render: () => {
    const raw: IFormConfig = {
      version: 2,
      fields: {
        primary: {
          templateRef: "contactInfo",
          templateParams: { required: false },
          templateOverrides: {
            // Override the email field to add a custom placeholder
            email: { placeholder: "work@company.com", required: true },
          },
        } as unknown as IFormConfig["fields"][string],
      },
      fieldOrder: ["primary"],
      settings: { manualSave: true },
    };
    const formConfig = resolveTemplates(raw);

    return (
      <FieldRegistrar>
        <div style={{ maxWidth: 640 }}>
          <p style={{ color: "#555", fontSize: 14, marginBottom: 16 }}>
            <code>templateOverrides</code> patches individual fields at
            resolve time. Here the <code>email</code> field receives a
            custom placeholder and is made required without modifying the
            template definition.
          </p>
          <Formosaic
            configName="nested-overrides"
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
