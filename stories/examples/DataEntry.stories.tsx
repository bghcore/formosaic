import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Formosaic,
  RulesEngineProvider,
  InjectedFieldProvider,
  registerValueFunctions,
} from "@formosaic/core";
import { createFluentFieldRegistry } from "@formosaic/fluent";
import { dataEntryFormConfig } from "../../packages/examples/src/data-entry/dataEntryConfig";

// Register the custom value function used by the subtotal computed field.
// sumLineItems is a placeholder; the $values references inside FieldArray items
// handle the per-row line total calculation automatically.
registerValueFunctions({
  sumLineItems: (_context) => {
    return 0;
  },
});

const registry = createFluentFieldRegistry();

const meta: Meta = {
  title: "Examples/Data Entry",
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
        A purchase-order data entry form demonstrating: a FieldArray with
        repeating line items where each row computes its own line total via{" "}
        <code>$values.quantity * $values.unitPrice</code>; subtotal, tax, and
        grand total read-only fields driven by computed expressions; dropdown
        dependencies where subcategory options change based on the selected
        category (Electronics, Office Supplies, or Furniture); and cross-field
        validation requiring the end date to be after the start date.
      </p>
      <Formosaic
        configName="dataEntry-default"
        formConfig={dataEntryFormConfig}
        isCreate={true}
        defaultValues={{
          lineItems: [
            { description: "", quantity: 1, unitPrice: 0, lineTotal: 0 },
          ],
          taxRate: "0.08",
        }}
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
        Data entry form prefilled with an electronics order &mdash; two line
        items with quantities and prices, the Electronics category with Laptops
        subcategory selected, date range set, and 8% tax applied so all computed
        totals are visible.
      </p>
      <Formosaic
        configName="dataEntry-prefilled"
        formConfig={dataEntryFormConfig}
        isCreate={false}
        defaultValues={{
          invoiceNumber: "INV-2024-001",
          category: "electronics",
          subcategory: "laptops",
          startDate: "2024-03-01",
          endDate: "2024-03-31",
          lineItems: [
            {
              description: "Dell XPS 15 Laptop",
              quantity: 2,
              unitPrice: 1299.99,
              lineTotal: 2599.98,
            },
            {
              description: "USB-C Hub",
              quantity: 5,
              unitPrice: 49.99,
              lineTotal: 249.95,
            },
          ],
          subtotal: 2849.93,
          taxRate: "0.08",
          taxAmount: 227.99,
          grandTotal: 3077.92,
          notes: "Priority shipping requested.",
        }}
        saveData={async (data) => {
          console.log("Save:", data);
          return data;
        }}
      />
    </div>
  ),
};
