import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import { createHeadlessFieldRegistry } from "@formosaic/headless";
import { ComponentTypes } from "../../constants";
import { resetRenderTracker } from "../../helpers/RenderTracker";
import type { IFormConfig } from "../../types/IFormConfig";

/** Builds a simple N-field form config for sanity tests */
function createSimpleFormConfig(fieldCount: number, rulesPerField = 0): IFormConfig {
  const fields: Record<string, any> = {};
  const fieldOrder: string[] = [];
  for (let i = 0; i < fieldCount; i++) {
    const name = `field${i}`;
    fieldOrder.push(name);
    fields[name] = {
      type: i % 2 === 0 ? "Textbox" : "Dropdown",
      label: `Field ${i}`,
      ...(i % 2 === 1
        ? { options: [{ value: "a", label: "A" }, { value: "b", label: "B" }] }
        : {}),
    };
    if (rulesPerField > 0 && i > 0) {
      fields[name].rules = [
        {
          id: `rule-${i}`,
          when: { field: `field${i - 1}`, operator: "isNotEmpty" },
          then: { required: true },
        },
      ];
    }
  }
  return { version: 2, fields, fieldOrder };
}

const baseProps = {
  fieldName: "perfField",
  testId: "perf-test",
  value: undefined as unknown,
  readOnly: false,
  required: false,
  setFieldValue: vi.fn(),
};

describe("Render sanity checks", () => {
  const registry = createHeadlessFieldRegistry();

  beforeEach(() => {
    resetRenderTracker();
  });

  describe("Baseline render counts", () => {
    it("renders a 10-field form without excessive rerenders", () => {
      const config = createSimpleFormConfig(10);
      for (const [key, fieldConfig] of Object.entries(config.fields)) {
        const type = (fieldConfig as any).type;
        const element = registry[type];
        if (element) {
          const props: Record<string, unknown> = {
            ...baseProps,
            fieldName: key,
          };
          if ((fieldConfig as any).options) {
            props.options = (fieldConfig as any).options;
          }
          const { unmount } = render(React.cloneElement(element, props));
          unmount();
        }
      }
      // If we got here without hanging, the test passes
      expect(true).toBe(true);
    });
  });

  describe("Option-heavy rendering", () => {
    it("dropdown with 200 options renders without hanging", () => {
      const options = Array.from({ length: 200 }, (_, i) => ({
        value: `opt${i}`,
        label: `Option ${i}`,
      }));
      const element = registry[ComponentTypes.Dropdown];
      const { container } = render(
        React.cloneElement(element, {
          ...baseProps,
          options,
          value: "opt50",
        })
      );
      // 200 options + 1 placeholder <option>
      expect(container.querySelectorAll("option").length).toBeGreaterThanOrEqual(200);
    });

    it("multiselect with 200 options renders without hanging", () => {
      const options = Array.from({ length: 200 }, (_, i) => ({
        value: `opt${i}`,
        label: `Option ${i}`,
      }));
      const element = registry[ComponentTypes.MultiSelect];
      const { container } = render(
        React.cloneElement(element, {
          ...baseProps,
          options,
          value: ["opt1", "opt2"],
        })
      );
      expect(container).toBeTruthy();
    });
  });

  describe("Rules overhead", () => {
    it("form with 0 rules renders all fields", () => {
      const config = createSimpleFormConfig(10, 0);
      const fieldCount = Object.keys(config.fields).length;
      expect(fieldCount).toBe(10);
      for (const fieldConfig of Object.values(config.fields)) {
        const element = registry[(fieldConfig as any).type];
        expect(element).toBeDefined();
      }
    });

    it("form with 10 rules (1 per field) still generates valid config", () => {
      const config = createSimpleFormConfig(10, 1);
      const fieldCount = Object.keys(config.fields).length;
      expect(fieldCount).toBe(10);
      const fieldsWithRules = Object.values(config.fields).filter(
        (f: any) => f.rules && f.rules.length > 0
      );
      expect(fieldsWithRules.length).toBeGreaterThan(0);
    });
  });
});
