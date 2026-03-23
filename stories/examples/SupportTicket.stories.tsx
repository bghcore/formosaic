import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Formosaic,
  RulesEngineProvider,
  InjectedFieldProvider,
  type IFormConfig,
} from "@formosaic/core";
import { createFluentFieldRegistry } from "@formosaic/fluent";
import supportTicketConfig from "../../examples/configs/support-ticket.json";

const registry = createFluentFieldRegistry();

const meta: Meta = {
  title: "Examples/Support Ticket",
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
        A support ticket form demonstrating 3-level cascading dropdowns:
        selecting a product filters the category list, and selecting a category
        filters the subcategory list. A rule also auto-sets priority to{" "}
        <strong>Critical</strong> when severity is &ldquo;Outage / Service Down&rdquo;,
        illustrating cross-field effects driven by a single condition. No
        bootstrap function is needed — this config is pure JSON.
      </p>
      <Formosaic
        configName="supportTicket-default"
        formConfig={supportTicketConfig as unknown as IFormConfig}
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
        Support ticket prefilled with an outage scenario — severity is set to
        &ldquo;Outage / Service Down&rdquo; so the priority field is automatically set to
        Critical by the rules engine, demonstrating a cross-field computed effect.
      </p>
      <Formosaic
        configName="supportTicket-prefilled"
        formConfig={supportTicketConfig as unknown as IFormConfig}
        defaultValues={{
          product: "platform",
          category: "api",
          subcategory: "timeout",
          severity: "outage",
          priority: "critical",
          title: "Production API down — all requests returning 503",
          description: "Our API endpoints have been returning 503 errors for the past 30 minutes. This is affecting all customers.",
          affectedUsers: 5000,
          isBlocking: true,
        }}
        saveData={async (data) => {
          console.log("Save:", data);
          return data;
        }}
      />
    </div>
  ),
};
