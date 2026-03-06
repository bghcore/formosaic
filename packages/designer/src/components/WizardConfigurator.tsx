import React, { useCallback } from "react";
import type { IWizardConfig, IWizardStep } from "@form-eng/core";
import { useDesigner } from "../state/useDesigner";

export function WizardConfigurator() {
  const { state, setWizard } = useDesigner();
  const { wizard, fieldOrder } = state;

  const handleEnable = useCallback(() => {
    setWizard({
      steps: [
        {
          id: "step1",
          title: "Step 1",
          fields: [],
        },
      ],
    });
  }, [setWizard]);

  const handleDisable = useCallback(() => {
    setWizard(null);
  }, [setWizard]);

  if (!wizard) {
    return (
      <div className="dfd-panel-section">
        <h4 className="dfd-panel-section-title">Wizard</h4>
        <p style={{ color: "var(--designer-text-secondary)", margin: "0 0 8px 0" }}>
          No wizard configured. Enable wizard mode to organize fields into steps.
        </p>
        <button className="dfd-btn dfd-btn-primary dfd-btn-sm" onClick={handleEnable}>
          Enable Wizard
        </button>
      </div>
    );
  }

  const { steps } = wizard;

  const updateWizard = (updates: Partial<IWizardConfig>) => {
    setWizard({ ...wizard, ...updates });
  };

  const updateStep = (stepIndex: number, updates: Partial<IWizardStep>) => {
    const newSteps = steps.map((s, i) =>
      i === stepIndex ? { ...s, ...updates } : s,
    );
    updateWizard({ steps: newSteps });
  };

  const addStep = () => {
    const id = `step${steps.length + 1}`;
    updateWizard({
      steps: [...steps, { id, title: `Step ${steps.length + 1}`, fields: [] }],
    });
  };

  const removeStep = (stepIndex: number) => {
    const newSteps = steps.filter((_, i) => i !== stepIndex);
    if (newSteps.length === 0) {
      setWizard(null);
    } else {
      updateWizard({ steps: newSteps });
    }
  };

  const toggleFieldInStep = (stepIndex: number, fieldId: string) => {
    const step = steps[stepIndex];
    const fieldSet = new Set(step.fields);
    if (fieldSet.has(fieldId)) {
      fieldSet.delete(fieldId);
    } else {
      fieldSet.add(fieldId);
    }
    updateStep(stepIndex, { fields: Array.from(fieldSet) });
  };

  // Fields already assigned to any step
  const assignedFields = new Set(steps.flatMap((s) => s.fields));
  const unassignedFields = fieldOrder.filter((f) => !assignedFields.has(f));

  return (
    <div>
      <div className="dfd-panel-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h4 className="dfd-panel-section-title" style={{ margin: 0, border: "none", paddingBottom: 0 }}>
            Wizard Steps
          </h4>
          <button className="dfd-btn dfd-btn-sm dfd-btn-danger" onClick={handleDisable}>
            Disable Wizard
          </button>
        </div>
      </div>

      {/* Wizard options */}
      <div className="dfd-panel-section">
        <div className="dfd-checkbox-group">
          <input
            type="checkbox"
            id="wizard-linear"
            checked={wizard.linearNavigation ?? false}
            onChange={(e) => updateWizard({ linearNavigation: e.target.checked || undefined })}
          />
          <label htmlFor="wizard-linear">Linear Navigation</label>
        </div>
        <div className="dfd-checkbox-group">
          <input
            type="checkbox"
            id="wizard-validate"
            checked={wizard.validateOnStepChange ?? false}
            onChange={(e) => updateWizard({ validateOnStepChange: e.target.checked || undefined })}
          />
          <label htmlFor="wizard-validate">Validate on Step Change</label>
        </div>
        <div className="dfd-checkbox-group">
          <input
            type="checkbox"
            id="wizard-save"
            checked={wizard.saveOnStepChange ?? false}
            onChange={(e) => updateWizard({ saveOnStepChange: e.target.checked || undefined })}
          />
          <label htmlFor="wizard-save">Save on Step Change</label>
        </div>
      </div>

      {/* Steps */}
      {steps.map((step, stepIndex) => (
        <div key={step.id} className="dfd-wizard-step">
          <div className="dfd-wizard-step-header">
            <strong>Step {stepIndex + 1}</strong>
            <button
              className="dfd-btn-icon"
              onClick={() => removeStep(stepIndex)}
              title="Remove step"
            >
              &#x2715;
            </button>
          </div>
          <div className="dfd-form-group">
            <label className="dfd-label">ID</label>
            <input
              className="dfd-input"
              type="text"
              value={step.id}
              onChange={(e) => updateStep(stepIndex, { id: e.target.value })}
            />
          </div>
          <div className="dfd-form-group">
            <label className="dfd-label">Title</label>
            <input
              className="dfd-input"
              type="text"
              value={step.title}
              onChange={(e) => updateStep(stepIndex, { title: e.target.value })}
            />
          </div>
          <div className="dfd-form-group">
            <label className="dfd-label">Description</label>
            <input
              className="dfd-input"
              type="text"
              value={step.description ?? ""}
              onChange={(e) =>
                updateStep(stepIndex, {
                  description: e.target.value || undefined,
                })
              }
            />
          </div>
          <div className="dfd-form-group">
            <label className="dfd-label">Fields</label>
            <div style={{ maxHeight: 150, overflowY: "auto", border: "1px solid var(--designer-border)", borderRadius: 4, padding: 4 }}>
              {fieldOrder.map((fid) => {
                const isInStep = step.fields.includes(fid);
                const isInOtherStep =
                  !isInStep &&
                  steps.some((s, i) => i !== stepIndex && s.fields.includes(fid));
                return (
                  <div key={fid} className="dfd-checkbox-group">
                    <input
                      type="checkbox"
                      checked={isInStep}
                      disabled={isInOtherStep}
                      onChange={() => toggleFieldInStep(stepIndex, fid)}
                    />
                    <label style={{ opacity: isInOtherStep ? 0.5 : 1 }}>
                      {fid}
                      {isInOtherStep && " (assigned)"}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}

      <button className="dfd-btn dfd-btn-sm dfd-btn-primary" onClick={addStep}>
        + Add Step
      </button>

      {unassignedFields.length > 0 && (
        <div className="dfd-error-text" style={{ marginTop: 8 }}>
          Unassigned fields: {unassignedFields.join(", ")}
        </div>
      )}
    </div>
  );
}
