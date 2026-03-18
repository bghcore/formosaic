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

  describe("sub-wizard inline/nested mode", () => {
    it("inline mode flattens sub-wizard steps into outer wizard", () => {
      registerFormTemplate("onboarding", {
        fields: {
          firstName: { type: "Textbox", label: "First Name" },
          lastName: { type: "Textbox", label: "Last Name" },
          taxId: { type: "Textbox", label: "Tax ID" },
          schedule: { type: "Textbox", label: "Schedule" },
        },
        wizard: {
          steps: [
            { id: "personal", title: "Personal Info", fields: ["firstName", "lastName"] },
            { id: "tax", title: "Tax Info", fields: ["taxId"] },
            { id: "schedule", title: "Schedule", fields: ["schedule"] },
          ],
        },
      });
      const config: IFormConfig = {
        version: 2,
        fields: { onboard: { templateRef: "onboarding" } as any },
        wizard: {
          steps: [
            { id: "intro", title: "Intro", fields: [] },
            { id: "onboard-step", title: "Onboarding", fragments: ["onboard"], fragmentWizardMode: "inline" },
            { id: "done", title: "Done", fields: [] },
          ],
        },
      };
      const resolved = resolveTemplates(config);
      const steps = resolved.wizard!.steps;
      // Should have: intro, onboard.personal, onboard.tax, onboard.schedule, done
      expect(steps).toHaveLength(5);
      expect(steps[0].id).toBe("intro");
      expect(steps[1].id).toBe("onboard.personal");
      expect(steps[1].title).toBe("onboard - Personal Info");
      expect(steps[1].fields).toContain("onboard.firstName");
      expect(steps[1].fields).toContain("onboard.lastName");
      expect(steps[2].id).toBe("onboard.tax");
      expect(steps[2].fields).toContain("onboard.taxId");
      expect(steps[3].id).toBe("onboard.schedule");
      expect(steps[3].fields).toContain("onboard.schedule");
      expect(steps[4].id).toBe("done");
    });

    it("nested mode treats fragment as single step (default when fragmentWizardMode is nested)", () => {
      registerFormTemplate("onboarding", {
        fields: {
          firstName: { type: "Textbox", label: "First Name" },
          taxId: { type: "Textbox", label: "Tax ID" },
        },
        wizard: {
          steps: [
            { id: "personal", title: "Personal", fields: ["firstName"] },
            { id: "tax", title: "Tax", fields: ["taxId"] },
          ],
        },
      });
      const config: IFormConfig = {
        version: 2,
        fields: { onboard: { templateRef: "onboarding" } as any },
        wizard: {
          steps: [
            { id: "main", title: "Main", fragments: ["onboard"], fragmentWizardMode: "nested" },
          ],
        },
      };
      const resolved = resolveTemplates(config);
      const steps = resolved.wizard!.steps;
      // Should remain a single step with all fragment fields
      expect(steps).toHaveLength(1);
      expect(steps[0].id).toBe("main");
      expect(steps[0].fields).toContain("onboard.firstName");
      expect(steps[0].fields).toContain("onboard.taxId");
    });

    it("inline mode with mixed fragments (one with sub-wizard, one without)", () => {
      registerFormTemplate("withWizard", {
        fields: {
          a: { type: "Textbox", label: "A" },
          b: { type: "Textbox", label: "B" },
        },
        wizard: {
          steps: [
            { id: "s1", title: "Step 1", fields: ["a"] },
            { id: "s2", title: "Step 2", fields: ["b"] },
          ],
        },
      });
      registerFormTemplate("simple", {
        fields: { x: { type: "Textbox", label: "X" } },
      });
      const config: IFormConfig = {
        version: 2,
        fields: {
          wiz: { templateRef: "withWizard" } as any,
          simp: { templateRef: "simple" } as any,
        },
        wizard: {
          steps: [
            {
              id: "combined",
              title: "Combined",
              fields: ["extra"],
              fragments: ["wiz", "simp"],
              fragmentWizardMode: "inline",
            },
          ],
        },
      };
      // Add the extra field
      (config.fields as any)["extra"] = { type: "Textbox", label: "Extra" };
      const resolved = resolveTemplates(config);
      const steps = resolved.wizard!.steps;
      // Should have: wiz.s1, wiz.s2 (flattened), plus a step with extra + simp.x
      expect(steps.some(s => s.id === "wiz.s1")).toBe(true);
      expect(steps.some(s => s.id === "wiz.s2")).toBe(true);
      // The non-wizard fragment and direct fields go into their own step
      const extraStep = steps.find(s => s.fields?.includes("extra"));
      expect(extraStep).toBeDefined();
      expect(extraStep!.fields).toContain("simp.x");
    });
  });
});
