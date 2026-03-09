import React, { useState, useCallback } from "react";
import { ComponentTypes, getAllValidatorMetadata, getValidatorRegistry } from "@form-eng/core";
import type { IOption, IValidationRule } from "@form-eng/core";
import { useDesigner } from "../state/useDesigner";

/** All available component types */
const COMPONENT_TYPE_OPTIONS = Object.values(ComponentTypes);

/**
 * Build the validator names list dynamically: all names from the validator
 * registry (built-ins + any registered custom validators), with metadata-
 * registered names merged in for completeness.
 */
function getValidatorNames(): string[] {
  const registryNames = Object.keys(getValidatorRegistry());
  const metadataNames = Object.keys(getAllValidatorMetadata());
  const all = new Set([...registryNames, ...metadataNames]);
  // Filter out legacy aliases to keep the list clean (they are duplicates)
  const legacyAliases = new Set([
    "EmailValidation", "PhoneNumberValidation", "YearValidation", "isValidUrl",
    "NoSpecialCharactersValidation", "CurrencyValidation", "UniqueInArrayValidation",
    "Max150KbValidation", "Max32KbValidation",
  ]);
  return [...all].filter(n => !legacyAliases.has(n)).sort();
}

const VALIDATOR_NAMES = getValidatorNames();

type PanelTab = "general" | "options" | "validation" | "config";

export function FieldConfigPanel() {
  const { state, selectedField, updateField } = useDesigner();
  const { selectedFieldId } = state;
  const [activeTab, setActiveTab] = useState<PanelTab>("general");

  if (!selectedFieldId || !selectedField) {
    return (
      <div className="dfd-panel">
        <div className="dfd-panel-empty">Select a field to edit its properties</div>
      </div>
    );
  }

  const hasOptions =
    selectedField.type === "Dropdown" ||
    selectedField.type === "SimpleDropdown" ||
    selectedField.type === "Multiselect" ||
    selectedField.type === "MultiSelectSearch" ||
    selectedField.type === "StatusDropdown" ||
    selectedField.type === "ChoiceSet";

  const tabs: { key: PanelTab; label: string }[] = [
    { key: "general", label: "General" },
    ...(hasOptions ? [{ key: "options" as PanelTab, label: "Options" }] : []),
    { key: "validation", label: "Validation" },
    { key: "config", label: "Config" },
  ];

  return (
    <div className="dfd-panel">
      <h3 className="dfd-panel-title">Field: {selectedFieldId}</h3>
      <div className="dfd-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`dfd-tab${activeTab === tab.key ? " dfd-tab-active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "general" && (
        <GeneralTab
          fieldId={selectedFieldId}
          field={selectedField}
          onUpdate={updateField}
        />
      )}
      {activeTab === "options" && hasOptions && (
        <OptionsTab
          fieldId={selectedFieldId}
          options={selectedField.options ?? []}
          onUpdate={updateField}
        />
      )}
      {activeTab === "validation" && (
        <ValidationTab
          fieldId={selectedFieldId}
          validate={selectedField.validate ?? []}
          onUpdate={updateField}
        />
      )}
      {activeTab === "config" && (
        <ConfigTab
          fieldId={selectedFieldId}
          config={selectedField.config ?? {}}
          onUpdate={updateField}
        />
      )}
    </div>
  );
}

/* -- General Tab --------------------------------------------------------- */

function GeneralTab({
  fieldId,
  field,
  onUpdate,
}: {
  fieldId: string;
  field: { type: string; label: string; required?: boolean; hidden?: boolean; readOnly?: boolean; defaultValue?: unknown; description?: string; placeholder?: string; computedValue?: string };
  onUpdate: (id: string, updates: Record<string, unknown>) => void;
}) {
  return (
    <div>
      <div className="dfd-form-group">
        <label className="dfd-label">Label</label>
        <input
          className="dfd-input"
          type="text"
          value={field.label}
          onChange={(e) => onUpdate(fieldId, { label: e.target.value })}
        />
      </div>

      <div className="dfd-form-group">
        <label className="dfd-label">Type</label>
        <select
          className="dfd-select"
          value={field.type}
          onChange={(e) => onUpdate(fieldId, { type: e.target.value })}
        >
          {COMPONENT_TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="dfd-form-group">
        <div className="dfd-checkbox-group">
          <input
            type="checkbox"
            id={`${fieldId}-required`}
            checked={field.required ?? false}
            onChange={(e) => onUpdate(fieldId, { required: e.target.checked || undefined })}
          />
          <label htmlFor={`${fieldId}-required`}>Required</label>
        </div>
        <div className="dfd-checkbox-group">
          <input
            type="checkbox"
            id={`${fieldId}-hidden`}
            checked={field.hidden ?? false}
            onChange={(e) => onUpdate(fieldId, { hidden: e.target.checked || undefined })}
          />
          <label htmlFor={`${fieldId}-hidden`}>Hidden</label>
        </div>
        <div className="dfd-checkbox-group">
          <input
            type="checkbox"
            id={`${fieldId}-readOnly`}
            checked={field.readOnly ?? false}
            onChange={(e) => onUpdate(fieldId, { readOnly: e.target.checked || undefined })}
          />
          <label htmlFor={`${fieldId}-readOnly`}>Read Only</label>
        </div>
      </div>

      <div className="dfd-form-group">
        <label className="dfd-label">Default Value</label>
        <input
          className="dfd-input"
          type="text"
          value={String(field.defaultValue ?? "")}
          onChange={(e) =>
            onUpdate(fieldId, {
              defaultValue: e.target.value || undefined,
            })
          }
        />
      </div>

      <div className="dfd-form-group">
        <label className="dfd-label">Description</label>
        <input
          className="dfd-input"
          type="text"
          value={field.description ?? ""}
          onChange={(e) =>
            onUpdate(fieldId, { description: e.target.value || undefined })
          }
        />
      </div>

      <div className="dfd-form-group">
        <label className="dfd-label">Placeholder</label>
        <input
          className="dfd-input"
          type="text"
          value={field.placeholder ?? ""}
          onChange={(e) =>
            onUpdate(fieldId, { placeholder: e.target.value || undefined })
          }
        />
      </div>

      <div className="dfd-form-group">
        <label className="dfd-label">Computed Value</label>
        <input
          className="dfd-input"
          type="text"
          value={field.computedValue ?? ""}
          placeholder='e.g. $values.qty * $values.price'
          onChange={(e) =>
            onUpdate(fieldId, { computedValue: e.target.value || undefined })
          }
        />
      </div>
    </div>
  );
}

/* -- Options Tab --------------------------------------------------------- */

function OptionsTab({
  fieldId,
  options,
  onUpdate,
}: {
  fieldId: string;
  options: IOption[];
  onUpdate: (id: string, updates: Record<string, unknown>) => void;
}) {
  const handleAddOption = useCallback(() => {
    const newOptions: IOption[] = [
      ...options,
      { value: `option${options.length + 1}`, label: `Option ${options.length + 1}` },
    ];
    onUpdate(fieldId, { options: newOptions });
  }, [fieldId, options, onUpdate]);

  const handleRemoveOption = useCallback(
    (index: number) => {
      const newOptions = options.filter((_, i) => i !== index);
      onUpdate(fieldId, { options: newOptions.length > 0 ? newOptions : undefined });
    },
    [fieldId, options, onUpdate],
  );

  const handleUpdateOption = useCallback(
    (index: number, key: "value" | "label", val: string) => {
      const newOptions = options.map((opt, i) =>
        i === index ? { ...opt, [key]: val } : opt,
      );
      onUpdate(fieldId, { options: newOptions });
    },
    [fieldId, options, onUpdate],
  );

  return (
    <div>
      <div className="dfd-panel-section">
        <h4 className="dfd-panel-section-title">Options</h4>
        <div className="dfd-options-list">
          {options.map((opt, index) => (
            <div key={index} className="dfd-option-row">
              <input
                className="dfd-input"
                type="text"
                value={String(opt.value)}
                placeholder="Value"
                onChange={(e) => handleUpdateOption(index, "value", e.target.value)}
              />
              <input
                className="dfd-input"
                type="text"
                value={opt.label}
                placeholder="Label"
                onChange={(e) => handleUpdateOption(index, "label", e.target.value)}
              />
              <button
                className="dfd-btn-icon"
                onClick={() => handleRemoveOption(index)}
                title="Remove option"
              >
                &#x2715;
              </button>
            </div>
          ))}
        </div>
        <button
          className="dfd-btn dfd-btn-sm"
          onClick={handleAddOption}
          style={{ marginTop: 8 }}
        >
          + Add Option
        </button>
      </div>
    </div>
  );
}

/* -- Validation Tab ------------------------------------------------------ */

function ValidationTab({
  fieldId,
  validate,
  onUpdate,
}: {
  fieldId: string;
  validate: IValidationRule[];
  onUpdate: (id: string, updates: Record<string, unknown>) => void;
}) {
  const handleAdd = useCallback(() => {
    const newRules: IValidationRule[] = [...validate, { name: "required" }];
    onUpdate(fieldId, { validate: newRules });
  }, [fieldId, validate, onUpdate]);

  const handleRemove = useCallback(
    (index: number) => {
      const newRules = validate.filter((_, i) => i !== index);
      onUpdate(fieldId, { validate: newRules.length > 0 ? newRules : undefined });
    },
    [fieldId, validate, onUpdate],
  );

  const handleUpdateName = useCallback(
    (index: number, name: string) => {
      const newRules = validate.map((r, i) =>
        i === index ? { ...r, name } : r,
      );
      onUpdate(fieldId, { validate: newRules });
    },
    [fieldId, validate, onUpdate],
  );

  const handleUpdateMessage = useCallback(
    (index: number, message: string) => {
      const newRules = validate.map((r, i) =>
        i === index ? { ...r, message: message || undefined } : r,
      );
      onUpdate(fieldId, { validate: newRules });
    },
    [fieldId, validate, onUpdate],
  );

  const handleUpdateParams = useCallback(
    (index: number, paramsJson: string) => {
      const newRules = [...validate];
      try {
        const params = JSON.parse(paramsJson);
        newRules[index] = { ...newRules[index], params };
      } catch {
        newRules[index] = { ...newRules[index], params: undefined };
      }
      onUpdate(fieldId, { validate: newRules });
    },
    [fieldId, validate, onUpdate],
  );

  return (
    <div>
      <div className="dfd-panel-section">
        <h4 className="dfd-panel-section-title">Validation Rules</h4>
        {validate.map((rule, index) => (
          <div key={index} className="dfd-rule-card">
            <div className="dfd-rule-header">
              <span className="dfd-rule-title">Rule {index + 1}</span>
              <button
                className="dfd-btn-icon"
                onClick={() => handleRemove(index)}
                title="Remove rule"
              >
                &#x2715;
              </button>
            </div>
            <div className="dfd-form-group">
              <label className="dfd-label">Validator</label>
              <select
                className="dfd-select"
                value={rule.name}
                onChange={(e) => handleUpdateName(index, e.target.value)}
              >
                {VALIDATOR_NAMES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="dfd-form-group">
              <label className="dfd-label">Message</label>
              <input
                className="dfd-input"
                type="text"
                value={rule.message ?? ""}
                placeholder="Custom error message"
                onChange={(e) => handleUpdateMessage(index, e.target.value)}
              />
            </div>
            <div className="dfd-form-group">
              <label className="dfd-label">Params (JSON)</label>
              <input
                className="dfd-input"
                type="text"
                value={rule.params ? JSON.stringify(rule.params) : ""}
                placeholder='e.g. {"min": 3}'
                onChange={(e) => handleUpdateParams(index, e.target.value)}
              />
            </div>
          </div>
        ))}
        <button className="dfd-btn dfd-btn-sm" onClick={handleAdd}>
          + Add Validation Rule
        </button>
      </div>
    </div>
  );
}

/* -- Config Tab ---------------------------------------------------------- */

function ConfigTab({
  fieldId,
  config,
  onUpdate,
}: {
  fieldId: string;
  config: Record<string, unknown>;
  onUpdate: (id: string, updates: Record<string, unknown>) => void;
}) {
  const [text, setText] = useState(JSON.stringify(config, null, 2));
  const [error, setError] = useState<string | null>(null);

  const handleApply = useCallback(() => {
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        setError("Config must be a JSON object");
        return;
      }
      setError(null);
      const cleaned = Object.keys(parsed).length > 0 ? parsed : undefined;
      onUpdate(fieldId, { config: cleaned });
    } catch (e) {
      setError("Invalid JSON");
    }
  }, [fieldId, text, onUpdate]);

  return (
    <div>
      <div className="dfd-panel-section">
        <h4 className="dfd-panel-section-title">Arbitrary Config (JSON)</h4>
        <textarea
          className="dfd-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {error && <div className="dfd-error-text">{error}</div>}
        <button
          className="dfd-btn dfd-btn-sm dfd-btn-primary"
          onClick={handleApply}
          style={{ marginTop: 8 }}
        >
          Apply
        </button>
      </div>
    </div>
  );
}
