/**
 * Consumer smoke tests.
 *
 * Validates that every adapter registry can be imported, instantiated,
 * and produces a conformant field registry with all expected Tier 1 keys.
 */
import { describe, it, expect, vi } from "vitest";
import React from "react";
import { ComponentTypes } from "../../constants";

import { createFluentFieldRegistry } from "@formosaic/fluent";
import { createMuiFieldRegistry } from "@formosaic/mui";
import { createHeadlessFieldRegistry } from "@formosaic/headless";
import { createAntdFieldRegistry } from "@formosaic/antd";
import { createChakraFieldRegistry } from "@formosaic/chakra";
import { createMantineFieldRegistry } from "@formosaic/mantine";
import { createAtlaskitFieldRegistry } from "@formosaic/atlaskit";
import { createBaseWebFieldRegistry } from "@formosaic/base-web";
import { createHeroUIFieldRegistry } from "@formosaic/heroui";
import { createRadixFieldRegistry } from "@formosaic/radix";
import { createReactAriaFieldRegistry } from "@formosaic/react-aria";

// Mocks required for Mantine and Radix in jsdom
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const TIER_1_KEYS = [
  ComponentTypes.Textbox,
  ComponentTypes.Number,
  ComponentTypes.Toggle,
  ComponentTypes.Dropdown,
  ComponentTypes.MultiSelect,
  ComponentTypes.DateControl,
  ComponentTypes.Slider,
  ComponentTypes.Fragment,
  ComponentTypes.SimpleDropdown,
  ComponentTypes.Textarea,
  ComponentTypes.RadioGroup,
  ComponentTypes.CheckboxGroup,
  ComponentTypes.ReadOnly,
];

const adapters = [
  { name: "fluent", factory: createFluentFieldRegistry },
  { name: "mui", factory: createMuiFieldRegistry },
  { name: "headless", factory: createHeadlessFieldRegistry },
  { name: "antd", factory: createAntdFieldRegistry },
  { name: "chakra", factory: createChakraFieldRegistry },
  { name: "mantine", factory: createMantineFieldRegistry },
  { name: "atlaskit", factory: createAtlaskitFieldRegistry },
  { name: "base-web", factory: createBaseWebFieldRegistry },
  { name: "heroui", factory: createHeroUIFieldRegistry },
  { name: "radix", factory: createRadixFieldRegistry },
  { name: "react-aria", factory: createReactAriaFieldRegistry },
];

const baseProps = {
  fieldName: "smokeTest",
  testId: "smoke-test",
  readOnly: false,
  required: false,
  setFieldValue: vi.fn(),
  value: "",
};

describe("Consumer smoke tests", () => {
  describe("Registry creation", () => {
    adapters.forEach(({ name, factory }) => {
      it(`${name} creates a non-null registry`, () => {
        const registry = factory();
        expect(registry).toBeTruthy();
        expect(typeof registry).toBe("object");
      });
    });
  });

  describe("Registry shape", () => {
    adapters.forEach(({ name, factory }) => {
      it(`${name} contains all 13 Tier 1 keys`, () => {
        const registry = factory();
        for (const key of TIER_1_KEYS) {
          expect(registry[key], `${name} missing key: ${key}`).toBeDefined();
        }
      });
    });
  });

  describe("cloneElement compatibility", () => {
    adapters.forEach(({ name, factory }) => {
      it(`${name} Textbox element accepts props via cloneElement`, () => {
        const registry = factory();
        const element = registry[ComponentTypes.Textbox];
        const cloned = React.cloneElement(element, baseProps);
        expect(cloned).toBeTruthy();
      });
    });
  });

  describe("Type key consistency", () => {
    it("all adapters use identical type keys", () => {
      const registries = adapters.map(({ name, factory }) => ({
        name,
        keys: Object.keys(factory()).sort().join(","),
      }));
      // Compare Tier 1 keys only -- adapters may have different Tier 2 sets
      const tier1Set = TIER_1_KEYS.slice().sort().join(",");
      for (const { name, keys } of registries) {
        const adapterTier1 = keys
          .split(",")
          .filter((k) => TIER_1_KEYS.includes(k))
          .sort()
          .join(",");
        expect(adapterTier1, `${name} Tier 1 keys mismatch`).toBe(tier1Set);
      }
    });
  });

  describe("Radix + React Aria import validation", () => {
    it("radix registry exports createRadixFieldRegistry", () => {
      expect(typeof createRadixFieldRegistry).toBe("function");
    });

    it("react-aria registry exports createReactAriaFieldRegistry", () => {
      expect(typeof createReactAriaFieldRegistry).toBe("function");
    });
  });
});
