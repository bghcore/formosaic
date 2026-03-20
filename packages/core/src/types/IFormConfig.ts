import { IFieldConfig } from "./IFieldConfig";
import { IWizardConfig } from "./IWizardConfig";
import { IAnalyticsCallbacks } from "./IAnalyticsCallbacks";
import { ITemplateFieldRef, IFormTemplate } from "./IFormTemplate";

/**
 * Top-level form configuration (v2 schema).
 *
 * Wraps all field definitions, ordering, wizard config, and form-level settings
 * into a single versioned object. This replaces the loose Dictionary<IFieldConfig> pattern.
 */
export interface IFormConfig {
  /** Schema version. Must be 2. */
  version: 2;
  /** Field definitions keyed by field name. */
  fields: Record<string, IFieldConfig | ITemplateFieldRef>;
  /** Default field display order. If omitted, uses Object.keys(fields) order. */
  fieldOrder?: string[];
  /** Inline template definitions. Merged with global registry during resolution. */
  templates?: Record<string, IFormTemplate>;
  /** Static lookup tables for template expression interpolation. */
  lookups?: Record<string, unknown>;
  /** Multi-step wizard configuration. */
  wizard?: IWizardConfig;
  /** Form-level settings. */
  settings?: IFormSettings;
}

/** Form-level settings */
export interface IFormSettings {
  /** Whether the form is in manual save mode (no auto-save on field change). */
  manualSave?: boolean;
  /** Timeout in ms for each save attempt. */
  saveTimeoutMs?: number;
  /** Maximum save retry attempts. */
  maxSaveRetries?: number;
  /** Number of visible fields before collapse. */
  expandCutoffCount?: number;
  /** Max height in px when collapsed. */
  collapsedMaxHeight?: number;
  /** Enable field filter/search input. */
  enableFilter?: boolean;
  /** Analytics/telemetry callbacks for form lifecycle events. */
  analytics?: IAnalyticsCallbacks;
  /** Enable/disable field animations on rule state changes. Default: true. */
  animations?: boolean;
}
