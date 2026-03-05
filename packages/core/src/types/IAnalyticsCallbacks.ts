/**
 * Analytics/telemetry callback hooks for form lifecycle events.
 *
 * All callbacks are optional -- if not provided, the corresponding events are silently ignored.
 */
export interface IAnalyticsCallbacks {
  /** Fired when a field receives focus. */
  onFieldFocus?: (fieldName: string) => void;
  /** Fired when a field loses focus. `timeSpentMs` is the duration since the matching onFieldFocus. */
  onFieldBlur?: (fieldName: string, timeSpentMs: number) => void;
  /** Fired when a field value changes. */
  onFieldChange?: (fieldName: string, oldValue: unknown, newValue: unknown) => void;
  /** Fired when field validation fails. */
  onValidationError?: (fieldName: string, errors: string[]) => void;
  /** Fired on successful form submission. `durationMs` is elapsed time since form mount. */
  onFormSubmit?: (values: Record<string, unknown>, durationMs: number) => void;
  /** Fired when the user navigates away with unsaved changes. */
  onFormAbandonment?: (filledFields: string[], emptyRequiredFields: string[]) => void;
  /** Fired when the wizard step changes. */
  onWizardStepChange?: (fromStep: number, toStep: number) => void;
  /** Fired when a rule is evaluated. */
  onRuleTriggered?: (event: { fieldName: string; ruleIndex: number; conditionMet: boolean }) => void;
}
