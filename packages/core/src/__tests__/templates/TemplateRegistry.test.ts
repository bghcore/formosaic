import { describe, it, expect, beforeEach } from "vitest";
import {
  registerFormTemplate,
  registerFormTemplates,
  getFormTemplate,
  resetFormTemplates,
} from "../../templates/TemplateRegistry";

describe("TemplateRegistry", () => {
  beforeEach(() => { resetFormTemplates(); });

  it("returns undefined for unregistered template", () => {
    expect(getFormTemplate("nonexistent")).toBeUndefined();
  });

  it("registers and retrieves a template", () => {
    registerFormTemplate("address", {
      fields: { street: { type: "Textbox", label: "Street" } },
    });
    const tmpl = getFormTemplate("address");
    expect(tmpl).toBeDefined();
    expect(tmpl!.fields.street).toBeDefined();
  });

  it("overwrites existing template on re-register", () => {
    registerFormTemplate("address", {
      fields: { street: { type: "Textbox", label: "Street" } },
    });
    registerFormTemplate("address", {
      fields: { city: { type: "Textbox", label: "City" } },
    });
    const tmpl = getFormTemplate("address")!;
    expect("city" in tmpl.fields).toBe(true);
    expect("street" in tmpl.fields).toBe(false);
  });

  it("bulk registers multiple templates", () => {
    registerFormTemplates({
      address: { fields: { street: { type: "Textbox", label: "Street" } } },
      contact: { fields: { email: { type: "Textbox", label: "Email" } } },
    });
    expect(getFormTemplate("address")).toBeDefined();
    expect(getFormTemplate("contact")).toBeDefined();
  });

  it("resetFormTemplates clears all templates", () => {
    registerFormTemplate("address", {
      fields: { street: { type: "Textbox", label: "Street" } },
    });
    resetFormTemplates();
    expect(getFormTemplate("address")).toBeUndefined();
  });
});
