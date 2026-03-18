import { describe, it, expect } from "vitest";
import { extractConditionDependencies } from "../../helpers/ConditionEvaluator";
import { extractExpressionDependencies } from "../../helpers/ExpressionEngine";
import { buildDependencyGraph, buildDefaultFieldStates } from "../../helpers/RuleEngine";

describe("Qualified dependency paths", () => {
  it("extractConditionDependencies returns full dotted path", () => {
    const deps = extractConditionDependencies({
      field: "shipping.address.country",
      operator: "equals",
      value: "US",
    });
    expect(deps).toContain("shipping.address.country");
  });

  it("extractExpressionDependencies returns full dotted path", () => {
    const deps = extractExpressionDependencies("$values.shipping.address.qty * 2");
    expect(deps).toContain("shipping.address.qty");
  });

  it("buildDependencyGraph creates edges for dotted field names", () => {
    const fields = {
      "shipping.country": {
        type: "Dropdown",
        label: "Country",
        options: [],
      },
      "shipping.state": {
        type: "Dropdown",
        label: "State",
        options: [],
        rules: [{
          when: { field: "shipping.country", operator: "equals" as const, value: "US" },
          then: { options: [{ value: "CA", label: "California" }] },
        }],
      },
    };
    const graph = buildDependencyGraph(fields as any);
    expect(graph["shipping.country"]?.has("shipping.state")).toBe(true);
  });

  it("buildDefaultFieldStates wires dependentFields for dotted names", () => {
    const fields = {
      "shipping.country": {
        type: "Dropdown",
        label: "Country",
        options: [],
      },
      "shipping.state": {
        type: "Dropdown",
        label: "State",
        options: [],
        rules: [{
          when: { field: "shipping.country", operator: "equals" as const, value: "US" },
          then: { options: [{ value: "CA", label: "California" }] },
        }],
      },
    };
    const states = buildDefaultFieldStates(fields as any);
    expect(states["shipping.country"].dependentFields).toContain("shipping.state");
  });

  it("still works with non-dotted field names (no regression)", () => {
    const deps = extractConditionDependencies({
      field: "country",
      operator: "equals",
      value: "US",
    });
    expect(deps).toContain("country");
    expect(deps).toHaveLength(1);
  });
});
