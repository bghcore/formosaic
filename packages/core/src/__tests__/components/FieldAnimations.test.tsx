import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, act } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import RenderField from "../../components/RenderField";
import { FieldWrapper } from "../../components/FieldWrapper";
import { InjectedFieldProvider } from "../../providers/InjectedFieldProvider";
import { RulesEngineProvider } from "../../providers/RulesEngineProvider";
import { Formosaic } from "../../components/Formosaic";
import { IOption } from "../../types/IOption";

// ─── Minimal test field ───────────────────────────────────────────────────────

const TestInput: React.FC<{ value?: string; fieldName?: string }> = ({ value, fieldName }) => (
  <input data-testid={`field-${fieldName}`} defaultValue={value || ""} />
);

// ─── Test wrapper helpers ─────────────────────────────────────────────────────

const TestWrapper: React.FC<React.PropsWithChildren<{ defaultValues?: Record<string, unknown> }>> = ({ children, defaultValues }) => {
  const methods = useForm({ defaultValues: defaultValues || { testField: "" } });
  const fields = { Textbox: <TestInput /> };
  return (
    <InjectedFieldProvider injectedFields={fields}>
      <FormProvider {...methods}>{children}</FormProvider>
    </InjectedFieldProvider>
  );
};

const defaultProps = {
  fieldName: "testField",
  type: "Textbox",
  label: "Test Label",
  setFieldValue: vi.fn(),
};

// ─── 1. Field show/hide animation ────────────────────────────────────────────

describe("Field show/hide animation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("sets data-exiting attribute when hidden changes to true", async () => {
    const { rerender, container } = render(
      <TestWrapper>
        <RenderField {...defaultProps} hidden={false} />
      </TestWrapper>
    );

    // Initially visible — no data-exiting
    const wrapper = container.querySelector(".formosaic-field-animate");
    expect(wrapper).toBeTruthy();
    expect(wrapper).not.toHaveAttribute("data-exiting");

    // Toggle hidden to true
    await act(async () => {
      rerender(
        <TestWrapper>
          <RenderField {...defaultProps} hidden={true} />
        </TestWrapper>
      );
    });

    const updatedWrapper = container.querySelector(".formosaic-field-animate");
    expect(updatedWrapper).toBeTruthy();
    expect(updatedWrapper).toHaveAttribute("data-exiting");
  });

  it("unmounts field after fallback timeout (350ms) when transitionend does not fire", async () => {
    const { rerender, container } = render(
      <TestWrapper>
        <RenderField {...defaultProps} hidden={false} />
      </TestWrapper>
    );

    expect(container.querySelector(".formosaic-field-animate")).toBeTruthy();

    // Start exit by setting hidden=true
    await act(async () => {
      rerender(
        <TestWrapper>
          <RenderField {...defaultProps} hidden={true} />
        </TestWrapper>
      );
    });

    // data-exiting should be set; field not yet unmounted
    expect(container.querySelector(".formosaic-field-animate")).toBeTruthy();

    // Advance past the 300ms fallback + some buffer
    await act(async () => {
      vi.advanceTimersByTime(350);
    });

    // After fallback fires, field should be gone
    expect(container.querySelector(".formosaic-field-animate")).toBeFalsy();
  });

  it("does not have data-first-render attribute after the initial render cycle settles", async () => {
    // data-first-render is set on the very first synchronous render of the component
    // (when isFirstRender.current === true). Once effects have run and any subsequent
    // state-driven re-renders occur, isFirstRender.current is false and the attribute
    // is absent. This test confirms the attribute is absent after the render settles.
    vi.useRealTimers();

    let container!: HTMLElement;
    await act(async () => {
      ({ container } = render(
        <TestWrapper>
          <RenderField {...defaultProps} hidden={false} />
        </TestWrapper>
      ));
    });

    const wrapper = container.querySelector(".formosaic-field-animate");
    expect(wrapper).toBeTruthy();
    // After effects run and re-renders settle, isFirstRender.current is false
    // so data-first-render is no longer present.
    expect(wrapper).not.toHaveAttribute("data-first-render");

    vi.useFakeTimers();
  });

  it("does not render when hidden is true on initial mount", () => {
    const { container } = render(
      <TestWrapper>
        <RenderField {...defaultProps} hidden={true} />
      </TestWrapper>
    );

    expect(container.querySelector(".formosaic-field-animate")).toBeFalsy();
  });

  it("handles rapid toggle (hide then show before exit completes) without getting stuck", async () => {
    const { rerender, container } = render(
      <TestWrapper>
        <RenderField {...defaultProps} hidden={false} />
      </TestWrapper>
    );

    // Start exiting
    await act(async () => {
      rerender(
        <TestWrapper>
          <RenderField {...defaultProps} hidden={true} />
        </TestWrapper>
      );
    });

    const wrapperAfterHide = container.querySelector(".formosaic-field-animate");
    expect(wrapperAfterHide).toBeTruthy();
    expect(wrapperAfterHide).toHaveAttribute("data-exiting");

    // Rapidly un-hide before fallback fires
    await act(async () => {
      rerender(
        <TestWrapper>
          <RenderField {...defaultProps} hidden={false} />
        </TestWrapper>
      );
    });

    // Field should still be rendered and no longer exiting
    const wrapperAfterShow = container.querySelector(".formosaic-field-animate");
    expect(wrapperAfterShow).toBeTruthy();
    expect(wrapperAfterShow).not.toHaveAttribute("data-exiting");

    // Advance well past the original fallback timeout — field should NOT unmount
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(container.querySelector(".formosaic-field-animate")).toBeTruthy();
  });
});

// ─── 2. softHidden does not trigger animation ─────────────────────────────────

describe("softHidden does not trigger animation", () => {
  it("does not set data-exiting when softHidden changes", async () => {
    const { rerender, container } = render(
      <TestWrapper>
        <RenderField {...defaultProps} softHidden={false} />
      </TestWrapper>
    );

    expect(container.querySelector(".formosaic-field-animate")).toBeTruthy();

    await act(async () => {
      rerender(
        <TestWrapper>
          <RenderField {...defaultProps} softHidden={true} />
        </TestWrapper>
      );
    });

    // Animation wrapper should still be present
    const wrapper = container.querySelector(".formosaic-field-animate");
    expect(wrapper).toBeTruthy();
    // No exit animation
    expect(wrapper).not.toHaveAttribute("data-exiting");
  });

  it("animation wrapper still present but field input is not rendered when softHidden is true", async () => {
    const { container } = render(
      <TestWrapper>
        <RenderField {...defaultProps} softHidden={true} />
      </TestWrapper>
    );

    // The outer wrapper div must exist (no unmount for softHidden)
    const wrapper = container.querySelector(".formosaic-field-animate");
    expect(wrapper).toBeTruthy();

    // The actual input should not be present because softHidden suppresses the FieldWrapper content
    const input = container.querySelector(`input[data-testid="field-testField"]`);
    expect(input).toBeFalsy();
  });
});

// ─── 3. Change detection animations ──────────────────────────────────────────

describe("Change detection animations", () => {
  const optionsA: IOption[] = [
    { value: "a", label: "Option A" },
    { value: "b", label: "Option B" },
  ];

  const optionsB: IOption[] = [
    { value: "x", label: "Option X" },
    { value: "y", label: "Option Y" },
  ];

  it("sets data-options-changed when options change", async () => {
    const { rerender, container } = render(
      <TestWrapper>
        <RenderField {...defaultProps} options={optionsA} />
      </TestWrapper>
    );

    // On initial render, no data-options-changed
    const containerEl = container.querySelector(".formosaic-field-container");
    expect(containerEl).toBeTruthy();
    expect(containerEl).not.toHaveAttribute("data-options-changed");

    // Change options
    await act(async () => {
      rerender(
        <TestWrapper>
          <RenderField {...defaultProps} options={optionsB} />
        </TestWrapper>
      );
    });

    const updatedContainer = container.querySelector(".formosaic-field-container");
    expect(updatedContainer).toHaveAttribute("data-options-changed");
  });

  it("sets data-readonly-entering when readOnly changes", async () => {
    const { rerender, container } = render(
      <TestWrapper>
        <RenderField {...defaultProps} readOnly={false} />
      </TestWrapper>
    );

    const containerEl = container.querySelector(".formosaic-field-container");
    expect(containerEl).toBeTruthy();
    expect(containerEl).not.toHaveAttribute("data-readonly-entering");

    await act(async () => {
      rerender(
        <TestWrapper>
          <RenderField {...defaultProps} readOnly={true} />
        </TestWrapper>
      );
    });

    const updatedContainer = container.querySelector(".formosaic-field-container");
    expect(updatedContainer).toHaveAttribute("data-readonly-entering");
  });

  it("sets data-label-changing when label changes", async () => {
    const { rerender, container } = render(
      <TestWrapper>
        <RenderField {...defaultProps} label="Original Label" />
      </TestWrapper>
    );

    // On initial render, no data-label-changing
    const containerEl = container.querySelector(".formosaic-field-container");
    expect(containerEl).toBeTruthy();
    expect(containerEl).not.toHaveAttribute("data-label-changing");

    // Change label
    await act(async () => {
      rerender(
        <TestWrapper>
          <RenderField {...defaultProps} label="New Label" />
        </TestWrapper>
      );
    });

    const updatedContainer = container.querySelector(".formosaic-field-container");
    expect(updatedContainer).toHaveAttribute("data-label-changing");
  });
});

// ─── 4. FieldWrapper animation classes ───────────────────────────────────────

describe("FieldWrapper animation classes", () => {
  it("required indicator has formosaic-required-indicator class", () => {
    const { container } = render(
      <FieldWrapper id="testField" label="Test Label" required={true}>
        <input data-testid="child-input" />
      </FieldWrapper>
    );

    const indicator = container.querySelector(".formosaic-required-indicator");
    expect(indicator).toBeTruthy();
    expect(indicator).toHaveTextContent("*");
  });

  it("error message container has formosaic-error-animate class", () => {
    const { container } = render(
      <FieldWrapper id="testField" label="Test Label">
        <input data-testid="child-input" />
      </FieldWrapper>
    );

    const errorContainer = container.querySelector(".formosaic-error-animate");
    expect(errorContainer).toBeTruthy();
  });

  it("formosaic-error-animate container is present even without an error", () => {
    const { container } = render(
      <FieldWrapper id="testField" label="No Error">
        <input data-testid="child-input" />
      </FieldWrapper>
    );

    // The .message.formosaic-error-animate div is always rendered
    const messageDiv = container.querySelector(".message.formosaic-error-animate");
    expect(messageDiv).toBeTruthy();
  });

  it("sets data-error-entering when error appears on already-visible field", async () => {
    const { rerender, container } = render(
      <FieldWrapper id="testField" label="Test">
        <input data-testid="child-input" />
      </FieldWrapper>
    );

    // No error initially — no data-error-entering
    const messageDiv = container.querySelector(".formosaic-error-animate");
    expect(messageDiv).toBeTruthy();
    expect(messageDiv).not.toHaveAttribute("data-error-entering");

    // Error appears
    await act(async () => {
      rerender(
        <FieldWrapper id="testField" label="Test" error={{ type: "required", message: "Required" }}>
          <input data-testid="child-input" />
        </FieldWrapper>
      );
    });

    const updatedDiv = container.querySelector(".formosaic-error-animate");
    expect(updatedDiv).toHaveAttribute("data-error-entering");
  });

  it("does not set data-error-entering on initial render with error", () => {
    const { container } = render(
      <FieldWrapper id="testField" label="Test" error={{ type: "required", message: "Required" }}>
        <input data-testid="child-input" />
      </FieldWrapper>
    );

    const messageDiv = container.querySelector(".formosaic-error-animate");
    expect(messageDiv).toBeTruthy();
    expect(messageDiv).not.toHaveAttribute("data-error-entering");
  });

  it("formosaic-error-animate is also present when an error is shown", () => {
    const { container } = render(
      <FieldWrapper
        id="testField"
        label="With Error"
        error={{ type: "required", message: "Required field" }}
      >
        <input data-testid="child-input" />
      </FieldWrapper>
    );

    const errorContainer = container.querySelector(".formosaic-error-animate");
    expect(errorContainer).toBeTruthy();
    expect(errorContainer).toHaveTextContent("Required field");
  });
});

// ─── 5. Formosaic animations setting ─────────────────────────────────────────

describe("Formosaic animations setting", () => {
  const minimalConfig = {
    version: 2 as const,
    fields: { name: { type: "Textbox", label: "Name" } },
  };

  const renderWithProviders = (formConfig: typeof minimalConfig & { settings?: { animations?: boolean } }) => {
    return render(
      <RulesEngineProvider>
        <InjectedFieldProvider>
          <Formosaic
            configName="test"
            formConfig={formConfig}
            defaultValues={{}}
          />
        </InjectedFieldProvider>
      </RulesEngineProvider>
    );
  };

  it("sets data-formosaic-no-animations when settings.animations is false", () => {
    const { container } = renderWithProviders({
      ...minimalConfig,
      settings: { animations: false },
    });

    const wrapper = container.querySelector(".formosaic-form-wrapper");
    expect(wrapper).toBeTruthy();
    expect(wrapper).toHaveAttribute("data-formosaic-no-animations");
  });

  it("does not set data-formosaic-no-animations when settings.animations is undefined (default)", () => {
    const { container } = renderWithProviders(minimalConfig);

    const wrapper = container.querySelector(".formosaic-form-wrapper");
    expect(wrapper).toBeTruthy();
    expect(wrapper).not.toHaveAttribute("data-formosaic-no-animations");
  });

  it("does not set data-formosaic-no-animations when settings.animations is true", () => {
    const { container } = renderWithProviders({
      ...minimalConfig,
      settings: { animations: true },
    });

    const wrapper = container.querySelector(".formosaic-form-wrapper");
    expect(wrapper).toBeTruthy();
    expect(wrapper).not.toHaveAttribute("data-formosaic-no-animations");
  });
});
