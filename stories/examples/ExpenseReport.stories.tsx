import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Formosaic,
  RulesEngineProvider,
  InjectedFieldProvider,
  type IFormConfig,
} from "@formosaic/core";
import { createFluentFieldRegistry } from "@formosaic/fluent";
import expenseReportConfig from "../../examples/configs/expense-report.json";
import { bootstrapExpenseReport } from "../../examples/configs/expense-report.bootstrap";

bootstrapExpenseReport();

const registry = createFluentFieldRegistry();

const meta: Meta = {
  title: "Examples/Expense Report",
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
        An expense report form demonstrating: a FieldArray for line items where
        each row has a category, description, and amount; a computed total field
        that sums all line item amounts via a registered{" "}
        <code>sumExpenseItems</code> value function; and a rule that makes a
        business justification field required when the computed total exceeds
        $5,000.
      </p>
      <Formosaic
        configName="expenseReport-default"
        formConfig={expenseReportConfig as unknown as IFormConfig}
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
        Expense report prefilled with multiple high-value line items totalling
        over $5,000 — the justification field is automatically required and
        visible.
      </p>
      <Formosaic
        configName="expenseReport-prefilled"
        formConfig={expenseReportConfig as unknown as IFormConfig}
        defaultValues={{
          reportTitle: "AWS Summit San Francisco 2026",
          submitter: "Jordan Lee",
          department: "engineering",
          currency: "USD",
          expenseStartDate: "2026-03-17",
          expenseEndDate: "2026-03-20",
          lineItems: [
            { expenseDate: "2026-03-17", expenseType: "travel", description: "Round-trip airfare SFO-NYC", amount: 820 },
            { expenseDate: "2026-03-17", expenseType: "accommodation", description: "Hotel (4 nights)", amount: 1480 },
            { expenseDate: "2026-03-18", expenseType: "meals", description: "Per diem (5 days)", amount: 275 },
            { expenseDate: "2026-03-18", expenseType: "training", description: "AWS Summit conference ticket", amount: 2499 },
            { expenseDate: "2026-03-19", expenseType: "travel", description: "Taxi / rideshare", amount: 145 },
          ],
          taxRate: 0,
          justification: "Attendance at AWS Summit to evaluate upcoming cloud migration strategy and attend partner sessions directly relevant to our Q3 roadmap.",
          approver: "mgr@example.com",
          agreeToPolicy: true,
        }}
        saveData={async (data) => {
          console.log("Save:", data);
          return data;
        }}
      />
    </div>
  ),
};
