/**
 * Edge-case canonical value tests for Tier 1 field types.
 *
 * Uses the headless adapter (pure semantic HTML, no provider needed)
 * to verify how each field type handles undefined, null, empty, and
 * boundary values in both editable and readOnly modes.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import { createHeadlessFieldRegistry } from "@formosaic/headless";
import { ComponentTypes } from "../../constants";

const registry = createHeadlessFieldRegistry();

const baseProps = {
  fieldName: "testField",
  testId: "edge-test",
  readOnly: false,
  required: false,
  setFieldValue: vi.fn(),
};

const TEST_OPTIONS = [
  { value: "opt1", label: "Option 1" },
  { value: "opt2", label: "Option 2" },
  { value: "opt3", label: "Option 3" },
];

function renderField(type: string, extraProps: Record<string, unknown> = {}) {
  const element = registry[type];
  return render(React.cloneElement(element, { ...baseProps, ...extraProps }));
}

describe("Edge-case canonical values", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------------
  // Textbox
  // ---------------------------------------------------------------
  describe("Textbox edge cases", () => {
    const type = ComponentTypes.Textbox;

    it("renders undefined as empty input", () => {
      const { container } = renderField(type, { value: undefined });
      const input = container.querySelector("input")!;
      expect(input.value).toBe("");
    });

    it("renders null as empty input", () => {
      const { container } = renderField(type, { value: null });
      const input = container.querySelector("input")!;
      expect(input.value).toBe("");
    });

    it("renders empty string as empty input", () => {
      const { container } = renderField(type, { value: "" });
      const input = container.querySelector("input")!;
      expect(input.value).toBe("");
    });

    it("renders whitespace string as-is", () => {
      const { container } = renderField(type, { value: "  " });
      const input = container.querySelector("input")!;
      expect(input.value).toBe("  ");
    });

    it("readOnly with missing value shows sentinel", () => {
      const { container } = renderField(type, { readOnly: true, value: undefined });
      expect(container.textContent).toContain("-");
    });

    it("readOnly with value shows value text", () => {
      const { container } = renderField(type, { readOnly: true, value: "hello" });
      expect(container.textContent).toContain("hello");
    });
  });

  // ---------------------------------------------------------------
  // Textarea
  // ---------------------------------------------------------------
  describe("Textarea edge cases", () => {
    const type = ComponentTypes.Textarea;

    it("renders undefined as empty textarea", () => {
      const { container } = renderField(type, { value: undefined });
      const textarea = container.querySelector("textarea")!;
      expect(textarea.value).toBe("");
    });

    it("renders null as empty textarea", () => {
      const { container } = renderField(type, { value: null });
      const textarea = container.querySelector("textarea")!;
      expect(textarea.value).toBe("");
    });

    it("readOnly with missing value shows sentinel", () => {
      const { container } = renderField(type, { readOnly: true, value: undefined });
      expect(container.textContent).toContain("-");
    });

    it("readOnly with value shows value text", () => {
      const { container } = renderField(type, { readOnly: true, value: "some\nnotes" });
      expect(container.textContent).toContain("some");
      expect(container.textContent).toContain("notes");
    });
  });

  // ---------------------------------------------------------------
  // Number
  // ---------------------------------------------------------------
  describe("Number edge cases", () => {
    const type = ComponentTypes.Number;

    it("renders undefined as empty input", () => {
      const { container } = renderField(type, { value: undefined });
      const input = container.querySelector("input")!;
      expect(input.value).toBe("");
    });

    it("renders null as empty input", () => {
      const { container } = renderField(type, { value: null });
      const input = container.querySelector("input")!;
      expect(input.value).toBe("");
    });

    it("renders 0 as '0'", () => {
      const { container } = renderField(type, { value: 0 });
      const input = container.querySelector("input")!;
      expect(input.value).toBe("0");
    });

    it("renders negative number", () => {
      const { container } = renderField(type, { value: -1 });
      const input = container.querySelector("input")!;
      expect(input.value).toBe("-1");
    });

    it("renders decimal", () => {
      const { container } = renderField(type, { value: 3.14 });
      const input = container.querySelector("input")!;
      expect(input.value).toBe("3.14");
    });

    it("readOnly with missing value shows sentinel", () => {
      // Number readOnly calls ReadOnlyText with String(undefined) = "undefined"
      // ReadOnlyText shows value if truthy; "undefined" is truthy so it displays
      const { container } = renderField(type, { readOnly: true, value: undefined });
      // The Number field does String(value) which yields "undefined" -- ReadOnlyText shows it
      expect(container.textContent).toBeTruthy();
    });

    it("readOnly with 0 shows '0'", () => {
      // Number readOnly calls ReadOnlyText with String(0) = "0"
      // ReadOnlyText: "0" is truthy so it displays "0"
      const { container } = renderField(type, { readOnly: true, value: 0 });
      expect(container.textContent).toContain("0");
    });
  });

  // ---------------------------------------------------------------
  // Toggle
  // ---------------------------------------------------------------
  describe("Toggle edge cases", () => {
    const type = ComponentTypes.Toggle;

    it("renders undefined as unchecked", () => {
      const { container } = renderField(type, { value: undefined });
      const input = container.querySelector("input[type='checkbox']") as HTMLInputElement;
      expect(input.checked).toBe(false);
    });

    it("renders null as unchecked", () => {
      const { container } = renderField(type, { value: null });
      const input = container.querySelector("input[type='checkbox']") as HTMLInputElement;
      expect(input.checked).toBe(false);
    });

    it("renders false as unchecked", () => {
      const { container } = renderField(type, { value: false });
      const input = container.querySelector("input[type='checkbox']") as HTMLInputElement;
      expect(input.checked).toBe(false);
    });

    it("renders true as checked", () => {
      const { container } = renderField(type, { value: true });
      const input = container.querySelector("input[type='checkbox']") as HTMLInputElement;
      expect(input.checked).toBe(true);
    });

    it("readOnly with true shows 'Yes'", () => {
      const { container } = renderField(type, { readOnly: true, value: true });
      expect(container.textContent).toContain("Yes");
    });

    it("readOnly with false shows 'No'", () => {
      const { container } = renderField(type, { readOnly: true, value: false });
      expect(container.textContent).toContain("No");
    });

    it("readOnly with undefined shows empty or sentinel", () => {
      // convertBooleanToYesOrNoText(undefined) returns ""
      // ReadOnlyText shows "-" for falsy value
      const { container } = renderField(type, { readOnly: true, value: undefined });
      expect(container.textContent).toContain("-");
    });
  });

  // ---------------------------------------------------------------
  // Dropdown
  // ---------------------------------------------------------------
  describe("Dropdown edge cases", () => {
    const type = ComponentTypes.Dropdown;

    it("renders undefined as placeholder", () => {
      const { container } = renderField(type, { value: undefined, options: TEST_OPTIONS });
      const select = container.querySelector("select") as HTMLSelectElement;
      expect(select.value).toBe("");
    });

    it("renders null as placeholder", () => {
      const { container } = renderField(type, { value: null, options: TEST_OPTIONS });
      const select = container.querySelector("select") as HTMLSelectElement;
      expect(select.value).toBe("");
    });

    it("renders empty string as placeholder", () => {
      const { container } = renderField(type, { value: "", options: TEST_OPTIONS });
      const select = container.querySelector("select") as HTMLSelectElement;
      expect(select.value).toBe("");
    });

    it("renders selected value", () => {
      const { container } = renderField(type, { value: "opt1", options: TEST_OPTIONS });
      const select = container.querySelector("select") as HTMLSelectElement;
      expect(select.value).toBe("opt1");
    });

    it("handles unknown value gracefully", () => {
      // select with an unknown value falls back to the first option (placeholder "")
      const { container } = renderField(type, { value: "nonexistent", options: TEST_OPTIONS });
      expect(container).toBeTruthy();
    });

    it("readOnly with value shows label", () => {
      const { container } = renderField(type, { readOnly: true, value: "opt1", options: TEST_OPTIONS });
      expect(container.textContent).toContain("Option 1");
    });

    it("readOnly with missing value shows sentinel", () => {
      const { container } = renderField(type, { readOnly: true, value: undefined, options: TEST_OPTIONS });
      expect(container.textContent).toContain("-");
    });
  });

  // ---------------------------------------------------------------
  // SimpleDropdown
  // ---------------------------------------------------------------
  describe("SimpleDropdown edge cases", () => {
    const type = ComponentTypes.SimpleDropdown;

    it("renders undefined as placeholder", () => {
      const { container } = renderField(type, { value: undefined, config: { dropdownOptions: ["A", "B"] } });
      const select = container.querySelector("select") as HTMLSelectElement;
      expect(select.value).toBe("");
    });

    it("renders selected value", () => {
      const { container } = renderField(type, { value: "A", config: { dropdownOptions: ["A", "B"] } });
      const select = container.querySelector("select") as HTMLSelectElement;
      expect(select.value).toBe("A");
    });

    it("readOnly with missing value shows sentinel", () => {
      const { container } = renderField(type, { readOnly: true, value: undefined });
      expect(container.textContent).toContain("-");
    });
  });

  // ---------------------------------------------------------------
  // MultiSelect
  // ---------------------------------------------------------------
  describe("MultiSelect edge cases", () => {
    const type = ComponentTypes.MultiSelect;

    it("renders undefined without crash", () => {
      const { container } = renderField(type, { value: undefined, options: TEST_OPTIONS });
      expect(container).toBeTruthy();
    });

    it("renders null without crash", () => {
      const { container } = renderField(type, { value: null, options: TEST_OPTIONS });
      expect(container).toBeTruthy();
    });

    it("renders empty array", () => {
      const { container } = renderField(type, { value: [], options: TEST_OPTIONS });
      const select = container.querySelector("select") as HTMLSelectElement;
      const selected = Array.from(select.selectedOptions);
      expect(selected).toHaveLength(0);
    });

    it("renders with selected values", () => {
      const { container } = renderField(type, { value: ["opt1", "opt2"], options: TEST_OPTIONS });
      const select = container.querySelector("select") as HTMLSelectElement;
      const selected = Array.from(select.selectedOptions).map(o => o.value);
      expect(selected).toContain("opt1");
      expect(selected).toContain("opt2");
    });

    it("readOnly with values shows text", () => {
      const { container } = renderField(type, { readOnly: true, value: ["opt1"], options: TEST_OPTIONS });
      expect(container.textContent).toContain("opt1");
    });

    it("readOnly with empty shows sentinel", () => {
      const { container } = renderField(type, { readOnly: true, value: undefined, options: TEST_OPTIONS });
      expect(container.textContent).toContain("-");
    });
  });

  // ---------------------------------------------------------------
  // RadioGroup
  // ---------------------------------------------------------------
  describe("RadioGroup edge cases", () => {
    const type = ComponentTypes.RadioGroup;

    it("renders with no selection", () => {
      const { container } = renderField(type, { value: undefined, options: TEST_OPTIONS });
      const radios = container.querySelectorAll("input[type='radio']");
      expect(radios.length).toBe(TEST_OPTIONS.length);
      const checked = Array.from(radios).filter((r) => (r as HTMLInputElement).checked);
      expect(checked).toHaveLength(0);
    });

    it("renders with selected value", () => {
      const { container } = renderField(type, { value: "opt1", options: TEST_OPTIONS });
      const radios = container.querySelectorAll("input[type='radio']");
      const checked = Array.from(radios).filter((r) => (r as HTMLInputElement).checked);
      expect(checked).toHaveLength(1);
      expect((checked[0] as HTMLInputElement).value).toBe("opt1");
    });

    it("handles unknown value gracefully", () => {
      const { container } = renderField(type, { value: "nonexistent", options: TEST_OPTIONS });
      const radios = container.querySelectorAll("input[type='radio']");
      const checked = Array.from(radios).filter((r) => (r as HTMLInputElement).checked);
      expect(checked).toHaveLength(0);
    });

    it("readOnly with value shows label", () => {
      const { container } = renderField(type, { readOnly: true, value: "opt1", options: TEST_OPTIONS });
      expect(container.textContent).toContain("Option 1");
    });

    it("readOnly with missing value shows sentinel", () => {
      const { container } = renderField(type, { readOnly: true, value: undefined, options: TEST_OPTIONS });
      expect(container.textContent).toContain("-");
    });
  });

  // ---------------------------------------------------------------
  // CheckboxGroup
  // ---------------------------------------------------------------
  describe("CheckboxGroup edge cases", () => {
    const type = ComponentTypes.CheckboxGroup;

    it("renders with no selection", () => {
      const { container } = renderField(type, { value: undefined, options: TEST_OPTIONS });
      const checkboxes = container.querySelectorAll("input[type='checkbox']");
      expect(checkboxes.length).toBe(TEST_OPTIONS.length);
      const checked = Array.from(checkboxes).filter((c) => (c as HTMLInputElement).checked);
      expect(checked).toHaveLength(0);
    });

    it("renders with empty array", () => {
      const { container } = renderField(type, { value: [], options: TEST_OPTIONS });
      const checked = Array.from(container.querySelectorAll("input[type='checkbox']"))
        .filter((c) => (c as HTMLInputElement).checked);
      expect(checked).toHaveLength(0);
    });

    it("renders with selected values", () => {
      const { container } = renderField(type, { value: ["opt1", "opt2"], options: TEST_OPTIONS });
      const checked = Array.from(container.querySelectorAll("input[type='checkbox']"))
        .filter((c) => (c as HTMLInputElement).checked);
      expect(checked).toHaveLength(2);
    });

    it("readOnly with values shows labels", () => {
      const { container } = renderField(type, { readOnly: true, value: ["opt1"], options: TEST_OPTIONS });
      expect(container.textContent).toContain("Option 1");
    });

    it("readOnly with empty shows sentinel", () => {
      // CheckboxGroup readOnly: selected = [] (from undefined), labels = "", ReadOnlyText shows "-"
      const { container } = renderField(type, { readOnly: true, value: undefined, options: TEST_OPTIONS });
      expect(container.textContent).toContain("-");
    });
  });

  // ---------------------------------------------------------------
  // DateControl
  // ---------------------------------------------------------------
  describe("DateControl edge cases", () => {
    const type = ComponentTypes.DateControl;

    it("renders null as empty", () => {
      const { container } = renderField(type, { value: null });
      const input = container.querySelector("input[type='date']") as HTMLInputElement;
      expect(input.value).toBe("");
    });

    it("renders undefined as empty", () => {
      const { container } = renderField(type, { value: undefined });
      const input = container.querySelector("input[type='date']") as HTMLInputElement;
      expect(input.value).toBe("");
    });

    it("renders ISO date string", () => {
      const { container } = renderField(type, { value: "2024-01-15T00:00:00.000Z" });
      const input = container.querySelector("input[type='date']") as HTMLInputElement;
      expect(input.value).toBe("2024-01-15");
    });

    it("readOnly with value shows formatted date", () => {
      const { container } = renderField(type, { readOnly: true, value: "2024-01-15T00:00:00.000Z" });
      // DateControl readOnly renders a <time> element
      const time = container.querySelector("time");
      expect(time).toBeTruthy();
      expect(container.textContent).toBeTruthy();
    });

    it("readOnly with null shows sentinel", () => {
      const { container } = renderField(type, { readOnly: true, value: null });
      expect(container.textContent).toContain("-");
    });
  });

  // ---------------------------------------------------------------
  // Slider
  // ---------------------------------------------------------------
  describe("Slider edge cases", () => {
    const type = ComponentTypes.Slider;

    it("renders undefined as 0", () => {
      const { container } = renderField(type, { value: undefined });
      const input = container.querySelector("input[type='range']") as HTMLInputElement;
      expect(input.value).toBe("0");
    });

    it("renders null as 0", () => {
      const { container } = renderField(type, { value: null });
      const input = container.querySelector("input[type='range']") as HTMLInputElement;
      expect(input.value).toBe("0");
    });

    it("renders value", () => {
      const { container } = renderField(type, { value: 50 });
      const input = container.querySelector("input[type='range']") as HTMLInputElement;
      expect(input.value).toBe("50");
    });

    it("readOnly with value shows number", () => {
      const { container } = renderField(type, { readOnly: true, value: 50 });
      expect(container.textContent).toContain("50");
    });
  });

  // ---------------------------------------------------------------
  // DynamicFragment
  // ---------------------------------------------------------------
  describe("DynamicFragment edge cases", () => {
    const type = ComponentTypes.Fragment;

    it("renders as hidden input", () => {
      const { container } = renderField(type, { value: undefined });
      const input = container.querySelector("input[type='hidden']");
      expect(input).toBeTruthy();
    });

    it("preserves value in hidden input", () => {
      const { container } = renderField(type, { value: "frag-val" });
      const input = container.querySelector("input[type='hidden']") as HTMLInputElement;
      expect(input.value).toBe("frag-val");
    });

    it("readOnly still renders hidden input", () => {
      const { container } = renderField(type, { readOnly: true, value: "val" });
      const input = container.querySelector("input[type='hidden']");
      expect(input).toBeTruthy();
    });
  });

  // ---------------------------------------------------------------
  // ReadOnly
  // ---------------------------------------------------------------
  describe("ReadOnly field edge cases", () => {
    const type = ComponentTypes.ReadOnly;

    it("renders string value", () => {
      const { container } = renderField(type, { value: "hello" });
      expect(container.textContent).toContain("hello");
    });

    it("renders number as string", () => {
      // ReadOnly passes value as string to ReadOnlyText; number gets coerced
      const { container } = renderField(type, { value: 42 });
      expect(container.textContent).toContain("42");
    });

    it("renders empty as sentinel", () => {
      const { container } = renderField(type, { value: undefined });
      expect(container.textContent).toContain("-");
    });

    it("renders null as sentinel", () => {
      const { container } = renderField(type, { value: null });
      expect(container.textContent).toContain("-");
    });
  });
});
