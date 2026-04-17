import React from "react";
import { IWizardConfig, IWizardStep } from "../types/IWizardConfig";
import { IEntityData } from "../utils";
import { IRuntimeFieldState } from "../types/IRuntimeFieldState";
import { getVisibleSteps, getStepFields, isStepValid } from "../helpers/WizardHelper";
import { FormStrings } from "../strings";

export interface IWizardNavigationProps {
  steps: IWizardStep[];
  currentStepIndex: number;
  goToStep: (index: number) => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  goNext: () => void;
  goPrev: () => void;
}

export interface IWizardStepHeaderProps {
  step: IWizardStep;
  stepIndex: number;
  totalSteps: number;
}

export interface IWizardFormProps {
  wizardConfig: IWizardConfig;
  entityData: IEntityData;
  fieldStates?: Record<string, IRuntimeFieldState>;
  errors?: Record<string, unknown>;
  renderStepContent: (fields: string[]) => React.ReactNode;
  renderStepNavigation?: (props: IWizardNavigationProps) => React.ReactNode;
  renderStepHeader?: (props: IWizardStepHeaderProps) => React.ReactNode;
  onStepChange?: (fromIndex: number, toIndex: number) => void;
  /** Analytics callback for wizard step changes. */
  onAnalyticsStepChange?: (fromStep: number, toStep: number) => void;
}

export const WizardForm: React.FC<IWizardFormProps> = (props) => {
  const {
    wizardConfig, entityData, fieldStates, errors,
    renderStepContent, renderStepNavigation, renderStepHeader, onStepChange, onAnalyticsStepChange,
  } = props;

  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);

  const visibleSteps = React.useMemo(
    () => getVisibleSteps(wizardConfig.steps, entityData),
    [wizardConfig.steps, entityData]
  );

  // Per audit P1-7: clamp currentStepIndex when steps disappear so the
  // wizard never renders blank or hangs on an invalid index.
  React.useEffect(() => {
    if (currentStepIndex >= visibleSteps.length) {
      setCurrentStepIndex(Math.max(0, visibleSteps.length - 1));
    }
  }, [visibleSteps.length, currentStepIndex]);

  const currentStep = visibleSteps[currentStepIndex];
  const currentFields = currentStep ? getStepFields(currentStep, fieldStates) : [];
  const canGoNext = currentStepIndex < visibleSteps.length - 1;
  const canGoPrev = currentStepIndex > 0;

  const goToStep = React.useCallback((index: number) => {
    if (index >= 0 && index < visibleSteps.length) {
      if (wizardConfig.validateOnStepChange && errors && currentStep) {
        if (!isStepValid(currentStep, errors)) return;
      }
      const prevIndex = currentStepIndex;
      setCurrentStepIndex(index);
      onStepChange?.(prevIndex, index);
      onAnalyticsStepChange?.(prevIndex, index);
    }
  }, [visibleSteps.length, currentStepIndex, wizardConfig.validateOnStepChange, errors, currentStep, onStepChange, onAnalyticsStepChange]);

  const goNext = React.useCallback(() => { if (canGoNext) goToStep(currentStepIndex + 1); }, [canGoNext, currentStepIndex, goToStep]);
  const goPrev = React.useCallback(() => { if (canGoPrev) goToStep(currentStepIndex - 1); }, [canGoPrev, currentStepIndex, goToStep]);

  const stepAnnouncement = currentStep
    ? `${FormStrings.stepOf(currentStepIndex + 1, visibleSteps.length)}${currentStep.title ? `: ${currentStep.title}` : ""}`
    : "";

  if (!currentStep) return null;

  return (
    <div className="wizard-form" role="group" aria-label={FormStrings.formWizard}>
      <div role="status" aria-live="polite" className="sr-only" style={{ position: "absolute", width: "1px", height: "1px", padding: 0, margin: "-1px", overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", border: 0 }} data-testid="wizard-step-live-region">
        {stepAnnouncement}
      </div>
      {renderStepHeader?.({ step: currentStep, stepIndex: currentStepIndex, totalSteps: visibleSteps.length })}
      <div className="wizard-step-content" aria-current="step">
        {renderStepContent(currentFields)}
      </div>
      {renderStepNavigation?.({ steps: visibleSteps, currentStepIndex, goToStep, canGoNext, canGoPrev, goNext, goPrev })}
    </div>
  );
};

