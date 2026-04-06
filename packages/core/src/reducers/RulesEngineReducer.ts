import { RulesEngineActionType, RulesEngineAction } from "../types/IRulesEngineAction";
import { IRulesEngineState } from "../types/IRuntimeFieldState";

export const defaultRulesEngineState: IRulesEngineState = {
  configs: {},
};

const rulesEngineReducer = (
  state: IRulesEngineState = defaultRulesEngineState,
  action: RulesEngineAction
): IRulesEngineState => {
  switch (action.type) {
    case RulesEngineActionType.SET: {
      const configName = action.payload.configName;
      return {
        configs: {
          ...state.configs,
          [configName]: { ...action.payload.formState },
        },
      };
    }
    case RulesEngineActionType.UPDATE: {
      const configName = action.payload.configName;
      const existing = state.configs[configName];
      if (!existing) return state;

      const updatedFieldStates = { ...existing.fieldStates };
      Object.keys(action.payload.formState.fieldStates).forEach(fieldName => {
        const prev = updatedFieldStates[fieldName];
        const next = action.payload.formState.fieldStates[fieldName];
        updatedFieldStates[fieldName] = {
          ...prev,
          ...next,
          // Preserve dependency graph edges — these are set at init and must
          // not be overwritten by incremental updates that omit them
          dependentFields: next.dependentFields ?? prev?.dependentFields,
          dependsOnFields: next.dependsOnFields ?? prev?.dependsOnFields,
        };
      });

      return {
        configs: {
          ...state.configs,
          [configName]: {
            fieldStates: updatedFieldStates,
            fieldOrder: action.payload.formState.fieldOrder,
          },
        },
      };
    }
    case RulesEngineActionType.CLEAR: {
      if (action.payload.configName) {
        const { [action.payload.configName]: _, ...remaining } = state.configs;
        return { configs: remaining };
      }
      return defaultRulesEngineState;
    }
    default:
      return state;
  }
};

export default rulesEngineReducer;
