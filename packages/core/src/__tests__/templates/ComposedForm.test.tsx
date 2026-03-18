import { describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import { ComposedForm } from "../../components/ComposedForm";
import { FormFragment } from "../../components/FormFragment";
import { FormField } from "../../components/FormField";
import { FormConnection } from "../../components/FormConnection";
import { registerFormTemplate, resetFormTemplates } from "../../templates/TemplateRegistry";
import { resetLookupTables } from "../../templates/LookupRegistry";

describe("ComposedForm", () => {
  beforeEach(() => {
    resetFormTemplates();
    resetLookupTables();
  });

  it("renders without crashing", () => {
    const { getByTestId } = render(<ComposedForm />);
    expect(getByTestId("composed-form")).toBeDefined();
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

  it("ComposedForm with fragments does not crash", () => {
    registerFormTemplate("address", {
      fields: { street: { type: "Textbox", label: "Street" } },
    });
    const { getByTestId } = render(
      <ComposedForm>
        <FormFragment template="address" prefix="shipping" />
      </ComposedForm>
    );
    expect(getByTestId("composed-form")).toBeDefined();
  });
});
