import { describe, it, expect, beforeEach } from "vitest";
import { resolveTemplates } from "../../templates/TemplateResolver";
import { composeForm } from "../../templates/ComposedFormBuilder";
import { registerFormTemplate, resetFormTemplates } from "../../templates/TemplateRegistry";
import { resetLookupTables } from "../../templates/LookupRegistry";
import { IFormConfig } from "../../types/IFormConfig";

describe("Wizard Fragment Integration", () => {
  beforeEach(() => {
    resetFormTemplates();
    resetLookupTables();
  });

  it("wizard step with fragments expands to resolved field names", () => {
    registerFormTemplate("address", {
      fields: {
        street: { type: "Textbox", label: "Street" },
        city: { type: "Textbox", label: "City" },
        zip: { type: "Textbox", label: "ZIP" },
      },
    });
    const config: IFormConfig = {
      version: 2,
      fields: { shipping: { templateRef: "address" } as any },
      wizard: {
        steps: [
          { id: "addr", title: "Address", fragments: ["shipping"] },
        ],
      },
    };
    const resolved = resolveTemplates(config);
    const step = resolved.wizard!.steps[0];
    expect(step.fields).toContain("shipping.street");
    expect(step.fields).toContain("shipping.city");
    expect(step.fields).toContain("shipping.zip");
    expect(step.fields).toHaveLength(3);
  });

  it("wizard step with mixed fields and fragments", () => {
    registerFormTemplate("address", {
      fields: { street: { type: "Textbox", label: "Street" } },
    });
    const config: IFormConfig = {
      version: 2,
      fields: {
        notes: { type: "Textbox", label: "Notes" },
        shipping: { templateRef: "address" } as any,
      },
      wizard: {
        steps: [
          { id: "s1", title: "Step 1", fields: ["notes"], fragments: ["shipping"] },
        ],
      },
    };
    const resolved = resolveTemplates(config);
    const step = resolved.wizard!.steps[0];
    expect(step.fields).toContain("notes");
    expect(step.fields).toContain("shipping.street");
  });

  it("composeForm with wizard fragments", () => {
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
      fields: { sameAddr: { type: "Toggle", label: "Same?" } },
      wizard: {
        steps: [
          { id: "ship", title: "Shipping", fragments: ["shipping"] },
          { id: "bill", title: "Billing", fields: ["sameAddr"], fragments: ["billing"] },
        ],
      },
    });
    const shipStep = config.wizard!.steps[0];
    const billStep = config.wizard!.steps[1];
    expect(shipStep.fields).toContain("shipping.street");
    expect(billStep.fields).toContain("sameAddr");
    expect(billStep.fields).toContain("billing.street");
  });

  it("wizard step with only fragments (no fields)", () => {
    registerFormTemplate("payment", {
      fields: {
        method: { type: "Dropdown", label: "Method", options: [] },
        card: { type: "Textbox", label: "Card" },
      },
    });
    const config: IFormConfig = {
      version: 2,
      fields: { pay: { templateRef: "payment" } as any },
      wizard: {
        steps: [
          { id: "p", title: "Payment", fragments: ["pay"] },
        ],
      },
    };
    const resolved = resolveTemplates(config);
    const step = resolved.wizard!.steps[0];
    expect(step.fields).toContain("pay.method");
    expect(step.fields).toContain("pay.card");
  });

  it("nested template fields appear in wizard step", () => {
    registerFormTemplate("address", {
      fields: { street: { type: "Textbox", label: "Street" } },
    });
    registerFormTemplate("contact", {
      fields: {
        name: { type: "Textbox", label: "Name" },
        address: { templateRef: "address" } as any,
      },
    });
    const config: IFormConfig = {
      version: 2,
      fields: { shipping: { templateRef: "contact" } as any },
      wizard: {
        steps: [{ id: "s", title: "Shipping", fragments: ["shipping"] }],
      },
    };
    const resolved = resolveTemplates(config);
    const step = resolved.wizard!.steps[0];
    expect(step.fields).toContain("shipping.name");
    expect(step.fields).toContain("shipping.address.street");
  });
});
