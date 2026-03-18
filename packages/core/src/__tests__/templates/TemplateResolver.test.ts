import { describe, it, expect, beforeEach, vi } from "vitest";
import { resolveTemplates } from "../../templates/TemplateResolver";
import { registerFormTemplate, resetFormTemplates } from "../../templates/TemplateRegistry";
import { registerLookupTables, resetLookupTables } from "../../templates/LookupRegistry";
import { IFormConfig } from "../../types/IFormConfig";

describe("TemplateResolver", () => {
  beforeEach(() => {
    resetFormTemplates();
    resetLookupTables();
  });

  it("passes through a config with no templateRefs unchanged", () => {
    const config: IFormConfig = {
      version: 2,
      fields: { name: { type: "Textbox", label: "Name" } },
    };
    const resolved = resolveTemplates(config);
    expect(Object.keys(resolved.fields)).toEqual(["name"]);
  });

  it("expands a simple templateRef with prefixed field names", () => {
    registerFormTemplate("address", {
      fields: {
        street: { type: "Textbox", label: "Street" },
        city: { type: "Textbox", label: "City" },
      },
    });
    const config: IFormConfig = {
      version: 2,
      fields: {
        shipping: { templateRef: "address" } as any,
      },
    };
    const resolved = resolveTemplates(config);
    expect(resolved.fields["shipping.street"]).toBeDefined();
    expect(resolved.fields["shipping.city"]).toBeDefined();
    expect(resolved.fields["shipping"]).toBeUndefined();
  });

  it("interpolates template params", () => {
    registerFormTemplate("address", {
      params: { required: { type: "boolean", default: false } },
      fields: {
        street: { type: "Textbox", label: "Street", required: "{{params.required}}" as any },
      },
    });
    const config: IFormConfig = {
      version: 2,
      fields: {
        shipping: { templateRef: "address", templateParams: { required: true } } as any,
      },
    };
    const resolved = resolveTemplates(config);
    expect(resolved.fields["shipping.street"].required).toBe(true);
  });

  it("applies templateOverrides", () => {
    registerFormTemplate("address", {
      fields: {
        street: { type: "Textbox", label: "Street", required: true },
      },
    });
    const config: IFormConfig = {
      version: 2,
      fields: {
        shipping: {
          templateRef: "address",
          templateOverrides: { street: { required: false } },
        } as any,
      },
    };
    const resolved = resolveTemplates(config);
    expect(resolved.fields["shipping.street"].required).toBe(false);
  });

  it("applies defaultValues", () => {
    registerFormTemplate("address", {
      fields: {
        street: { type: "Textbox", label: "Street" },
        city: { type: "Textbox", label: "City" },
      },
    });
    const config: IFormConfig = {
      version: 2,
      fields: {
        shipping: {
          templateRef: "address",
          defaultValues: { street: "123 Main St", city: "Springfield" },
        } as any,
      },
    };
    const resolved = resolveTemplates(config);
    expect(resolved.fields["shipping.street"].defaultValue).toBe("123 Main St");
    expect(resolved.fields["shipping.city"].defaultValue).toBe("Springfield");
  });

  it("expands nested templates (template using template)", () => {
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
      fields: {
        shipping: { templateRef: "contact" } as any,
      },
    };
    const resolved = resolveTemplates(config);
    expect(resolved.fields["shipping.name"]).toBeDefined();
    expect(resolved.fields["shipping.address.street"]).toBeDefined();
  });

  it("detects cycles and throws", () => {
    registerFormTemplate("a", {
      fields: { ref: { templateRef: "b" } as any },
    });
    registerFormTemplate("b", {
      fields: { ref: { templateRef: "a" } as any },
    });
    const config: IFormConfig = {
      version: 2,
      fields: { x: { templateRef: "a" } as any },
    };
    expect(() => resolveTemplates(config)).toThrow(/[Cc]ycle/);
  });

  it("throws on missing template reference", () => {
    const config: IFormConfig = {
      version: 2,
      fields: { x: { templateRef: "nonexistent" } as any },
    };
    expect(() => resolveTemplates(config)).toThrow(/nonexistent/);
  });

  it("rewrites template-internal rule field references with prefix", () => {
    registerFormTemplate("address", {
      fields: {
        country: { type: "Dropdown", label: "Country", options: [] },
        state: { type: "Dropdown", label: "State", options: [] },
      },
      rules: [{
        when: { field: "country", operator: "equals", value: "US" },
        then: { fields: { state: { options: [{ value: "CA", label: "California" }] } } },
      }],
    });
    const config: IFormConfig = {
      version: 2,
      fields: { shipping: { templateRef: "address" } as any },
    };
    const resolved = resolveTemplates(config);
    const allRules = Object.values(resolved.fields).flatMap(f => f.rules ?? []);
    expect(allRules.length).toBeGreaterThan(0);
    const condField = (allRules[0]?.when as any)?.field;
    expect(condField).toBe("shipping.country");
    const effectKeys = Object.keys(allRules[0]?.then?.fields ?? {});
    expect(effectKeys).toContain("shipping.state");
  });

  it("strips $root prefix in template-internal rules", () => {
    registerFormTemplate("address", {
      fields: {
        state: { type: "Dropdown", label: "State", options: [] },
      },
      rules: [{
        when: { field: "$root.country", operator: "equals", value: "US" },
        then: { fields: { state: { options: [{ value: "CA", label: "CA" }] } } },
      }],
    });
    const config: IFormConfig = {
      version: 2,
      fields: {
        country: { type: "Dropdown", label: "Country", options: [] },
        shipping: { templateRef: "address" } as any,
      },
    };
    const resolved = resolveTemplates(config);
    const allRules = Object.values(resolved.fields).flatMap(f => f.rules ?? []);
    const condField = (allRules[0]?.when as any)?.field;
    expect(condField).toBe("country");
  });

  it("rewrites $values references in computedValue with prefix", () => {
    registerFormTemplate("calc", {
      fields: {
        qty: { type: "Number", label: "Qty" },
        total: { type: "Number", label: "Total", computedValue: "$values.qty * 2" },
      },
    });
    const config: IFormConfig = {
      version: 2,
      fields: { order: { templateRef: "calc" } as any },
    };
    const resolved = resolveTemplates(config);
    expect(resolved.fields["order.total"].computedValue).toBe("$values.order.qty * 2");
  });

  it("merges ports with prefixed paths", () => {
    registerFormTemplate("address", {
      fields: { street: { type: "Textbox", label: "Street" } },
      ports: { allFields: ["street"] },
    });
    const config: IFormConfig = {
      version: 2,
      fields: { shipping: { templateRef: "address" } as any },
    };
    const resolved = resolveTemplates(config);
    expect(resolved._resolvedPorts?.["shipping.allFields"]).toEqual(["shipping.street"]);
  });

  it("uses inline templates from config.templates", () => {
    const config: IFormConfig = {
      version: 2,
      templates: {
        address: {
          fields: { street: { type: "Textbox", label: "Street" } },
        },
      },
      fields: { shipping: { templateRef: "address" } as any },
    };
    const resolved = resolveTemplates(config);
    expect(resolved.fields["shipping.street"]).toBeDefined();
  });

  it("uses inline lookups from config.lookups", () => {
    const config: IFormConfig = {
      version: 2,
      templates: {
        address: {
          params: { country: { type: "string", default: "US" } },
          fields: {
            state: {
              type: "Dropdown",
              label: "State",
              options: "{{$lookup.states[params.country]}}" as any,
            },
          },
        },
      },
      lookups: { states: { US: [{ value: "CA", label: "California" }] } },
      fields: {
        shipping: { templateRef: "address", templateParams: { country: "US" } } as any,
      },
    };
    const resolved = resolveTemplates(config);
    expect(resolved.fields["shipping.state"].options).toEqual([{ value: "CA", label: "California" }]);
  });

  it("expands fieldOrder fragment prefixes", () => {
    registerFormTemplate("address", {
      fields: {
        street: { type: "Textbox", label: "Street" },
        city: { type: "Textbox", label: "City" },
      },
      fieldOrder: ["street", "city"],
    });
    const config: IFormConfig = {
      version: 2,
      fields: {
        heading: { type: "Textbox", label: "Heading" },
        shipping: { templateRef: "address" } as any,
      },
      fieldOrder: ["heading", "shipping"],
    };
    const resolved = resolveTemplates(config);
    expect(resolved.fieldOrder).toEqual(["heading", "shipping.street", "shipping.city"]);
  });

  it("expands wizard step fragments to field lists", () => {
    registerFormTemplate("address", {
      fields: {
        street: { type: "Textbox", label: "Street" },
        city: { type: "Textbox", label: "City" },
      },
    });
    const config: IFormConfig = {
      version: 2,
      fields: { shipping: { templateRef: "address" } as any },
      wizard: {
        steps: [{ id: "step1", title: "Shipping", fragments: ["shipping"] }],
      },
    };
    const resolved = resolveTemplates(config);
    const step = resolved.wizard!.steps[0];
    expect(step.fields).toContain("shipping.street");
    expect(step.fields).toContain("shipping.city");
  });

  it("throws when max resolution depth is exceeded", () => {
    for (let i = 0; i < 12; i++) {
      const fields = i < 11
        ? { [`field${i}`]: { type: "Textbox", label: `F${i}` }, ref: { templateRef: `tmpl${i + 1}` } as any }
        : { [`field${i}`]: { type: "Textbox", label: `F${i}` } };
      registerFormTemplate(`tmpl${i}`, { fields });
    }
    const config: IFormConfig = {
      version: 2,
      fields: { root: { templateRef: "tmpl0" } as any },
    };
    expect(() => resolveTemplates(config, { maxDepth: 5 })).toThrow(/depth/i);
  });

  it("applies param defaults when param not provided", () => {
    registerFormTemplate("address", {
      params: { country: { type: "string", default: "US" } },
      fields: {
        state: { type: "Textbox", label: "{{params.country}}" as any },
      },
    });
    const config: IFormConfig = {
      version: 2,
      fields: {
        shipping: { templateRef: "address", templateParams: {} } as any,
      },
    };
    const resolved = resolveTemplates(config);
    expect(resolved.fields["shipping.state"].label).toBe("US");
  });

  it("warns on missing lookup table reference", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    registerFormTemplate("address", {
      fields: {
        state: { type: "Dropdown", label: "State", options: "{{$lookup.nonexistent[params.x]}}" as any },
      },
    });
    const config: IFormConfig = {
      version: 2,
      fields: { shipping: { templateRef: "address" } as any },
    };
    resolveTemplates(config);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("builds _templateMeta in dev mode", () => {
    registerFormTemplate("address", {
      fields: { street: { type: "Textbox", label: "Street" } },
    });
    const config: IFormConfig = {
      version: 2,
      fields: { shipping: { templateRef: "address" } as any },
    };
    const resolved = resolveTemplates(config);
    expect(resolved._templateMeta?.["shipping.street"]).toEqual({
      template: "address",
      fragment: "shipping",
      originalName: "street",
    });
  });
});
