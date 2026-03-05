import React, { useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FormProvider, useForm } from "react-hook-form";
import {
  FieldArray,
  UseInjectedFieldContext,
  IFieldConfig,
} from "@bghcore/dynamic-forms-core";
import { createFluentFieldRegistry } from "@bghcore/dynamic-forms-fluent";
import { Button, Input } from "@fluentui/react-components";

/**
 * **FieldArray** provides add/remove item functionality using
 * react-hook-form's `useFieldArray`. Each item renders a set of fields
 * defined by the `items` config. Uses render props for full layout control.
 */
const meta: Meta = {
  title: "Composite/FieldArray",
};

export default meta;

function FieldRegistrar(props: { children: React.ReactNode }) {
  const { setInjectedFields } = UseInjectedFieldContext();
  useEffect(() => {
    setInjectedFields(createFluentFieldRegistry());
  }, [setInjectedFields]);
  return <>{props.children}</>;
}

const contactFieldConfig: IFieldConfig = {
  type: "FieldArray",
  label: "Contacts",
  minItems: 1,
  maxItems: 5,
  items: {
    name: { type: "Textbox", required: true, label: "Name" },
    email: { type: "Textbox", required: true, label: "Email" },
    role: { type: "Textbox", required: false, label: "Role" },
  },
};

function FieldArrayDemo() {
  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      contacts: [
        { name: "Alice", email: "alice@example.com", role: "Lead" },
        { name: "Bob", email: "bob@example.com", role: "Developer" },
      ],
    },
  });

  return (
    <FormProvider {...methods}>
      <FieldArray
        fieldName="contacts"
        config={contactFieldConfig}
        renderItem={(itemFieldNames, index, remove) => (
          <div
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "flex-end",
              marginBottom: "8px",
              padding: "12px",
              background: "#fafafa",
              borderRadius: "4px",
              border: "1px solid #e0e0e0",
            }}
          >
            {itemFieldNames.map((fieldName) => {
              const shortName = fieldName.split(".").pop()!;
              return (
                <div key={fieldName} style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      color: "#666",
                      marginBottom: "4px",
                    }}
                  >
                    {shortName}
                  </label>
                  <Input
                    {...methods.register(fieldName as `contacts.${number}.${string}`)}
                    defaultValue={
                      methods.getValues(
                        fieldName as `contacts.${number}.${string}`
                      ) as string
                    }
                    style={{ width: "100%" }}
                  />
                </div>
              );
            })}
            <Button
              appearance="subtle"
              onClick={remove}
              style={{ color: "#d13438" }}
            >
              Remove
            </Button>
          </div>
        )}
        renderAddButton={(append, canAdd) => (
          <Button
            appearance="secondary"
            disabled={!canAdd}
            onClick={append}
            style={{ marginTop: "8px" }}
          >
            + Add Contact {!canAdd && "(max 5)"}
          </Button>
        )}
      />
      <div style={{ marginTop: "16px", fontSize: "12px", color: "#888" }}>
        <strong>Form values:</strong>
        <pre>{JSON.stringify(methods.watch(), null, 2)}</pre>
      </div>
    </FormProvider>
  );
}

export const Default: StoryObj = {
  render: () => (
    <FieldRegistrar>
      <FieldArrayDemo />
    </FieldRegistrar>
  ),
};
