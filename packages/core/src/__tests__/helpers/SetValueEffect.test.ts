import { describe, it, expect } from "vitest";
import { evaluateAllRules, evaluateAffectedFields } from "../../helpers/RuleEngine";
import { IFieldConfig } from "../../types/IFieldConfig";

describe("setValue rule effect", () => {
  const fields: Record<string, IFieldConfig> = {
    trigger: {
      type: "Textbox",
      label: "Trigger",
      rules: [],
    },
    target: {
      type: "Textbox",
      label: "Target",
      rules: [
        {
          when: { field: "trigger", operator: "equals", value: "yes" },
          then: { setValue: "auto-value" },
        },
      ],
    },
  };

  it("sets pendingSetValue when rule condition is true", () => {
    const state = evaluateAllRules(fields, { trigger: "yes" });
    expect(state.fieldStates.target.pendingSetValue).toEqual({ value: "auto-value" });
  });

  it("does NOT set pendingSetValue when rule condition is false", () => {
    const state = evaluateAllRules(fields, { trigger: "no" });
    expect(state.fieldStates.target.pendingSetValue).toBeUndefined();
  });

  it("setValue works with numeric values", () => {
    const numFields: Record<string, IFieldConfig> = {
      flag: { type: "Toggle", label: "Flag", rules: [] },
      amount: {
        type: "Textbox",
        label: "Amount",
        rules: [
          {
            when: { field: "flag", operator: "equals", value: true },
            then: { setValue: 42 },
          },
        ],
      },
    };

    const state = evaluateAllRules(numFields, { flag: true });
    expect(state.fieldStates.amount.pendingSetValue).toEqual({ value: 42 });
  });

  it("setValue works with null (clearing a field)", () => {
    const clearFields: Record<string, IFieldConfig> = {
      mode: { type: "Textbox", label: "Mode", rules: [] },
      cleared: {
        type: "Textbox",
        label: "Cleared",
        rules: [
          {
            when: { field: "mode", operator: "equals", value: "reset" },
            then: { setValue: null },
          },
        ],
      },
    };

    const state = evaluateAllRules(clearFields, { mode: "reset" });
    expect(state.fieldStates.cleared.pendingSetValue).toEqual({ value: null });
  });

  it("higher priority rule setValue wins (first-write-wins by priority)", () => {
    const prioFields: Record<string, IFieldConfig> = {
      trigger: { type: "Textbox", label: "Trigger", rules: [] },
      target: {
        type: "Textbox",
        label: "Target",
        rules: [
          {
            when: { field: "trigger", operator: "isNotEmpty" },
            then: { setValue: "low-priority" },
            priority: 1,
          },
          {
            when: { field: "trigger", operator: "isNotEmpty" },
            then: { setValue: "high-priority" },
            priority: 10,
          },
        ],
      },
    };

    const state = evaluateAllRules(prioFields, { trigger: "x" });
    expect(state.fieldStates.target.pendingSetValue).toEqual({ value: "high-priority" });
  });

  it("setValue does not apply when condition is false (else branch ignored)", () => {
    const elseFields: Record<string, IFieldConfig> = {
      trigger: { type: "Textbox", label: "Trigger", rules: [] },
      target: {
        type: "Textbox",
        label: "Target",
        rules: [
          {
            when: { field: "trigger", operator: "equals", value: "yes" },
            then: { setValue: "from-then" },
            else: { setValue: "from-else" }, // Should NOT be applied
          },
        ],
      },
    };

    // condition false — else branch exists but setValue should not apply
    const state = evaluateAllRules(elseFields, { trigger: "no" });
    expect(state.fieldStates.target.pendingSetValue).toBeUndefined();
  });

  it("evaluateAffectedFields carries setValue into incremental updates", () => {
    const initialState = evaluateAllRules(fields, { trigger: "no" });
    expect(initialState.fieldStates.target.pendingSetValue).toBeUndefined();

    const updatedState = evaluateAffectedFields("trigger", fields, { trigger: "yes" }, initialState);
    expect(updatedState.fieldStates.target.pendingSetValue).toEqual({ value: "auto-value" });
  });
});
