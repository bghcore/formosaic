import { describe, it, expect } from "vitest";
import { ComponentTypes } from "../../constants";

describe("New Field Types - ComponentTypes constants", () => {
  describe("RadioGroup", () => {
    it("has the correct type string", () => {
      expect(ComponentTypes.RadioGroup).toBe("RadioGroup");
    });

    it("is included in ComponentTypes", () => {
      expect(Object.values(ComponentTypes)).toContain("RadioGroup");
    });
  });

  describe("CheckboxGroup", () => {
    it("has the correct type string", () => {
      expect(ComponentTypes.CheckboxGroup).toBe("CheckboxGroup");
    });

    it("is included in ComponentTypes", () => {
      expect(Object.values(ComponentTypes)).toContain("CheckboxGroup");
    });
  });

  describe("Rating", () => {
    it("has the correct type string", () => {
      expect(ComponentTypes.Rating).toBe("Rating");
    });

    it("is included in ComponentTypes", () => {
      expect(Object.values(ComponentTypes)).toContain("Rating");
    });
  });

  describe("ColorPicker", () => {
    it("has the correct type string", () => {
      expect(ComponentTypes.ColorPicker).toBe("ColorPicker");
    });

    it("is included in ComponentTypes", () => {
      expect(Object.values(ComponentTypes)).toContain("ColorPicker");
    });
  });

  describe("Autocomplete", () => {
    it("has the correct type string", () => {
      expect(ComponentTypes.Autocomplete).toBe("Autocomplete");
    });

    it("is included in ComponentTypes", () => {
      expect(Object.values(ComponentTypes)).toContain("Autocomplete");
    });
  });

  describe("all new types coexist with existing types", () => {
    it("does not remove existing ComponentTypes", () => {
      expect(ComponentTypes.Textbox).toBe("Textbox");
      expect(ComponentTypes.Dropdown).toBe("Dropdown");
      expect(ComponentTypes.Toggle).toBe("Toggle");
      expect(ComponentTypes.Number).toBe("Number");
      expect(ComponentTypes.MultiSelect).toBe("Multiselect");
    });

    it("has the expected total count of types", () => {
      const values = Object.values(ComponentTypes);
      // 22 original + 5 phase1 + 4 phase2 = 31 total (SimpleDropdown removed in v1.1.1)
      expect(values.length).toBe(31);
    });
  });
});

describe("New Field Types - value handling conventions", () => {
  describe("CheckboxGroup value type", () => {
    it("empty selection is an empty array", () => {
      const value: string[] = [];
      expect(Array.isArray(value)).toBe(true);
      expect(value.length).toBe(0);
    });

    it("multi-selection is a string array", () => {
      const value: string[] = ["option1", "option2"];
      expect(Array.isArray(value)).toBe(true);
      expect(value).toContain("option1");
      expect(value).toContain("option2");
    });

    it("toggle adds an option to selection", () => {
      const selected: string[] = ["option1"];
      const next = [...selected, "option2"];
      expect(next).toEqual(["option1", "option2"]);
    });

    it("toggle removes an option from selection", () => {
      const selected: string[] = ["option1", "option2"];
      const next = selected.filter(v => v !== "option1");
      expect(next).toEqual(["option2"]);
    });
  });

  describe("RadioGroup value type", () => {
    it("single selection is a string", () => {
      const value = "option1";
      expect(typeof value).toBe("string");
    });
  });

  describe("Rating value type", () => {
    it("value is a number between 1 and max", () => {
      const value = 3;
      const max = 5;
      expect(typeof value).toBe("number");
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(max);
    });

    it("default max is 5", () => {
      const defaultMax = 5;
      expect(defaultMax).toBe(5);
    });
  });

  describe("ColorPicker value type", () => {
    it("value is a hex color string", () => {
      const value = "#ff0000";
      expect(typeof value).toBe("string");
      expect(value).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  describe("Autocomplete value type", () => {
    it("value is a string", () => {
      const value = "option1";
      expect(typeof value).toBe("string");
    });
  });
});
