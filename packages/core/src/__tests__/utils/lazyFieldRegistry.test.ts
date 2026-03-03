import { describe, it, expect } from "vitest";
import React from "react";
import { createLazyFieldRegistry } from "../../utils/lazyFieldRegistry";

describe("createLazyFieldRegistry", () => {
  it("creates registry with correct keys", () => {
    const registry = createLazyFieldRegistry({
      Textbox: () => Promise.resolve({ default: () => React.createElement("input") }),
      Dropdown: () => Promise.resolve({ default: () => React.createElement("select") }),
      Toggle: () => Promise.resolve({ default: () => React.createElement("input", { type: "checkbox" }) }),
    });

    expect(Object.keys(registry)).toEqual(["Textbox", "Dropdown", "Toggle"]);
  });

  it("each value is a valid JSX element", () => {
    const registry = createLazyFieldRegistry({
      Textbox: () => Promise.resolve({ default: () => React.createElement("input") }),
      Dropdown: () => Promise.resolve({ default: () => React.createElement("select") }),
    });

    for (const key of Object.keys(registry)) {
      const element = registry[key];
      expect(React.isValidElement(element)).toBe(true);
    }
  });

  it("handles empty imports object", () => {
    const registry = createLazyFieldRegistry({});

    expect(registry).toEqual({});
    expect(Object.keys(registry)).toHaveLength(0);
  });
});
