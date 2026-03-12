import { describe, it, expect } from "vitest";
import {
  GetFieldDataTestId,
  FieldClassName,
  getFieldState,
  formatDateTime,
  formatDateTimeValue,
  formatDateRange,
  getFileNames,
  extractDigits,
  formatPhone,
  ellipsifyText,
  MAX_FILE_SIZE_MB_DEFAULT,
  DocumentLinksStrings,
} from "../../helpers/FieldUtils";

describe("FieldUtils", () => {
  describe("GetFieldDataTestId", () => {
    it("returns testId-fieldName when testId is provided", () => {
      expect(GetFieldDataTestId("name", "my-form")).toBe("my-form-name");
    });

    it("returns just fieldName when testId is undefined", () => {
      expect(GetFieldDataTestId("name")).toBe("name");
    });
  });

  describe("FieldClassName", () => {
    it("returns className without error suffix when no error", () => {
      expect(FieldClassName("fe-textbox")).toBe("fe-textbox");
    });

    it("appends error suffix when error present", () => {
      expect(FieldClassName("fe-textbox", { type: "required", message: "Required" })).toBe("fe-textbox error");
    });
  });

  describe("getFieldState", () => {
    it("returns 'error' when error is present", () => {
      expect(getFieldState({ error: { type: "required", message: "Required" } })).toBe("error");
    });

    it("returns 'required' when required", () => {
      expect(getFieldState({ required: true })).toBe("required");
    });

    it("returns 'readonly' when readOnly", () => {
      expect(getFieldState({ readOnly: true })).toBe("readonly");
    });

    it("returns 'disabled' when disabled", () => {
      expect(getFieldState({ disabled: true })).toBe("disabled");
    });

    it("returns undefined when no state", () => {
      expect(getFieldState({})).toBeUndefined();
    });

    it("prioritizes error over other states", () => {
      expect(getFieldState({ error: { type: "required", message: "!" }, required: true, readOnly: true })).toBe("error");
    });
  });

  describe("formatDateTime", () => {
    it("returns empty string for empty input", () => {
      expect(formatDateTime("")).toBe("");
    });

    it("returns original string for invalid date", () => {
      expect(formatDateTime("not-a-date")).toBe("not-a-date");
    });

    it("formats date with time by default", () => {
      const result = formatDateTime("2024-01-15T14:30:00");
      expect(result).toContain("2024");
      expect(result).toContain("Jan");
      expect(result).toContain("15");
    });

    it("formats date without time when hideTimestamp is true", () => {
      const result = formatDateTime("2024-01-15T14:30:00", { hideTimestamp: true });
      expect(result).toContain("Jan");
      expect(result).toContain("15");
      expect(result).toContain("2024");
    });
  });

  describe("formatDateTimeValue", () => {
    it("returns empty string for falsy input", () => {
      expect(formatDateTimeValue(null)).toBe("");
      expect(formatDateTimeValue(undefined)).toBe("");
      expect(formatDateTimeValue("")).toBe("");
    });

    it("formats valid date strings", () => {
      const result = formatDateTimeValue("2024-01-15T14:30:00");
      expect(result).toContain("Jan");
    });
  });

  describe("formatDateRange", () => {
    it("returns empty string for falsy input", () => {
      expect(formatDateRange(null)).toBe("");
    });

    it("returns empty string when both dates are empty", () => {
      expect(formatDateRange({ start: "", end: "" })).toBe("");
    });

    it("returns range with dash when both dates exist", () => {
      expect(formatDateRange({ start: "2024-01-01", end: "2024-01-31" })).toBe("2024-01-01 – 2024-01-31");
    });

    it("returns just start when end is empty", () => {
      expect(formatDateRange({ start: "2024-01-01", end: "" })).toBe("2024-01-01");
    });

    it("returns just end when start is empty", () => {
      expect(formatDateRange({ start: "", end: "2024-01-31" })).toBe("2024-01-31");
    });
  });

  describe("getFileNames", () => {
    it("returns empty string for falsy input", () => {
      expect(getFileNames(null)).toBe("");
      expect(getFileNames(undefined)).toBe("");
    });

    it("returns single file name", () => {
      const file = new File(["content"], "test.txt");
      expect(getFileNames(file)).toBe("test.txt");
    });

    it("returns comma-separated names for array", () => {
      const files = [new File(["a"], "a.txt"), new File(["b"], "b.txt")];
      expect(getFileNames(files)).toBe("a.txt, b.txt");
    });
  });

  describe("extractDigits", () => {
    it("strips non-digit characters", () => {
      expect(extractDigits("(555) 123-4567")).toBe("5551234567");
    });

    it("returns empty string for no digits", () => {
      expect(extractDigits("abc")).toBe("");
    });
  });

  describe("formatPhone", () => {
    it("formats US number", () => {
      expect(formatPhone("5551234567", "us")).toBe("(555) 123-4567");
    });

    it("formats partial US number", () => {
      expect(formatPhone("555", "us")).toBe("(555");
      expect(formatPhone("555123", "us")).toBe("(555) 123");
    });

    it("formats international number", () => {
      expect(formatPhone("15551234567", "international")).toBe("+1 555 123 4567");
    });

    it("returns raw digits in raw mode", () => {
      expect(formatPhone("5551234567", "raw")).toBe("5551234567");
    });

    it("returns empty string for empty input", () => {
      expect(formatPhone("", "us")).toBe("");
      expect(formatPhone("", "international")).toBe("");
    });
  });

  describe("ellipsifyText", () => {
    it("returns original text when under limit", () => {
      expect(ellipsifyText("hello", 10)).toBe("hello");
    });

    it("truncates with ellipsis when over limit", () => {
      expect(ellipsifyText("hello world", 8)).toBe("hello...");
    });

    it("handles empty string", () => {
      expect(ellipsifyText("", 10)).toBe("");
    });
  });

  describe("Constants", () => {
    it("exports MAX_FILE_SIZE_MB_DEFAULT as 10", () => {
      expect(MAX_FILE_SIZE_MB_DEFAULT).toBe(10);
    });

    it("exports DocumentLinksStrings", () => {
      expect(DocumentLinksStrings.link).toBe("Link");
      expect(DocumentLinksStrings.addLink).toBe("Add Link");
      expect(DocumentLinksStrings.cancel).toBe("Cancel");
    });
  });
});
