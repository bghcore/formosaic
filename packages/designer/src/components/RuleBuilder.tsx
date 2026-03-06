import React, { useState, useCallback } from "react";
import type {
  IRule,
  ICondition,
  IFieldCondition,
  ILogicalCondition,
  IFieldEffect,
} from "@form-eng/core";
import { useDesigner } from "../state/useDesigner";

/** All field condition operators */
const FIELD_OPERATORS: IFieldCondition["operator"][] = [
  "equals",
  "notEquals",
  "greaterThan",
  "lessThan",
  "greaterThanOrEqual",
  "lessThanOrEqual",
  "contains",
  "notContains",
  "startsWith",
  "endsWith",
  "in",
  "notIn",
  "isEmpty",
  "isNotEmpty",
  "matches",
];

const UNARY_OPERATORS = new Set<string>(["isEmpty", "isNotEmpty"]);

export function RuleBuilder() {
  const { state, selectedField, addRule, updateRule, removeRule } = useDesigner();
  const { selectedFieldId, fields, fieldOrder } = state;

  if (!selectedFieldId || !selectedField) {
    return null;
  }

  const rules = selectedField.rules ?? [];
  const fieldNames = fieldOrder;

  return (
    <div>
      <div className="dfd-panel-section">
        <h4 className="dfd-panel-section-title">
          Rules ({rules.length})
        </h4>
        {rules.map((rule, index) => (
          <RuleCard
            key={index}
            rule={rule}
            index={index}
            fieldNames={fieldNames}
            onUpdate={(r) => updateRule(selectedFieldId, index, r)}
            onRemove={() => removeRule(selectedFieldId, index)}
          />
        ))}
        <button
          className="dfd-btn dfd-btn-sm dfd-btn-primary"
          onClick={() => {
            const defaultField = fieldNames.find((f) => f !== selectedFieldId) ?? "";
            addRule(selectedFieldId, {
              when: { field: defaultField, operator: "equals", value: "" },
              then: {},
            });
          }}
        >
          + Add Rule
        </button>
      </div>
    </div>
  );
}

/* -- Rule Card ----------------------------------------------------------- */

function RuleCard({
  rule,
  index,
  fieldNames,
  onUpdate,
  onRemove,
}: {
  rule: IRule;
  index: number;
  fieldNames: string[];
  onUpdate: (rule: IRule) => void;
  onRemove: () => void;
}) {
  return (
    <div className="dfd-rule-card">
      <div className="dfd-rule-header">
        <span className="dfd-rule-title">
          Rule {index + 1}
          {rule.id ? ` (${rule.id})` : ""}
        </span>
        <button className="dfd-btn-icon" onClick={onRemove} title="Remove rule">
          &#x2715;
        </button>
      </div>

      {/* Rule ID */}
      <div className="dfd-form-group">
        <label className="dfd-label">Rule ID (optional)</label>
        <input
          className="dfd-input"
          type="text"
          value={rule.id ?? ""}
          placeholder="e.g. show-when-active"
          onChange={(e) =>
            onUpdate({ ...rule, id: e.target.value || undefined })
          }
        />
      </div>

      {/* Priority */}
      <div className="dfd-form-group">
        <label className="dfd-label">Priority</label>
        <input
          className="dfd-input"
          type="number"
          value={rule.priority ?? 0}
          onChange={(e) =>
            onUpdate({
              ...rule,
              priority: parseInt(e.target.value) || undefined,
            })
          }
        />
      </div>

      {/* Condition */}
      <div className="dfd-form-group">
        <label className="dfd-label">When (Condition)</label>
        <ConditionEditor
          condition={rule.when}
          fieldNames={fieldNames}
          onChange={(when) => onUpdate({ ...rule, when })}
        />
      </div>

      {/* Then Effect */}
      <div className="dfd-form-group">
        <label className="dfd-label">Then (Effect)</label>
        <EffectEditor
          effect={rule.then}
          onChange={(then) => onUpdate({ ...rule, then })}
        />
      </div>

      {/* Else Effect */}
      <div className="dfd-form-group">
        <label className="dfd-label">Else (Effect, optional)</label>
        <EffectEditor
          effect={rule.else ?? {}}
          onChange={(effect) => {
            const hasValues = Object.values(effect).some((v) => v !== undefined);
            onUpdate({ ...rule, else: hasValues ? effect : undefined });
          }}
        />
      </div>
    </div>
  );
}

/* -- Condition Editor ---------------------------------------------------- */

function isLogicalCondition(c: ICondition): c is ILogicalCondition {
  const op = c.operator;
  return op === "and" || op === "or" || op === "not";
}

function ConditionEditor({
  condition,
  fieldNames,
  onChange,
}: {
  condition: ICondition;
  fieldNames: string[];
  onChange: (condition: ICondition) => void;
}) {
  const isLogical = isLogicalCondition(condition);

  if (isLogical) {
    return (
      <LogicalConditionEditor
        condition={condition}
        fieldNames={fieldNames}
        onChange={onChange}
      />
    );
  }

  const fc = condition as IFieldCondition;
  return (
    <div className="dfd-condition-group">
      <div className="dfd-condition-row">
        <select
          className="dfd-select"
          value={fc.field}
          onChange={(e) =>
            onChange({ ...fc, field: e.target.value })
          }
        >
          <option value="">-- Select Field --</option>
          {fieldNames.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <select
          className="dfd-select"
          value={fc.operator}
          onChange={(e) =>
            onChange({
              ...fc,
              operator: e.target.value as IFieldCondition["operator"],
              value: UNARY_OPERATORS.has(e.target.value) ? undefined : fc.value,
            })
          }
        >
          {FIELD_OPERATORS.map((op) => (
            <option key={op} value={op}>
              {op}
            </option>
          ))}
        </select>
        {!UNARY_OPERATORS.has(fc.operator) && (
          <input
            className="dfd-input"
            type="text"
            value={String(fc.value ?? "")}
            placeholder="Value"
            onChange={(e) =>
              onChange({ ...fc, value: e.target.value })
            }
          />
        )}
      </div>
      <div style={{ marginTop: 4, display: "flex", gap: 4 }}>
        <button
          className="dfd-btn dfd-btn-sm"
          onClick={() =>
            onChange({
              operator: "and",
              conditions: [fc, { field: "", operator: "equals", value: "" }],
            } as ILogicalCondition)
          }
        >
          + AND
        </button>
        <button
          className="dfd-btn dfd-btn-sm"
          onClick={() =>
            onChange({
              operator: "or",
              conditions: [fc, { field: "", operator: "equals", value: "" }],
            } as ILogicalCondition)
          }
        >
          + OR
        </button>
      </div>
    </div>
  );
}

function LogicalConditionEditor({
  condition,
  fieldNames,
  onChange,
}: {
  condition: ILogicalCondition;
  fieldNames: string[];
  onChange: (condition: ICondition) => void;
}) {
  return (
    <div className="dfd-condition-group">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <select
          className="dfd-select"
          value={condition.operator}
          style={{ width: "auto" }}
          onChange={(e) =>
            onChange({
              ...condition,
              operator: e.target.value as "and" | "or" | "not",
            })
          }
        >
          <option value="and">AND</option>
          <option value="or">OR</option>
          <option value="not">NOT</option>
        </select>
        <button
          className="dfd-btn dfd-btn-sm"
          onClick={() => {
            // Unwrap: if only 1 child and it's a field condition, promote it
            if (condition.conditions.length === 1 && !isLogicalCondition(condition.conditions[0])) {
              onChange(condition.conditions[0]);
            }
          }}
          title="Remove logical grouping"
        >
          Flatten
        </button>
      </div>
      {condition.conditions.map((child, i) => (
        <div key={i} style={{ marginBottom: 4 }}>
          <ConditionEditor
            condition={child}
            fieldNames={fieldNames}
            onChange={(updated) => {
              const newConds = [...condition.conditions];
              newConds[i] = updated;
              onChange({ ...condition, conditions: newConds });
            }}
          />
          {condition.conditions.length > 1 && (
            <button
              className="dfd-btn-icon"
              style={{ marginTop: 2 }}
              onClick={() => {
                const newConds = condition.conditions.filter((_, idx) => idx !== i);
                if (newConds.length === 1) {
                  onChange(newConds[0]);
                } else {
                  onChange({ ...condition, conditions: newConds });
                }
              }}
              title="Remove this condition"
            >
              &#x2715;
            </button>
          )}
        </div>
      ))}
      <button
        className="dfd-btn dfd-btn-sm"
        onClick={() =>
          onChange({
            ...condition,
            conditions: [
              ...condition.conditions,
              { field: "", operator: "equals", value: "" } as IFieldCondition,
            ],
          })
        }
      >
        + Add Condition
      </button>
    </div>
  );
}

/* -- Effect Editor ------------------------------------------------------- */

function EffectEditor({
  effect,
  onChange,
}: {
  effect: IFieldEffect;
  onChange: (effect: IFieldEffect) => void;
}) {
  return (
    <div className="dfd-condition-group">
      <div className="dfd-checkbox-group">
        <input
          type="checkbox"
          checked={effect.required ?? false}
          onChange={(e) =>
            onChange({ ...effect, required: e.target.checked || undefined })
          }
        />
        <label>Required</label>
      </div>
      <div className="dfd-checkbox-group">
        <input
          type="checkbox"
          checked={effect.hidden ?? false}
          onChange={(e) =>
            onChange({ ...effect, hidden: e.target.checked || undefined })
          }
        />
        <label>Hidden</label>
      </div>
      <div className="dfd-checkbox-group">
        <input
          type="checkbox"
          checked={effect.readOnly ?? false}
          onChange={(e) =>
            onChange({ ...effect, readOnly: e.target.checked || undefined })
          }
        />
        <label>Read Only</label>
      </div>
      <div className="dfd-form-group">
        <label className="dfd-label">Component Type Override</label>
        <input
          className="dfd-input"
          type="text"
          value={effect.component ?? ""}
          placeholder="Leave blank for no override"
          onChange={(e) =>
            onChange({ ...effect, component: e.target.value || undefined })
          }
        />
      </div>
      <div className="dfd-form-group">
        <label className="dfd-label">Computed Value Override</label>
        <input
          className="dfd-input"
          type="text"
          value={effect.computedValue ?? ""}
          placeholder='e.g. $fn.setDate()'
          onChange={(e) =>
            onChange({
              ...effect,
              computedValue: e.target.value || undefined,
            })
          }
        />
      </div>
    </div>
  );
}
