import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Formosaic,
  RulesEngineProvider,
  InjectedFieldProvider,
  type IFormConfig,
} from "@formosaic/core";
import { createFluentFieldRegistry } from "@formosaic/fluent";
import eventRegistrationConfig from "../../examples/configs/event-registration.json";
import { bootstrapEventRegistration } from "../../examples/configs/event-registration.bootstrap";

bootstrapEventRegistration();

const registry = createFluentFieldRegistry();

const meta: Meta = {
  title: "Examples/Event Registration",
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
        An event registration form demonstrating: a computed pricing field that
        calculates the total from ticket type, guest count, and workshop
        add-ons (VIP tickets include all workshops at no extra charge); VIP
        workshops that become readOnly when the VIP ticket is selected;
        and conditional dietary and accessibility sections that appear only
        when the attendee indicates a requirement.
      </p>
      <Formosaic
        configName="eventRegistration-default"
        formConfig={eventRegistrationConfig as unknown as IFormConfig}
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
        Event registration prefilled for a VIP attendee with a guest, dietary
        restrictions, and accessibility needs — all conditional sections are
        visible and VIP workshop selection is read-only.
      </p>
      <Formosaic
        configName="eventRegistration-prefilled"
        formConfig={eventRegistrationConfig as unknown as IFormConfig}
        defaultValues={{
          firstName: "Priya",
          lastName: "Nair",
          email: "priya.nair@example.com",
          company: "DataViz Labs",
          ticketType: "vip",
          guestCount: 1,
          workshops: ["keynote_breakfast", "deep_dive_ai", "hands_on_lab", "networking_lunch", "panel_discussion"],
          hasDietaryRequirements: true,
          dietaryRequirements: "vegetarian",
          hasAccessibilityNeeds: true,
          accessibilityNeeds: "Wheelchair access and reserved front-row seating required.",
          tshirtSize: "M",
          marketingOptIn: true,
        }}
        saveData={async (data) => {
          console.log("Save:", data);
          return data;
        }}
      />
    </div>
  ),
};
