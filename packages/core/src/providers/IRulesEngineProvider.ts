import { IEntityData } from "../utils";
import { IFieldConfig } from "../types/IFieldConfig";
import { IRulesEngineState, IRuntimeFormState } from "../types/IRuntimeFieldState";

export interface IRulesEngineProvider {
  rulesState: IRulesEngineState;
  initFormState: (
    configName: string,
    defaultValues: IEntityData,
    fields: Record<string, IFieldConfig>,
    areAllFieldsReadonly?: boolean
  ) => IRuntimeFormState;
  processFieldChange: (
    entityData: IEntityData,
    configName: string,
    fieldName: string,
    fields: Record<string, IFieldConfig>
  ) => void;
  clearFormState: (configName?: string) => void;
  /**
   * Clear the pending setValue state on one or more fields. If fieldNames is
   * omitted, clears pendingSetValue on every field in the config.
   * Returns immutably; safe to call from an effect.
   */
  clearPendingSetValue: (configName: string, fieldNames?: readonly string[]) => void;
}

export const defaultRulesEngineState: IRulesEngineState = {
  configs: {},
};
