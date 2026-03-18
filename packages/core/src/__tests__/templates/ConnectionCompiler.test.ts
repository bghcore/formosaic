import { describe, it, expect, vi } from "vitest";
import { compileConnections } from "../../templates/ConnectionCompiler";

describe("ConnectionCompiler", () => {
  const resolvedPorts: Record<string, string[]> = {
    "shipping.allFields": ["shipping.name", "shipping.email", "shipping.street"],
    "billing.allFields": ["billing.name", "billing.email", "billing.street"],
  };

  it("compiles copyValues to computedValue rules", () => {
    const rules = compileConnections([{
      name: "copy",
      when: { field: "toggle", operator: "equals", value: true },
      source: { fragment: "shipping", port: "allFields" },
      target: { fragment: "billing", port: "allFields" },
      effect: "copyValues",
    }], resolvedPorts);

    expect(rules).toHaveLength(1);
    const effectFields = rules[0].then?.fields ?? {};
    expect(effectFields["billing.name"]?.computedValue).toBe("$root.shipping.name");
    expect(effectFields["billing.email"]?.computedValue).toBe("$root.shipping.email");
    expect(effectFields["billing.street"]?.computedValue).toBe("$root.shipping.street");
  });

  it("compiles hide to hidden rules", () => {
    const rules = compileConnections([{
      name: "hideAll",
      when: { field: "toggle", operator: "equals", value: true },
      source: { fragment: "shipping", port: "allFields" },
      target: { fragment: "billing", port: "allFields" },
      effect: "hide",
    }], resolvedPorts);

    const effectFields = rules[0].then?.fields ?? {};
    expect(effectFields["billing.name"]?.hidden).toBe(true);
    expect(effectFields["billing.email"]?.hidden).toBe(true);
  });

  it("compiles readOnly to readOnly rules", () => {
    const rules = compileConnections([{
      name: "lockAll",
      when: { field: "toggle", operator: "equals", value: true },
      source: { fragment: "shipping", port: "allFields" },
      target: { fragment: "billing", port: "allFields" },
      effect: "readOnly",
    }], resolvedPorts);

    const effectFields = rules[0].then?.fields ?? {};
    expect(effectFields["billing.name"]?.readOnly).toBe(true);
  });

  it("compiles computeFrom same as copyValues", () => {
    const rules = compileConnections([{
      name: "compute",
      when: { field: "toggle", operator: "equals", value: true },
      source: { fragment: "shipping", port: "allFields" },
      target: { fragment: "billing", port: "allFields" },
      effect: "computeFrom",
    }], resolvedPorts);

    const effectFields = rules[0].then?.fields ?? {};
    expect(effectFields["billing.name"]?.computedValue).toBe("$root.shipping.name");
  });

  it("matches ports by field suffix, not array index", () => {
    const ports: Record<string, string[]> = {
      "a.port": ["a.x", "a.y"],
      "b.port": ["b.y", "b.x"],  // different order
    };
    const rules = compileConnections([{
      name: "copy",
      when: { field: "toggle", operator: "equals", value: true },
      source: { fragment: "a", port: "port" },
      target: { fragment: "b", port: "port" },
      effect: "copyValues",
    }], ports);

    const effectFields = rules[0].then?.fields ?? {};
    expect(effectFields["b.x"]?.computedValue).toBe("$root.a.x");
    expect(effectFields["b.y"]?.computedValue).toBe("$root.a.y");
  });

  it("warns on mismatched port fields", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const ports: Record<string, string[]> = {
      "a.port": ["a.x", "a.y", "a.z"],
      "b.port": ["b.x", "b.y"],  // missing z
    };
    compileConnections([{
      name: "copy",
      when: { field: "t", operator: "equals", value: true },
      source: { fragment: "a", port: "port" },
      target: { fragment: "b", port: "port" },
      effect: "copyValues",
    }], ports);

    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("handles multiple connections", () => {
    const rules = compileConnections([
      {
        name: "copy",
        when: { field: "t1", operator: "equals", value: true },
        source: { fragment: "shipping", port: "allFields" },
        target: { fragment: "billing", port: "allFields" },
        effect: "copyValues",
      },
      {
        name: "hide",
        when: { field: "t2", operator: "equals", value: true },
        source: { fragment: "shipping", port: "allFields" },
        target: { fragment: "billing", port: "allFields" },
        effect: "hide",
      },
    ], resolvedPorts);

    expect(rules).toHaveLength(2);
  });
});
