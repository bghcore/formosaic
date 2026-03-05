import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFormAnalytics } from "../../hooks/useFormAnalytics";
import { IAnalyticsCallbacks } from "../../types/IAnalyticsCallbacks";

describe("useFormAnalytics", () => {
  let callbacks: Required<IAnalyticsCallbacks>;

  beforeEach(() => {
    callbacks = {
      onFieldFocus: vi.fn(),
      onFieldBlur: vi.fn(),
      onFieldChange: vi.fn(),
      onValidationError: vi.fn(),
      onFormSubmit: vi.fn(),
      onFormAbandonment: vi.fn(),
      onWizardStepChange: vi.fn(),
      onRuleTriggered: vi.fn(),
    };
  });

  describe("trackFieldFocus", () => {
    it("calls onFieldFocus with field name", () => {
      const { result } = renderHook(() => useFormAnalytics(callbacks));
      act(() => result.current.trackFieldFocus("email"));
      expect(callbacks.onFieldFocus).toHaveBeenCalledWith("email");
    });

    it("does not throw when callback is not provided", () => {
      const { result } = renderHook(() => useFormAnalytics({}));
      expect(() => act(() => result.current.trackFieldFocus("email"))).not.toThrow();
    });

    it("does not throw when no callbacks object provided", () => {
      const { result } = renderHook(() => useFormAnalytics(undefined));
      expect(() => act(() => result.current.trackFieldFocus("email"))).not.toThrow();
    });
  });

  describe("trackFieldBlur", () => {
    it("calls onFieldBlur with field name and time spent", () => {
      const { result } = renderHook(() => useFormAnalytics(callbacks));
      act(() => result.current.trackFieldFocus("email"));

      // Simulate some time passing
      vi.spyOn(Date, "now").mockReturnValueOnce(Date.now() + 500);
      act(() => result.current.trackFieldBlur("email"));

      expect(callbacks.onFieldBlur).toHaveBeenCalledWith("email", expect.any(Number));
      const timeSpent = (callbacks.onFieldBlur as ReturnType<typeof vi.fn>).mock.calls[0][1];
      expect(timeSpent).toBeGreaterThanOrEqual(0);
    });

    it("returns 0 for time spent if focus was not tracked", () => {
      const { result } = renderHook(() => useFormAnalytics(callbacks));
      act(() => result.current.trackFieldBlur("email"));
      expect(callbacks.onFieldBlur).toHaveBeenCalledWith("email", 0);
    });

    it("does not throw when callback is not provided", () => {
      const { result } = renderHook(() => useFormAnalytics({}));
      expect(() => act(() => result.current.trackFieldBlur("email"))).not.toThrow();
    });
  });

  describe("trackFieldChange", () => {
    it("calls onFieldChange with field name, old value, and new value", () => {
      const { result } = renderHook(() => useFormAnalytics(callbacks));
      act(() => result.current.trackFieldChange("status", "draft", "published"));
      expect(callbacks.onFieldChange).toHaveBeenCalledWith("status", "draft", "published");
    });

    it("does not throw when callback is not provided", () => {
      const { result } = renderHook(() => useFormAnalytics({}));
      expect(() => act(() => result.current.trackFieldChange("status", "a", "b"))).not.toThrow();
    });
  });

  describe("trackValidationError", () => {
    it("calls onValidationError with field name and errors", () => {
      const { result } = renderHook(() => useFormAnalytics(callbacks));
      act(() => result.current.trackValidationError("email", ["Required", "Invalid format"]));
      expect(callbacks.onValidationError).toHaveBeenCalledWith("email", ["Required", "Invalid format"]);
    });

    it("does not throw when callback is not provided", () => {
      const { result } = renderHook(() => useFormAnalytics({}));
      expect(() => act(() => result.current.trackValidationError("email", ["err"]))).not.toThrow();
    });
  });

  describe("trackFormSubmit", () => {
    it("calls onFormSubmit with values and duration", () => {
      const { result } = renderHook(() => useFormAnalytics(callbacks));
      act(() => result.current.trackFormSubmit({ name: "test" }));
      expect(callbacks.onFormSubmit).toHaveBeenCalledWith(
        { name: "test" },
        expect.any(Number),
      );
      const durationMs = (callbacks.onFormSubmit as ReturnType<typeof vi.fn>).mock.calls[0][1];
      expect(durationMs).toBeGreaterThanOrEqual(0);
    });

    it("does not throw when callback is not provided", () => {
      const { result } = renderHook(() => useFormAnalytics({}));
      expect(() => act(() => result.current.trackFormSubmit({}))).not.toThrow();
    });
  });

  describe("trackFormAbandonment", () => {
    it("calls onFormAbandonment with filled and empty required fields", () => {
      const { result } = renderHook(() => useFormAnalytics(callbacks));
      act(() => result.current.trackFormAbandonment(["name"], ["email", "phone"]));
      expect(callbacks.onFormAbandonment).toHaveBeenCalledWith(["name"], ["email", "phone"]);
    });

    it("does not throw when callback is not provided", () => {
      const { result } = renderHook(() => useFormAnalytics({}));
      expect(() => act(() => result.current.trackFormAbandonment([], []))).not.toThrow();
    });
  });

  describe("trackWizardStepChange", () => {
    it("calls onWizardStepChange with from and to step", () => {
      const { result } = renderHook(() => useFormAnalytics(callbacks));
      act(() => result.current.trackWizardStepChange(0, 1));
      expect(callbacks.onWizardStepChange).toHaveBeenCalledWith(0, 1);
    });

    it("does not throw when callback is not provided", () => {
      const { result } = renderHook(() => useFormAnalytics({}));
      expect(() => act(() => result.current.trackWizardStepChange(0, 1))).not.toThrow();
    });
  });

  describe("trackRuleTriggered", () => {
    it("calls onRuleTriggered with event object", () => {
      const { result } = renderHook(() => useFormAnalytics(callbacks));
      const event = { fieldName: "status", ruleIndex: 0, conditionMet: true };
      act(() => result.current.trackRuleTriggered(event));
      expect(callbacks.onRuleTriggered).toHaveBeenCalledWith(event);
    });

    it("does not throw when callback is not provided", () => {
      const { result } = renderHook(() => useFormAnalytics({}));
      expect(() => act(() => result.current.trackRuleTriggered({ fieldName: "x", ruleIndex: 0, conditionMet: false }))).not.toThrow();
    });
  });

  describe("formStartTime", () => {
    it("records a start time on hook creation", () => {
      const before = Date.now();
      const { result } = renderHook(() => useFormAnalytics(callbacks));
      const after = Date.now();
      expect(result.current.formStartTime).toBeGreaterThanOrEqual(before);
      expect(result.current.formStartTime).toBeLessThanOrEqual(after);
    });

    it("preserves start time across re-renders", () => {
      const { result, rerender } = renderHook(() => useFormAnalytics(callbacks));
      const initialTime = result.current.formStartTime;
      rerender();
      expect(result.current.formStartTime).toBe(initialTime);
    });
  });

  describe("memoization", () => {
    it("returns a stable reference across re-renders", () => {
      const { result, rerender } = renderHook(() => useFormAnalytics(callbacks));
      const first = result.current;
      rerender();
      expect(result.current).toBe(first);
    });
  });

  describe("callback ref updates", () => {
    it("uses the latest callback when invoked after re-render", () => {
      const firstOnFocus = vi.fn();
      const secondOnFocus = vi.fn();

      const { result, rerender } = renderHook(
        ({ cb }) => useFormAnalytics(cb),
        { initialProps: { cb: { onFieldFocus: firstOnFocus } as IAnalyticsCallbacks } },
      );

      rerender({ cb: { onFieldFocus: secondOnFocus } as IAnalyticsCallbacks });
      act(() => result.current.trackFieldFocus("name"));

      expect(firstOnFocus).not.toHaveBeenCalled();
      expect(secondOnFocus).toHaveBeenCalledWith("name");
    });
  });
});
