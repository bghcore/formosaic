import { describe, bench } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import { createHeadlessFieldRegistry } from "@form-eng/headless";
import { generateFormConfig, generateEntityData } from "../generators/generateFormConfig";
import { ComponentTypes } from "../../packages/core/src/constants";

const registry = createHeadlessFieldRegistry();

const baseProps = {
  fieldName: "benchField",
  programName: "bench",
  entityType: "test",
  entityId: "bench-1",
  value: undefined as unknown,
  readOnly: false,
  required: false,
  setFieldValue: () => {},
};

/** Map generator field types to actual registry ComponentTypes */
function mapType(type: string): string {
  switch (type) {
    case "NumberInput":
      return ComponentTypes.Number;
    case "DatePicker":
      return ComponentTypes.DateControl;
    default:
      return type;
  }
}

describe("Adapter render benchmarks", () => {
  bench("render 10-field form (headless)", () => {
    const config = generateFormConfig({ fieldCount: 10 });
    for (const [key, fieldConfig] of Object.entries(config.fields)) {
      const registryType = mapType((fieldConfig as any).type);
      const element = registry[registryType];
      if (element) {
        const { unmount } = render(
          React.cloneElement(element, {
            ...baseProps,
            fieldName: key,
          })
        );
        unmount();
      }
    }
  });

  bench("render 10-field form hydrated (headless)", () => {
    const config = generateFormConfig({ fieldCount: 10 });
    const data = generateEntityData(10);
    for (const [key, fieldConfig] of Object.entries(config.fields)) {
      const registryType = mapType((fieldConfig as any).type);
      const element = registry[registryType];
      if (element) {
        const { unmount } = render(
          React.cloneElement(element, {
            ...baseProps,
            fieldName: key,
            value: data[key],
          })
        );
        unmount();
      }
    }
  });

  bench("render 50-field form (headless)", () => {
    const config = generateFormConfig({ fieldCount: 50 });
    for (const [key, fieldConfig] of Object.entries(config.fields)) {
      const registryType = mapType((fieldConfig as any).type);
      const element = registry[registryType];
      if (element) {
        const { unmount } = render(
          React.cloneElement(element, {
            ...baseProps,
            fieldName: key,
          })
        );
        unmount();
      }
    }
  });

  bench("render dropdown with 200 options (headless)", () => {
    const options = Array.from({ length: 200 }, (_, i) => ({
      value: `opt${i}`,
      label: `Option ${i}`,
    }));
    const element = registry[ComponentTypes.Dropdown];
    const { unmount } = render(
      React.cloneElement(element, {
        ...baseProps,
        options,
        value: "opt100",
      })
    );
    unmount();
  });
});
