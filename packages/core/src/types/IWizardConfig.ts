import { ICondition } from "./ICondition";

/** Configuration for a single wizard step */
export interface IWizardStep {
  /** Unique step identifier */
  id: string;
  /** Step title displayed to the user */
  title: string;
  /** Optional step description */
  description?: string;
  /** Field names included in this step */
  fields?: string[];
  /** Fragment prefixes included in this step (expanded during resolution). */
  fragments?: string[];
  /** How fragment sub-wizards render: "inline" flattens steps, "nested" keeps internal nav. */
  fragmentWizardMode?: "inline" | "nested";
  /** Condition under which this step is visible (uses v2 condition system) */
  visibleWhen?: ICondition;
}

/** Wizard configuration */
export interface IWizardConfig {
  /** Step definitions */
  steps: IWizardStep[];
  /** If true, users must complete steps in order (no skipping ahead) */
  linearNavigation?: boolean;
  /** If true, validate the current step before allowing navigation */
  validateOnStepChange?: boolean;
  /** If true, save form data when navigating between steps */
  saveOnStepChange?: boolean;
}
