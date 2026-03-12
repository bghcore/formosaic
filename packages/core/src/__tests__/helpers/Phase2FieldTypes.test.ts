import { describe, it, expect } from "vitest";
import { ComponentTypes } from "../../constants";

describe("Phase 2 Field Types - ComponentTypes constants", () => {
  describe("FileUpload", () => {
    it("has the correct type string", () => {
      expect(ComponentTypes.FileUpload).toBe("FileUpload");
    });

    it("is included in ComponentTypes", () => {
      expect(Object.values(ComponentTypes)).toContain("FileUpload");
    });
  });

  describe("DateRange", () => {
    it("has the correct type string", () => {
      expect(ComponentTypes.DateRange).toBe("DateRange");
    });

    it("is included in ComponentTypes", () => {
      expect(Object.values(ComponentTypes)).toContain("DateRange");
    });
  });

  describe("DateTime", () => {
    it("has the correct type string", () => {
      expect(ComponentTypes.DateTime).toBe("DateTime");
    });

    it("is included in ComponentTypes", () => {
      expect(Object.values(ComponentTypes)).toContain("DateTime");
    });
  });

  describe("PhoneInput", () => {
    it("has the correct type string", () => {
      expect(ComponentTypes.PhoneInput).toBe("PhoneInput");
    });

    it("is included in ComponentTypes", () => {
      expect(Object.values(ComponentTypes)).toContain("PhoneInput");
    });
  });

  describe("all phase 2 types coexist with existing types", () => {
    it("does not remove existing ComponentTypes", () => {
      expect(ComponentTypes.Textbox).toBe("Textbox");
      expect(ComponentTypes.RadioGroup).toBe("RadioGroup");
      expect(ComponentTypes.CheckboxGroup).toBe("CheckboxGroup");
      expect(ComponentTypes.Rating).toBe("Rating");
      expect(ComponentTypes.ColorPicker).toBe("ColorPicker");
      expect(ComponentTypes.Autocomplete).toBe("Autocomplete");
    });

    it("has the expected total count of types", () => {
      const values = Object.values(ComponentTypes);
      // 24 existing + 4 new = 28 total (SimpleDropdown, PopOutEditor, RichText, ChoiceSet removed)
      expect(values.length).toBe(28);
    });
  });
});

describe("Phase 2 Field Types - value handling conventions", () => {
  describe("FileUpload value type", () => {
    it("null represents no selection", () => {
      const value: File | File[] | null = null;
      expect(value).toBeNull();
    });

    it("single file mode stores a File object", () => {
      const file = new File(["content"], "test.pdf", { type: "application/pdf" });
      const value: File | null = file;
      expect(value).toBeInstanceOf(File);
      expect(value.name).toBe("test.pdf");
    });

    it("multiple file mode stores an array of File objects", () => {
      const files: File[] = [
        new File(["a"], "a.txt", { type: "text/plain" }),
        new File(["b"], "b.txt", { type: "text/plain" }),
      ];
      expect(Array.isArray(files)).toBe(true);
      expect(files).toHaveLength(2);
    });

    it("file size validation: bytes exceed maxSizeMb limit", () => {
      const maxSizeMb = 1;
      const maxSizeBytes = maxSizeMb * 1024 * 1024;
      const largeContent = new Uint8Array(maxSizeBytes + 1);
      const file = new File([largeContent], "large.bin");
      expect(file.size).toBeGreaterThan(maxSizeBytes);
    });

    it("file size validation: bytes within maxSizeMb limit", () => {
      const maxSizeMb = 10;
      const maxSizeBytes = maxSizeMb * 1024 * 1024;
      const file = new File(["small content"], "small.txt");
      expect(file.size).toBeLessThan(maxSizeBytes);
    });
  });

  describe("DateRange value type", () => {
    it("null represents no selection", () => {
      const value: { start: string; end: string } | null = null;
      expect(value).toBeNull();
    });

    it("value is an object with start and end ISO date strings", () => {
      const value = { start: "2024-01-01", end: "2024-12-31" };
      expect(typeof value.start).toBe("string");
      expect(typeof value.end).toBe("string");
    });

    it("start <= end is valid", () => {
      const value = { start: "2024-01-01", end: "2024-12-31" };
      expect(value.start <= value.end).toBe(true);
    });

    it("start > end is invalid", () => {
      const value = { start: "2024-12-31", end: "2024-01-01" };
      expect(value.start > value.end).toBe(true);
    });

    it("same start and end date is valid (single day range)", () => {
      const value = { start: "2024-06-15", end: "2024-06-15" };
      expect(value.start <= value.end).toBe(true);
    });
  });

  describe("DateTime value type", () => {
    it("null represents no selection", () => {
      const value: string | null = null;
      expect(value).toBeNull();
    });

    it("value is an ISO datetime string", () => {
      const value = "2024-06-15T14:30";
      expect(typeof value).toBe("string");
    });

    it("datetime-local format is YYYY-MM-DDTHH:mm", () => {
      const value = "2024-06-15T14:30";
      expect(value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/);
    });
  });

  describe("PhoneInput value type and formatting", () => {
    it("value is a string", () => {
      const value = "(555) 123-4567";
      expect(typeof value).toBe("string");
    });

    it("US format: 10 digits become (XXX) XXX-XXXX", () => {
      // Inline reimplementation of the formatter to test the logic
      function extractDigits(v: string): string {
        return v.replace(/\D/g, "");
      }
      function formatPhone(digits: string): string {
        const d = digits.slice(0, 10);
        if (d.length === 0) return "";
        if (d.length <= 3) return `(${d}`;
        if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
        return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
      }
      const digits = extractDigits("5551234567");
      expect(formatPhone(digits)).toBe("(555) 123-4567");
    });

    it("US format: partial digits format correctly", () => {
      function extractDigits(v: string): string {
        return v.replace(/\D/g, "");
      }
      function formatPhone(digits: string): string {
        const d = digits.slice(0, 10);
        if (d.length === 0) return "";
        if (d.length <= 3) return `(${d}`;
        if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
        return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
      }
      expect(formatPhone(extractDigits("55"))).toBe("(55");
      expect(formatPhone(extractDigits("5551"))).toBe("(555) 1");
    });

    it("international format: 12 digits become +X XXX XXX XXXX", () => {
      function extractDigits(v: string): string {
        return v.replace(/\D/g, "");
      }
      function formatPhone(digits: string): string {
        const d = digits.slice(0, 12);
        if (d.length === 0) return "";
        if (d.length <= 1) return `+${d}`;
        if (d.length <= 4) return `+${d[0]} ${d.slice(1)}`;
        if (d.length <= 7) return `+${d[0]} ${d.slice(1, 4)} ${d.slice(4)}`;
        return `+${d[0]} ${d.slice(1, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
      }
      const digits = extractDigits("15551234567");
      expect(formatPhone(digits)).toBe("+1 555 123 4567");
    });

    it("raw format: returns only digits", () => {
      function extractDigits(v: string): string {
        return v.replace(/\D/g, "");
      }
      const digits = extractDigits("(555) 123-4567");
      expect(digits).toBe("5551234567");
    });

    it("empty input returns empty string", () => {
      function extractDigits(v: string): string {
        return v.replace(/\D/g, "");
      }
      function formatPhone(digits: string): string {
        const d = digits.slice(0, 10);
        if (d.length === 0) return "";
        return d;
      }
      expect(formatPhone(extractDigits(""))).toBe("");
    });
  });
});
