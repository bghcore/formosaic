import { describe, it, expect, beforeEach } from "vitest";
import { composeForm } from "../../templates/ComposedFormBuilder";
import { registerFormTemplate, resetFormTemplates } from "../../templates/TemplateRegistry";
import { resetLookupTables } from "../../templates/LookupRegistry";

describe("ComposedFormBuilder", () => {
  beforeEach(() => {
    resetFormTemplates();
    resetLookupTables();
  });

  it("composes fragments from templates", () => {
    registerFormTemplate("address", {
      fields: {
        street: { type: "Textbox", label: "Street" },
        city: { type: "Textbox", label: "City" },
      },
      ports: { allFields: ["street", "city"] },
    });
    const config = composeForm({
      fragments: {
        shipping: { template: "address" },
        billing: { template: "address" },
      },
    });
    expect(config.fields["shipping.street"]).toBeDefined();
    expect(config.fields["billing.street"]).toBeDefined();
  });

  it("merges standalone fields alongside fragments", () => {
    registerFormTemplate("address", {
      fields: { street: { type: "Textbox", label: "Street" } },
    });
    const config = composeForm({
      fragments: { shipping: { template: "address" } },
      fields: { notes: { type: "Textbox", label: "Notes" } },
    });
    expect(config.fields["shipping.street"]).toBeDefined();
    expect(config.fields["notes"]).toBeDefined();
  });

  it("compiles connections into rules", () => {
    registerFormTemplate("address", {
      fields: { street: { type: "Textbox", label: "Street" } },
      ports: { allFields: ["street"] },
    });
    const config = composeForm({
      fragments: {
        shipping: { template: "address" },
        billing: { template: "address" },
      },
      fields: { sameAddr: { type: "Toggle", label: "Same?" } },
      connections: [{
        name: "copy",
        when: { field: "sameAddr", operator: "equals", value: true },
        source: { fragment: "shipping", port: "allFields" },
        target: { fragment: "billing", port: "allFields" },
        effect: "copyValues",
      }],
    });
    // Connection should generate rules on some field
    const allRules = Object.values(config.fields).flatMap(f => f.rules ?? []);
    expect(allRules.length).toBeGreaterThan(0);
    const effectFields = allRules[0]?.then?.fields ?? {};
    expect(effectFields["billing.street"]?.computedValue).toBe("$root.shipping.street");
  });

  it("passes through fieldOrder", () => {
    registerFormTemplate("address", {
      fields: { street: { type: "Textbox", label: "Street" } },
    });
    const config = composeForm({
      fragments: { shipping: { template: "address" } },
      fieldOrder: ["shipping"],
    });
    expect(config.fieldOrder).toBeDefined();
  });

  it("passes through wizard config", () => {
    registerFormTemplate("address", {
      fields: { street: { type: "Textbox", label: "Street" } },
    });
    const config = composeForm({
      fragments: { shipping: { template: "address" } },
      wizard: { steps: [{ id: "s1", title: "Ship", fragments: ["shipping"] }] },
    });
    expect(config.wizard).toBeDefined();
  });

  it("forwards fragment params to template", () => {
    registerFormTemplate("address", {
      params: { required: { type: "boolean", default: false } },
      fields: {
        street: { type: "Textbox", label: "Street", required: "{{params.required}}" as any },
      },
    });
    const config = composeForm({
      fragments: { shipping: { template: "address", params: { required: true } } },
    });
    expect(config.fields["shipping.street"].required).toBe(true);
  });

  it("applies fragment overrides", () => {
    registerFormTemplate("address", {
      fields: { street: { type: "Textbox", label: "Street", required: true } },
    });
    const config = composeForm({
      fragments: {
        shipping: { template: "address", overrides: { street: { required: false } } },
      },
    });
    expect(config.fields["shipping.street"].required).toBe(false);
  });

  it("applies fragment defaultValues", () => {
    registerFormTemplate("address", {
      fields: { street: { type: "Textbox", label: "Street" } },
    });
    const config = composeForm({
      fragments: {
        shipping: { template: "address", defaultValues: { street: "123 Main" } },
      },
    });
    expect(config.fields["shipping.street"].defaultValue).toBe("123 Main");
  });
});
