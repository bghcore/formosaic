import { IOption } from "./IOption";
import { IValidationRule } from "./IValidationRule";

/**
 * Runtime state for a single field after all rules have been evaluated.
 * Consumed by form components to determine rendering behavior.
 */
export interface IRuntimeFieldState {
  /** UI component type to render. May be swapped by rules. */
  type?: string;
  /** Whether the field is required for form submission. */
  required?: boolean;
  /** Whether the field is hidden (not rendered). Hidden fields skip validation. */
  hidden?: boolean;
  /** Whether the field is read-only (rendered but not editable). */
  readOnly?: boolean;
  /** Current validation rules (may be modified by rules). */
  validate?: IValidationRule[];
  /** Computed value expression (may be set by rules). */
  computedValue?: string;
  /** Whether changing this field triggers a confirmation modal. */
  confirmInput?: boolean;
  /** Available options for dropdown-type fields (may be filtered by rules). */
  options?: IOption[];
  /** True while async loadOptions is in-flight. Passed through to field adapters via IFieldProps. */
  optionsLoading?: boolean;
  /** Override field label (may be set by rules). */
  label?: string;
  /** Default value to set when the field value is null and the field is visible. */
  defaultValue?: unknown;
  /** If true, computedValue only runs during create. */
  computeOnCreateOnly?: boolean;
  /** Fields that this field's rules affect (forward dependencies). */
  dependentFields?: string[];
  /** Fields whose values affect this field (reverse dependencies). */
  dependsOnFields?: string[];
  /** The source rules that produced this state (for tracing/debugging). */
  activeRuleIds?: string[];
  /**
   * A pending value to set on the field, produced by a rule with setValue effect.
   * The form component reads this and calls RHF setValue. Undefined if no rule set a value.
   */
  pendingSetValue?: { value: unknown };
}

/**
 * Runtime state for the entire form.
 */
export interface IRuntimeFormState {
  /** Per-field runtime state keyed by field name. */
  fieldStates: Record<string, IRuntimeFieldState>;
  /** Current field display order. */
  fieldOrder: string[];
}

/**
 * State stored in the rules engine provider (keyed by config name).
 */
export interface IRulesEngineState {
  configs: Record<string, IRuntimeFormState>;
}
