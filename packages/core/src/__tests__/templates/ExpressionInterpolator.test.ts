import { describe, it, expect } from "vitest";
import { interpolate, interpolateDeep } from "../../templates/ExpressionInterpolator";

describe("ExpressionInterpolator", () => {
  const params = { country: "US", required: true, count: 3 };
  const lookups = {
    stateOptions: {
      US: [{ value: "CA", label: "California" }],
      CA: [{ value: "ON", label: "Ontario" }],
    },
    zipPatterns: { US: "^\\d{5}$", CA: "^[A-Z]\\d[A-Z]$" },
  };

  describe("simple param substitution", () => {
    it("resolves a string param", () => {
      expect(interpolate("{{params.country}}", params, lookups)).toBe("US");
    });
    it("resolves a boolean param", () => {
      expect(interpolate("{{params.required}}", params, lookups)).toBe(true);
    });
    it("resolves a number param", () => {
      expect(interpolate("{{params.count}}", params, lookups)).toBe(3);
    });
  });

  describe("ternary expressions", () => {
    it("evaluates false branch", () => {
      expect(interpolate("{{params.country == 'CA' ? 'Province' : 'State'}}", params, lookups)).toBe("State");
    });
    it("evaluates true branch", () => {
      const caParams = { ...params, country: "CA" };
      expect(interpolate("{{params.country == 'CA' ? 'Province' : 'State'}}", caParams, lookups)).toBe("Province");
    });
    it("handles nested ternary", () => {
      expect(interpolate("{{params.country == 'CA' ? 'Province' : params.country == 'UK' ? 'County' : 'State'}}", params, lookups)).toBe("State");
    });
  });

  describe("lookup table access", () => {
    it("resolves bracket access with param key", () => {
      const result = interpolate("{{$lookup.stateOptions[params.country]}}", params, lookups);
      expect(result).toEqual([{ value: "CA", label: "California" }]);
    });
    it("resolves dot access", () => {
      const result = interpolate("{{$lookup.zipPatterns.US}}", params, lookups);
      expect(result).toBe("^\\d{5}$");
    });
  });

  describe("non-expression strings pass through", () => {
    it("returns plain string as-is", () => {
      expect(interpolate("Hello world", params, lookups)).toBe("Hello world");
    });
    it("returns non-string values as-is", () => {
      expect(interpolate(42 as unknown as string, params, lookups)).toBe(42);
    });
  });

  describe("inequality", () => {
    it("evaluates != correctly", () => {
      expect(interpolate("{{params.country != 'CA' ? 'Not Canada' : 'Canada'}}", params, lookups)).toBe("Not Canada");
    });
  });

  describe("interpolateDeep", () => {
    it("recursively interpolates object values", () => {
      const obj = {
        label: "{{params.country == 'CA' ? 'Province' : 'State'}}",
        required: "{{params.required}}",
        nested: { options: "{{$lookup.stateOptions[params.country]}}" },
      };
      const result = interpolateDeep(obj, params, lookups) as any;
      expect(result.label).toBe("State");
      expect(result.required).toBe(true);
      expect(result.nested.options).toEqual([{ value: "CA", label: "California" }]);
    });
    it("recursively interpolates array values", () => {
      const arr = ["{{params.country}}", "plain", "{{params.count}}"];
      const result = interpolateDeep(arr, params, lookups) as unknown[];
      expect(result).toEqual(["US", "plain", 3]);
    });
  });
});
