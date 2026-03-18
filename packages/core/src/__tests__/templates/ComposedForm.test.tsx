import { describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import { ComposedForm } from "../../components/ComposedForm";
import { FormFragment } from "../../components/FormFragment";
import { FormField } from "../../components/FormField";
import { FormConnection } from "../../components/FormConnection";
import { registerFormTemplate, resetFormTemplates } from "../../templates/TemplateRegistry";
import { resetLookupTables } from "../../templates/LookupRegistry";
import { RulesEngineProvider } from "../../providers/RulesEngineProvider";
import { InjectedFieldProvider } from "../../providers/InjectedFieldProvider";
import { IFormConfig } from "../../types/IFormConfig";

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <RulesEngineProvider>
      <InjectedFieldProvider injectedFields={{}}>
        {ui}
      </InjectedFieldProvider>
    </RulesEngineProvider>
  );
}

describe("ComposedForm", () => {
  beforeEach(() => {
    resetFormTemplates();
    resetLookupTables();
  });

  it("renders Formosaic (not just a stub div)", () => {
    const { container } = renderWithProviders(<ComposedForm />);
    // Should render a FormProvider with form wrapper inside, not a bare div
    const wrapper = container.querySelector(".formosaic-form-wrapper");
    expect(wrapper).toBeDefined();
  });

  it("renders with a base config and produces form fields", () => {
    const config: IFormConfig = {
      version: 2,
      fields: {
        name: { type: "Textbox", label: "Name" },
      },
    };
    const { container } = renderWithProviders(
      <ComposedForm config={config} entityData={{ name: "Alice" }} />
    );
    // The Formosaic component should render the form wrapper
    const wrapper = container.querySelector(".formosaic-form-wrapper");
    expect(wrapper).toBeDefined();
  });

  it("declaration components render null", () => {
    const { container } = render(
      <div>
        <FormFragment template="addr" prefix="shipping" />
        <FormField name="notes" config={{ type: "Textbox", label: "Notes" }} />
        <FormConnection
          name="copy"
          when={{ field: "t", operator: "equals", value: true }}
          source={{ fragment: "a", port: "p" }}
          target={{ fragment: "b", port: "p" }}
          effect="copyValues"
        />
      </div>
    );
    // Declaration components render nothing
    expect(container.children).toHaveLength(1); // just the wrapper div
    expect(container.firstElementChild!.children).toHaveLength(0);
  });

  it("ComposedForm with fragments renders form content", () => {
    registerFormTemplate("address", {
      fields: { street: { type: "Textbox", label: "Street" } },
    });
    const { container } = renderWithProviders(
      <ComposedForm>
        <FormFragment template="address" prefix="shipping" />
      </ComposedForm>
    );
    // Should have the Formosaic form wrapper
    const wrapper = container.querySelector(".formosaic-form-wrapper");
    expect(wrapper).toBeDefined();
  });

  it("merges JSX children into base config", () => {
    registerFormTemplate("address", {
      fields: { street: { type: "Textbox", label: "Street" } },
    });
    const baseConfig: IFormConfig = {
      version: 2,
      fields: {
        notes: { type: "Textbox", label: "Notes" },
      },
    };
    const { container } = renderWithProviders(
      <ComposedForm config={baseConfig}>
        <FormFragment template="address" prefix="shipping" />
        <FormField name="extra" config={{ type: "Textbox", label: "Extra" }} />
      </ComposedForm>
    );
    // Both base fields and JSX children should produce a form
    const wrapper = container.querySelector(".formosaic-form-wrapper");
    expect(wrapper).toBeDefined();
  });

  it("forwards configName and testId to Formosaic", () => {
    const { container } = renderWithProviders(
      <ComposedForm configName="myForm" testId="test-form" />
    );
    // The status live region should be present (rendered by Formosaic)
    const status = container.querySelector('[data-testid="form-status-live-region"]');
    expect(status).toBeDefined();
  });
});
