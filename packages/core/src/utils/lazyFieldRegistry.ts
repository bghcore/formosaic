import React from "react";
import { Dictionary } from "../utils";

type LazyFieldImport = () => Promise<{ default: React.ComponentType<any> }>;

/**
 * Creates a field registry where components are loaded on-demand via React.lazy().
 * Fields are only loaded when first rendered, reducing initial bundle size.
 *
 * @example
 * const registry = createLazyFieldRegistry({
 *   Textbox: () => import("./fields/Textbox"),
 *   Dropdown: () => import("./fields/Dropdown"),
 * });
 */
export function createLazyFieldRegistry(
  imports: Record<string, LazyFieldImport>
): Dictionary<React.JSX.Element> {
  const registry: Dictionary<React.JSX.Element> = {};

  for (const [key, importFn] of Object.entries(imports)) {
    const LazyComponent = React.lazy(importFn);
    registry[key] = React.createElement(
      React.Suspense,
      { fallback: React.createElement("span", { className: "field-loading" }, "Loading...") },
      React.createElement(LazyComponent)
    );
  }

  return registry;
}
