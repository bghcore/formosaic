import { describe, it, expect, beforeEach } from "vitest";
import {
  registerValidatorMetadata,
  getValidatorMetadata,
  getAllValidatorMetadata,
  resetValidatorMetadataRegistry,
  IValidatorMetadata,
} from "../../helpers/ValidationRegistry";

describe("ValidatorMetadata registry", () => {
  beforeEach(() => {
    resetValidatorMetadataRegistry();
  });

  describe("registerValidatorMetadata + getValidatorMetadata", () => {
    it("registers and retrieves metadata by name", () => {
      const meta: IValidatorMetadata = { label: "My Validator", description: "Checks something" };
      registerValidatorMetadata("myValidator", meta);
      expect(getValidatorMetadata("myValidator")).toEqual(meta);
    });

    it("returns undefined for unregistered validator", () => {
      expect(getValidatorMetadata("nonExistent")).toBeUndefined();
    });

    it("supports metadata with params", () => {
      const meta: IValidatorMetadata = {
        label: "Min Length",
        description: "Minimum string length",
        params: {
          min: { type: "number", label: "Minimum length", required: true },
        },
      };
      registerValidatorMetadata("minLength", meta);
      const result = getValidatorMetadata("minLength");
      expect(result?.params?.min.type).toBe("number");
      expect(result?.params?.min.required).toBe(true);
    });

    it("overwrites existing metadata on re-register", () => {
      registerValidatorMetadata("myVal", { label: "First" });
      registerValidatorMetadata("myVal", { label: "Second" });
      expect(getValidatorMetadata("myVal")?.label).toBe("Second");
    });
  });

  describe("getAllValidatorMetadata", () => {
    it("returns empty object when nothing is registered", () => {
      expect(getAllValidatorMetadata()).toEqual({});
    });

    it("returns all registered metadata", () => {
      registerValidatorMetadata("a", { label: "Alpha" });
      registerValidatorMetadata("b", { label: "Beta" });
      const all = getAllValidatorMetadata();
      expect(Object.keys(all)).toHaveLength(2);
      expect(all.a.label).toBe("Alpha");
      expect(all.b.label).toBe("Beta");
    });

    it("returns a copy (mutations do not affect the registry)", () => {
      registerValidatorMetadata("x", { label: "X" });
      const all = getAllValidatorMetadata();
      all.x = { label: "Mutated" };
      expect(getValidatorMetadata("x")?.label).toBe("X");
    });
  });

  describe("resetValidatorMetadataRegistry", () => {
    it("clears all registered metadata", () => {
      registerValidatorMetadata("toBeCleared", { label: "Gone" });
      resetValidatorMetadataRegistry();
      expect(getAllValidatorMetadata()).toEqual({});
      expect(getValidatorMetadata("toBeCleared")).toBeUndefined();
    });
  });

  describe("metadata with all field types", () => {
    it("supports all param types: string, number, boolean", () => {
      const meta: IValidatorMetadata = {
        label: "Complex",
        params: {
          pattern: { type: "string", label: "Pattern" },
          maxCount: { type: "number", label: "Max Count", required: true },
          strict: { type: "boolean", label: "Strict mode" },
        },
      };
      registerValidatorMetadata("complex", meta);
      const result = getValidatorMetadata("complex");
      expect(result?.params?.pattern.type).toBe("string");
      expect(result?.params?.maxCount.type).toBe("number");
      expect(result?.params?.strict.type).toBe("boolean");
    });
  });
});
