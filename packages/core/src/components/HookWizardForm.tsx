import React from "react";
import { IWizardConfig, IWizardStep } from "../types/IWizardConfig";
import { IEntityData, Dictionary } from "../utils";
import { IBusinessRule } from "../types/IBusinessRule";
import { getVisibleSteps, getStepFields, isStepValid } from "../helpers/WizardHelper";
import { HookInlineFormStrings } from "../strings";

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

export interface IHookWizardFormProps {
  wizardConfig: IWizardConfig;
  entityData: IEntityData;
  fieldRules?: Dictionary<IBusinessRule>;
  errors?: Record<string, unknown>;
  renderStepContent: (fields: string[]) => React.ReactNode;
  renderStepNavigation?: (props: IWizardNavigationProps) => React.ReactNode;
  renderStepHeader?: (props: IWizardStepHeaderProps) => React.ReactNode;
  onStepChange?: (fromIndex: number, toIndex: number) => void;
}

export const HookWizardForm: React.FC<IHookWizardFormProps> = (props) => {
  const {
    wizardConfig,
    entityData,
    fieldRules,
    errors,
    renderStepContent,
    renderStepNavigation,
    renderStepHeader,
    onStepChange,
  } = props;

  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);

  const visibleSteps = React.useMemo(
    () => getVisibleSteps(wizardConfig.steps, entityData),
    [wizardConfig.steps, entityData]
  );

  const currentStep = visibleSteps[currentStepIndex];
  const currentFields = currentStep ? getStepFields(currentStep, fieldRules) : [];

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
    }
  }, [visibleSteps.length, currentStepIndex, wizardConfig.validateOnStepChange, errors, currentStep, onStepChange]);

  const goNext = React.useCallback(() => {
    if (canGoNext) goToStep(currentStepIndex + 1);
  }, [canGoNext, currentStepIndex, goToStep]);

  const goPrev = React.useCallback(() => {
    if (canGoPrev) goToStep(currentStepIndex - 1);
  }, [canGoPrev, currentStepIndex, goToStep]);

  // Build the step announcement text for screen readers
  const stepAnnouncement = currentStep
    ? `${HookInlineFormStrings.stepOf(currentStepIndex + 1, visibleSteps.length)}${currentStep.title ? `: ${currentStep.title}` : ""}`
    : "";

  if (!currentStep) return null;

  return (
    <div className="wizard-form">
      {/* Visually-hidden ARIA live region for step change announcements */}
      <div
        role="status"
        aria-live="polite"
        className="sr-only"
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
        data-testid="wizard-step-live-region"
      >
        {stepAnnouncement}
      </div>
      {renderStepHeader?.({
        step: currentStep,
        stepIndex: currentStepIndex,
        totalSteps: visibleSteps.length,
      })}
      <div className="wizard-step-content" aria-current="step">
        {renderStepContent(currentFields)}
      </div>
      {renderStepNavigation?.({
        steps: visibleSteps,
        currentStepIndex,
        goToStep,
        canGoNext,
        canGoPrev,
        goNext,
        goPrev,
      })}
    </div>
  );
};
