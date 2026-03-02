import { DeepCopy } from "@cxpui/common";
import BusinessRulesActionType from "../Interfaces/IBusinessRuleAction";
import { ActionTypeKeys } from "../Interfaces/IBusinessRuleActionKeys";
import { defaultBusinessRulesState } from "../Providers/IBusinessRulesProvider";

const businessRulesReducer = (state = defaultBusinessRulesState, action: BusinessRulesActionType) => {
  const configName = action.payload.configName;
  switch (action.type) {
    case ActionTypeKeys.BUSINESSRULES_SET:
      const newAddState = DeepCopy(state);
      newAddState.configRules[configName] = { ...action.payload.configBusinessRules };
      return newAddState;
    case ActionTypeKeys.BUSINESSRULES_UPDATE:
      const newUpdateState = DeepCopy(state);
      Object.keys(action.payload.configBusinessRules.fieldRules).forEach(fieldName => {
        newUpdateState.configRules[configName].fieldRules[fieldName] = {
          ...newUpdateState.configRules[configName].fieldRules[fieldName],
          ...action.payload.configBusinessRules.fieldRules[fieldName]
        };
      });
      newUpdateState.configRules[configName].order = action.payload.configBusinessRules.order;
      return newUpdateState;
    default:
      return state;
  }
};

export default businessRulesReducer;
