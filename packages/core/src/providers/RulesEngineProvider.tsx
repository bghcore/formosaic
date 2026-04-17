import { IEntityData } from "../utils";
import React from "react";
import { IFieldConfig } from "../types/IFieldConfig";
import { IRuntimeFormState } from "../types/IRuntimeFieldState";
import { RulesEngineActionType } from "../types/IRulesEngineAction";
import { evaluateAllRules, evaluateAffectedFields } from "../helpers/RuleEngine";
import rulesEngineReducer, { defaultRulesEngineState } from "../reducers/RulesEngineReducer";
import { IRulesEngineProvider } from "./IRulesEngineProvider";

const RulesEngineContext: React.Context<IRulesEngineProvider> = React.createContext(
  undefined as unknown as IRulesEngineProvider
);

export function UseRulesEngineContext() {
  const context = React.useContext(RulesEngineContext);
  if (context === undefined) {
    throw new Error(
      "UseRulesEngineContext() was called outside of <RulesEngineProvider>. " +
      "Required hierarchy: <RulesEngineProvider> > <InjectedFieldProvider> > <Formosaic>"
    );
  }
  return context;
}


export const RulesEngineProvider: React.FC<React.PropsWithChildren<{}>> = (
  props: React.PropsWithChildren<{}>
): React.JSX.Element => {
  const [rulesState, dispatch] = React.useReducer(rulesEngineReducer, defaultRulesEngineState);

  const rulesStateRef = React.useRef(rulesState);
  React.useEffect(() => { rulesStateRef.current = rulesState; }, [rulesState]);

  const initFormState = React.useCallback((
    configName: string,
    defaultValues: IEntityData,
    fields: Record<string, IFieldConfig>,
    areAllFieldsReadonly?: boolean
  ): IRuntimeFormState => {
    const formState = evaluateAllRules(fields, defaultValues, areAllFieldsReadonly);

    dispatch({
      type: RulesEngineActionType.SET,
      payload: { configName, formState },
    });

    return formState;
  }, []);

  const clearFormState = React.useCallback((configName?: string) => {
    dispatch({
      type: RulesEngineActionType.CLEAR,
      payload: { configName },
    });
  }, []);

  const clearPendingSetValue = React.useCallback((
    configName: string,
    fieldNames?: readonly string[]
  ) => {
    dispatch({
      type: RulesEngineActionType.CLEAR_PENDING_SETVALUE,
      payload: { configName, fieldNames },
    });
  }, []);

  const processFieldChange = React.useCallback((
    entityData: IEntityData,
    configName: string,
    fieldName: string,
    fields: Record<string, IFieldConfig>
  ) => {
    const currentState = rulesStateRef.current.configs[configName];
    if (!currentState) return;

    // Re-evaluate when this field affects other fields (forward deps)
    // or when it has its own rules that may produce cross-field effects
    const fieldState = currentState.fieldStates[fieldName];
    const hasDependents = (fieldState?.dependentFields?.length ?? 0) > 0;
    const hasRules = !!(fields[fieldName]?.rules?.length);

    if (!hasDependents && !hasRules) return;

    const updatedState = evaluateAffectedFields(fieldName, fields, entityData, currentState);

    dispatch({
      type: RulesEngineActionType.UPDATE,
      payload: { configName, formState: updatedState },
    });
  }, []);

  const providerValue: IRulesEngineProvider = React.useMemo(() => ({
    rulesState,
    initFormState,
    processFieldChange,
    clearFormState,
    clearPendingSetValue,
  }), [rulesState, initFormState, processFieldChange, clearFormState, clearPendingSetValue]);

  return (
    <RulesEngineContext.Provider value={providerValue}>
      {props.children}
    </RulesEngineContext.Provider>
  );
};

