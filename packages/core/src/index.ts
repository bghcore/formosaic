// Types
export * from "./types";

// Utils
export * from "./utils";

// Constants
export { ComponentTypes, FormConstants, FIELD_PARENT_PREFIX } from "./constants";

// Strings
export { FormStrings } from "./strings";

// Providers
export {
  RulesEngineProvider,
  UseRulesEngineContext,
} from "./providers/RulesEngineProvider";
export {
  InjectedFieldProvider,
  UseInjectedFieldContext,
} from "./providers/InjectedFieldProvider";
export type { IRulesEngineProvider } from "./providers/IRulesEngineProvider";
export type { IInjectedFieldProvider } from "./providers/IInjectedFieldProvider";

// Rule Engine
export {
  evaluateAllRules,
  evaluateAffectedFields,
  buildDependencyGraph,
  buildDefaultFieldStates,
  topologicalSort,
} from "./helpers/RuleEngine";

// Condition Evaluator
export {
  evaluateCondition,
  extractConditionDependencies,
} from "./helpers/ConditionEvaluator";

// Helpers
export {
  IsExpandVisible,
  GetConfirmInputModalProps,
  GetComputedValuesOnDirtyFields,
  GetComputedValuesOnCreate,
  ExecuteComputedValue,
  CheckFieldValidationRules,
  CheckAsyncFieldValidationRules,
  CheckValidDropdownOptions,
  CheckDefaultValues,
  InitOnCreateFormState,
  InitOnEditFormState,
  ShowField,
  GetFieldsToRender,
  SortOptions,
} from "./helpers/InlineFormHelper";

export { SortOptions as SortDropdownOptions } from "./helpers/FieldHelper";

export {
  detectDependencyCycles,
  detectSelfDependencies,
  validateDependencyGraph,
} from "./helpers/DependencyGraphValidator";
export type { ICycleError } from "./helpers/DependencyGraphValidator";

export {
  registerValidators,
  getValidator,
  getValidatorRegistry,
  resetValidatorRegistry,
  runValidations,
  runSyncValidations,
  createMinLengthRule,
  createMaxLengthRule,
  createNumericRangeRule,
  createPatternRule,
  createRequiredIfRule,
  registerValidatorMetadata,
  getValidatorMetadata,
  getAllValidatorMetadata,
  resetValidatorMetadataRegistry,
} from "./helpers/ValidationRegistry";
export type { ValidatorFn, IValidationContext, IValidatorMetadata } from "./helpers/ValidationRegistry";

export {
  registerValueFunctions,
  getValueFunction,
  executeValueFunction,
  resetValueFunctionRegistry,
} from "./helpers/ValueFunctionRegistry";
export type { ValueFunction, IValueFunctionContext } from "./helpers/ValueFunctionRegistry";

export { validateFieldConfigs } from "./helpers/ConfigValidator";
export type { IConfigValidationError } from "./helpers/ConfigValidator";

// Locale
export {
  registerLocale,
  getLocaleString,
  resetLocale,
  getCurrentLocale,
} from "./helpers/LocaleRegistry";

// Wizard
export { WizardForm } from "./components/WizardForm";
export type { IWizardNavigationProps, IWizardStepHeaderProps, IWizardFormProps } from "./components/WizardForm";
export { getVisibleSteps, getStepFields, getStepFieldOrder, validateStepFields, isStepValid, getStepIndex } from "./helpers/WizardHelper";

// Field Array
export { FieldArray } from "./components/FieldArray";
export type { IFieldArrayProps } from "./components/FieldArray";

// Components
export { Formosaic } from "./components/InlineForm";
export { FormFields } from "./components/InlineFormFields";
export { FieldWrapper } from "./components/FieldWrapper";
export { default as RenderField } from "./components/RenderField";
export { default as ConfirmInputsModal } from "./components/ConfirmInputsModal";
export { FormErrorBoundary } from "./components/FormErrorBoundary";

// DevTools
export { FormDevTools } from "./components/FormDevTools";
export type { IFormDevToolsProps } from "./components/FormDevTools";

// RJSF Schema Import/Export
export { fromRjsfSchema, toRjsfSchema } from "./utils/rjsf";
export type { IJsonSchemaNode, IRjsfUiSchema, IRjsfConvertOptions } from "./utils/rjsf";

// Zod Schema Import
export { zodSchemaToFieldConfig } from "./utils/zodSchemaImport";

// Lazy Field Registry
export { createLazyFieldRegistry } from "./utils/lazyFieldRegistry";

// Hooks
export { useDraftPersistence } from "./hooks/useDraftPersistence";
export type { IDraftPersistenceOptions, IDraftState, IUseDraftPersistenceResult } from "./hooks/useDraftPersistence";
export { useBeforeUnload } from "./hooks/useBeforeUnload";
export { useFormAnalytics } from "./hooks/useFormAnalytics";
export type { IFormAnalytics } from "./hooks/useFormAnalytics";

// Form State Serialization
export { serializeFormState, deserializeFormState } from "./utils/formStateSerialization";

// Field Utilities (shared across adapter packages)
export {
  GetFieldDataTestId,
  FieldClassName,
  getFieldState,
  formatDateTime,
  formatDateTimeValue,
  formatDateRange,
  getFileNames,
  extractDigits,
  formatPhone,
  ellipsifyText,
  MAX_FILE_SIZE_MB_DEFAULT,
  DocumentLinksStrings,
} from "./helpers/FieldUtils";

// Expression Engine
export { evaluateExpression, extractExpressionDependencies, extractFunctionDependencies } from "./helpers/ExpressionEngine";

// Rule Tracing / Debugging
export {
  enableRuleTracing,
  disableRuleTracing,
  traceRuleEvent,
  getRuleTraceLog,
  clearRuleTraceLog,
  isRuleTracingEnabled,
} from "./helpers/RuleTracer";
export type { IRuleTraceEvent } from "./helpers/RuleTracer";

// Render Tracking
export {
  trackRender,
  flushRenderCycle,
  getRenderCounts,
  getLastRenderedFields,
  getTotalFormRenders,
  resetRenderTracker,
} from "./helpers/RenderTracker";

// Event Timeline
export {
  logEvent,
  getTimeline,
  clearTimeline,
} from "./helpers/EventTimeline";
export type { ITimelineEvent, TimelineEventType } from "./helpers/EventTimeline";
