/**
 * Regression tests for render-phase analytics side effects in RenderField
 * (audit 2026-06 finding 14 / Top Risk #2).
 *
 * Before the fix, trackValidationError fired on EVERY render while an error
 * was present, and trackFieldChange + the previousValue ref mutation ran
 * inside the Controller render prop — double-firing under StrictMode and
 * violating render purity. Tracking now lives in effects inside
 * FieldAnalyticsTracker, keyed on value / error-message transitions.
 *
 * All tests render under <React.StrictMode> deliberately: StrictMode
 * double-invokes renders and mount effects in dev, which is exactly the
 * condition that exposed the original bug.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, act } from "@testing-library/react";
import React from "react";
import { FormProvider, useForm, UseFormReturn } from "react-hook-form";
import RenderField from "../../components/RenderField";
import { InjectedFieldProvider } from "../../providers/InjectedFieldProvider";
import { useFormAnalytics } from "../../hooks/useFormAnalytics";
import { IAnalyticsCallbacks } from "../../types/IAnalyticsCallbacks";

const TestField = (props: { value?: unknown }) => (
  <input readOnly value={props.value == null ? "" : String(props.value)} data-testid="test-field" />
);

interface IHarnessProps {
  callbacks: IAnalyticsCallbacks;
  required?: boolean;
  onMethods: (methods: UseFormReturn<Record<string, unknown>>) => void;
}

const Harness = ({ callbacks, required, onMethods }: IHarnessProps) => {
  const methods = useForm<Record<string, unknown>>({
    defaultValues: { qty: 1 },
    mode: "onChange",
  });
  const analytics = useFormAnalytics(callbacks);
  onMethods(methods);
  return (
    <FormProvider {...methods}>
      <InjectedFieldProvider injectedFields={{ Textbox: <TestField /> }}>
        <RenderField
          fieldName="qty"
          type="Textbox"
          required={required}
          setFieldValue={vi.fn()}
          analytics={analytics}
        />
      </InjectedFieldProvider>
    </FormProvider>
  );
};

describe("RenderField analytics effects (StrictMode)", () => {
  let callbacks: {
    onFieldChange: ReturnType<typeof vi.fn<NonNullable<IAnalyticsCallbacks["onFieldChange"]>>>;
    onValidationError: ReturnType<typeof vi.fn<NonNullable<IAnalyticsCallbacks["onValidationError"]>>>;
  };
  let methods: UseFormReturn<Record<string, unknown>>;

  beforeEach(() => {
    callbacks = {
      onFieldChange: vi.fn<NonNullable<IAnalyticsCallbacks["onFieldChange"]>>(),
      onValidationError: vi.fn<NonNullable<IAnalyticsCallbacks["onValidationError"]>>(),
    };
  });

  const renderHarness = (required?: boolean) =>
    render(
      <React.StrictMode>
        <Harness callbacks={callbacks} required={required} onMethods={(m) => { methods = m; }} />
      </React.StrictMode>
    );

  it("does not fire onFieldChange on mount", () => {
    renderHarness();
    expect(callbacks.onFieldChange).not.toHaveBeenCalled();
  });

  it("fires onFieldChange exactly once per actual value change", async () => {
    renderHarness();
    await act(async () => {
      methods.setValue("qty", 2);
    });
    expect(callbacks.onFieldChange).toHaveBeenCalledTimes(1);
    expect(callbacks.onFieldChange).toHaveBeenCalledWith("qty", 1, 2);

    await act(async () => {
      methods.setValue("qty", 3);
    });
    expect(callbacks.onFieldChange).toHaveBeenCalledTimes(2);
    expect(callbacks.onFieldChange).toHaveBeenLastCalledWith("qty", 2, 3);
  });

  it("does not fire onFieldChange when re-rendered with an unchanged value", async () => {
    const { rerender } = renderHarness();
    await act(async () => {
      methods.setValue("qty", 2);
    });
    expect(callbacks.onFieldChange).toHaveBeenCalledTimes(1);

    rerender(
      <React.StrictMode>
        <Harness callbacks={callbacks} onMethods={(m) => { methods = m; }} />
      </React.StrictMode>
    );
    expect(callbacks.onFieldChange).toHaveBeenCalledTimes(1);
  });

  it("fires onValidationError once per error transition, not once per render", async () => {
    const { rerender } = renderHarness(true);
    await act(async () => {
      methods.setValue("qty", "", { shouldValidate: true });
    });
    expect(callbacks.onValidationError).toHaveBeenCalledTimes(1);

    // Extra renders while the same error persists must not re-fire tracking.
    for (let i = 0; i < 3; i++) {
      rerender(
        <React.StrictMode>
          <Harness callbacks={callbacks} required onMethods={(m) => { methods = m; }} />
        </React.StrictMode>
      );
    }
    expect(callbacks.onValidationError).toHaveBeenCalledTimes(1);
  });

  it("does not fire onValidationError when the field is valid", async () => {
    renderHarness(true);
    await act(async () => {
      methods.setValue("qty", 5, { shouldValidate: true });
    });
    expect(callbacks.onValidationError).not.toHaveBeenCalled();
  });
});
