import { useRef, useMemo } from "react";
import { IAnalyticsCallbacks } from "../types/IAnalyticsCallbacks";

/**
 * Stable wrapper functions for analytics callbacks.
 * Each function is a no-op when the corresponding callback is not provided.
 */
export interface IFormAnalytics {
  trackFieldFocus: (fieldName: string) => void;
  trackFieldBlur: (fieldName: string) => void;
  trackFieldChange: (fieldName: string, oldValue: unknown, newValue: unknown) => void;
  trackValidationError: (fieldName: string, errors: string[]) => void;
  trackFormSubmit: (values: Record<string, unknown>) => void;
  trackFormAbandonment: (filledFields: string[], emptyRequiredFields: string[]) => void;
  trackWizardStepChange: (fromStep: number, toStep: number) => void;
  trackRuleTriggered: (event: { fieldName: string; ruleIndex: number; conditionMet: boolean }) => void;
  /** Timestamp (ms) when the hook was first created -- used for form duration. */
  formStartTime: number;
}

/**
 * Hook that wraps IAnalyticsCallbacks into safe, memoized wrapper functions.
 * Tracks form start time for duration calculations and per-field focus times.
 */
export function useFormAnalytics(callbacks?: IAnalyticsCallbacks): IFormAnalytics {
  const formStartTime = useRef(Date.now()).current;
  const focusTimes = useRef<Record<string, number>>({});
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  return useMemo<IFormAnalytics>(() => ({
    formStartTime,

    trackFieldFocus(fieldName: string) {
      focusTimes.current[fieldName] = Date.now();
      callbacksRef.current?.onFieldFocus?.(fieldName);
    },

    trackFieldBlur(fieldName: string) {
      const start = focusTimes.current[fieldName];
      const timeSpentMs = start ? Date.now() - start : 0;
      delete focusTimes.current[fieldName];
      callbacksRef.current?.onFieldBlur?.(fieldName, timeSpentMs);
    },

    trackFieldChange(fieldName: string, oldValue: unknown, newValue: unknown) {
      callbacksRef.current?.onFieldChange?.(fieldName, oldValue, newValue);
    },

    trackValidationError(fieldName: string, errors: string[]) {
      callbacksRef.current?.onValidationError?.(fieldName, errors);
    },

    trackFormSubmit(values: Record<string, unknown>) {
      const durationMs = Date.now() - formStartTime;
      callbacksRef.current?.onFormSubmit?.(values, durationMs);
    },

    trackFormAbandonment(filledFields: string[], emptyRequiredFields: string[]) {
      callbacksRef.current?.onFormAbandonment?.(filledFields, emptyRequiredFields);
    },

    trackWizardStepChange(fromStep: number, toStep: number) {
      callbacksRef.current?.onWizardStepChange?.(fromStep, toStep);
    },

    trackRuleTriggered(event: { fieldName: string; ruleIndex: number; conditionMet: boolean }) {
      callbacksRef.current?.onRuleTriggered?.(event);
    },
  }), [formStartTime]);
}
