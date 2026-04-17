/**
 * P0-5 regression: the dependency graph must create edges for dotted paths.
 *
 * When a rule condition or computed-value expression references a nested
 * path like `$values.address.city`, the dependency graph must register an
 * edge on the longest-prefix field that exists in the field registry
 * (typically the top-level `address` field). Otherwise,
 * `evaluateAffectedFields("address", ...)` skips downstream rules and
 * computed values because it cannot find edges.
 */

import { describe, it, expect } from "vitest";
import { buildDependencyGraph, evaluateAllRules, evaluateAffectedFields } from "../../helpers/RuleEngine";
import type { IFieldConfig } from "../../types/IFieldConfig";

describe("Dotted dependency graph (P0-5 regression)", () => {
  describe("buildDependencyGraph resolves dotted refs to top-level field", () => {
    it("computed value referring $values.address.city adds edge on `address`", () => {
      const fields: Record<string, IFieldConfig> = {
        address: {
          type: "Textbox",
          label: "Address",
        },
        summary: {
          type: "Textbox",
          label: "Summary",
          computedValue: "$values.address.city",
        },
      };

      const graph = buildDependencyGraph(fields);
      expect(graph.address.has("summary")).toBe(true);
      expect(graph.summary.has("address")).toBe(false);
    });

    it("rule condition referencing $values.customer.id adds edge on `customer`", () => {
      const fields: Record<string, IFieldConfig> = {
        customer: {
          type: "Textbox",
          label: "Customer",
        },
        orderRef: {
          type: "Textbox",
          label: "Order Ref",
          rules: [
            {
              when: { field: "customer.id", operator: "isNotEmpty" },
              then: { required: true },
            },
          ],
        },
      };

      const graph = buildDependencyGraph(fields);
      expect(graph.customer.has("orderRef")).toBe(true);
    });

    it("deeply-nested path resolves to the longest-existing prefix", () => {
      const fields: Record<string, IFieldConfig> = {
        // Nested key "shipping.address" is a top-level field name with a dot
        // in the identifier. The graph should prefer the full match first.
        shipping: {
          type: "Textbox",
          label: "Shipping",
        },
        display: {
          type: "Textbox",
          label: "Display",
          computedValue: "$values.shipping.address.city.zip",
        },
      };

      const graph = buildDependencyGraph(fields);
      // Edge should be on the longest-existing prefix (`shipping`).
      expect(graph.shipping.has("display")).toBe(true);
    });

    it("dotted refs pointing to a non-existent top-level field do not create edges", () => {
      const fields: Record<string, IFieldConfig> = {
        other: { type: "Textbox", label: "Other" },
        sink: {
          type: "Textbox",
          label: "Sink",
          computedValue: "$values.ghost.something",
        },
      };

      const graph = buildDependencyGraph(fields);
      // No edge on "other" or on "sink". The ghost field just has no edge.
      expect(graph.other.has("sink")).toBe(false);
      expect(graph.sink.size).toBe(0);
    });
  });

  describe("evaluateAffectedFields covers dotted-path dependents", () => {
    it("changing `address` field triggers re-evaluation of rule on nested-path dependency", () => {
      const fields: Record<string, IFieldConfig> = {
        address: {
          type: "Textbox",
          label: "Address",
        },
        cityRequired: {
          type: "Textbox",
          label: "Extra",
          rules: [
            {
              when: { field: "address.city", operator: "equals", value: "NYC" },
              then: { required: true },
            },
          ],
        },
      };

      // Initially NYC -> cityRequired should be required.
      const initial = evaluateAllRules(fields, { address: { city: "NYC" } });
      expect(initial.fieldStates.cityRequired.required).toBe(true);

      // Changing to LA should flip required off.
      const after = evaluateAffectedFields(
        "address",
        fields,
        { address: { city: "LA" } },
        initial
      );
      expect(after.fieldStates.cityRequired.required).toBeFalsy();
    });
  });
});
