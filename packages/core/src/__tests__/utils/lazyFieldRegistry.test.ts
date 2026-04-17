import { describe, it, expect, vi } from "vitest";
import React from "react";
import { act, render, waitFor } from "@testing-library/react";
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

  it("defers the dynamic import until a lazy field is rendered", () => {
    const importFn = vi.fn(() =>
      Promise.resolve({
        default: () => React.createElement("input", { "data-testid": "lazy-input" }),
      })
    );
    createLazyFieldRegistry({ Textbox: importFn });

    // Creating the registry alone does NOT execute the import function —
    // React.lazy is cold until mounted inside <Suspense>.
    expect(importFn).not.toHaveBeenCalled();
  });

  it("renders the lazy component after its import resolves (Suspense boundary)", async () => {
    let resolveImport:
      | ((value: { default: React.ComponentType<Record<string, unknown>> }) => void)
      | undefined;
    const importPromise = new Promise<{
      default: React.ComponentType<Record<string, unknown>>;
    }>((resolve) => {
      resolveImport = resolve;
    });
    const registry = createLazyFieldRegistry({ Textbox: () => importPromise });

    const element = registry.Textbox;
    const { container, getByText, queryByTestId } = render(element);

    // Before import resolves, the Suspense fallback is visible.
    expect(getByText("Loading...")).toBeTruthy();
    expect(queryByTestId("lazy-resolved")).toBeNull();

    // Resolve the import — the lazy component should render.
    await act(async () => {
      resolveImport?.({
        default: () =>
          React.createElement("input", {
            "data-testid": "lazy-resolved",
            type: "text",
          }),
      });
    });

    await waitFor(() => {
      expect(container.querySelector('[data-testid="lazy-resolved"]')).toBeTruthy();
    });
  });

  it("surfaces import errors via Suspense/error-boundary chain", async () => {
    class ErrorBoundary extends React.Component<
      { children: React.ReactNode },
      { hasError: boolean }
    > {
      state = { hasError: false };
      static getDerivedStateFromError() {
        return { hasError: true };
      }
      // Swallow errors in the test render tree.
      componentDidCatch() {
        /* noop */
      }
      render() {
        if (this.state.hasError)
          return React.createElement("div", { "data-testid": "boundary" }, "caught");
        return this.props.children;
      }
    }

    // Suppress the expected React "Uncaught error" warning in this test.
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    const failing = createLazyFieldRegistry({
      BadField: () => Promise.reject(new Error("import failed")),
    });

    const tree = React.createElement(ErrorBoundary, null, failing.BadField);
    const { findByTestId } = render(tree);
    const node = await findByTestId("boundary");
    expect(node.textContent).toMatch(/caught/i);

    spy.mockRestore();
  });
});
