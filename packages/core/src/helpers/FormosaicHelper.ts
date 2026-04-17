import { IEntityData, SubEntityType, isEmpty, isNull, isStringEmpty } from "../utils";
import { UseFormGetValues, UseFormSetValue } from "react-hook-form";
import { IFieldConfig } from "../types/IFieldConfig";
import { IConfirmInputModalProps } from "../types/IConfirmInputModalProps";
import { IFieldToRender } from "../types/IFieldToRender";
import { IRuntimeFieldState, IRuntimeFormState } from "../types/IRuntimeFieldState";
import { IOption } from "../types/IOption";
import { evaluateAllRules, buildDependencyGraph, topologicalSort } from "./RuleEngine";
import { runSyncValidations, runValidations, IValidationContext } from "./ValidationRegistry";
import { executeValueFunction } from "./ValueFunctionRegistry";
import { evaluateExpression } from "./ExpressionEngine";
import { logEvent } from "./EventTimeline";

function getNestedFormValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (part === "__proto__" || part === "constructor" || part === "prototype") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function setNestedFormValue(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split(".");
  let current: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (part === "__proto__" || part === "constructor" || part === "prototype") return;
    const next = current[part];
    if (next === null || next === undefined || typeof next !== "object" || Array.isArray(next)) {
      current[part] = {};
    }
    current = current[part] as Record<string, unknown>;
  }
  const last = parts[parts.length - 1];
  if (last === "__proto__" || last === "constructor" || last === "prototype") return;
  current[last] = value;
}

export const IsExpandVisible = (
  fieldStates: Record<string, IRuntimeFieldState>,
  expandCutoffCount: number = 12
): boolean => {
  let count = 0;
  Object.keys(fieldStates).forEach(field => {
    if (!fieldStates[field].hidden) count += 1;
  });
  return count > expandCutoffCount;
};

export const GetConfirmInputModalProps = (
  dirtyFieldNames: string[],
  fieldStates: Record<string, IRuntimeFieldState>
): IConfirmInputModalProps => {
  const confirmInputModalProps: IConfirmInputModalProps = {};

  dirtyFieldNames?.forEach(fieldName => {
    fieldStates[fieldName]?.dependentFields?.forEach(dependentFieldName => {
      if (fieldStates[dependentFieldName]?.confirmInput) {
        if (confirmInputModalProps.confirmInputsTriggeredBy === undefined) {
          confirmInputModalProps.confirmInputsTriggeredBy = fieldName;
          confirmInputModalProps.dependentFieldNames = [dependentFieldName];
        } else {
          confirmInputModalProps.dependentFieldNames!.push(dependentFieldName);
        }
      }
    });
  });

  confirmInputModalProps.otherDirtyFields = dirtyFieldNames?.filter(
    fieldName =>
      !confirmInputModalProps.dependentFieldNames?.includes(fieldName) &&
      fieldName !== confirmInputModalProps.confirmInputsTriggeredBy
  );

  return confirmInputModalProps;
};

interface IExecuteComputedValue {
  fieldName: string;
  expression: string;
}

export const GetComputedValuesOnDirtyFields = (
  dirtyFieldNames: string[],
  fieldStates: Record<string, IRuntimeFieldState>
): IExecuteComputedValue[] => {
  const computedValues: IExecuteComputedValue[] = [];

  dirtyFieldNames?.forEach(fieldName => {
    fieldStates[fieldName]?.dependentFields?.forEach(dependentFieldName => {
      const state = fieldStates[dependentFieldName];
      if (
        state?.computedValue &&
        !state.computeOnCreateOnly &&
        !dirtyFieldNames.includes(dependentFieldName)
      ) {
        computedValues.push({
          fieldName: dependentFieldName,
          expression: state.computedValue,
        });
      }
    });
  });

  return computedValues;
};

export const GetComputedValuesOnCreate = (
  fieldStates: Record<string, IRuntimeFieldState>
): IExecuteComputedValue[] => {
  const computedValues: IExecuteComputedValue[] = [];

  Object.keys(fieldStates).forEach(fieldName => {
    const state = fieldStates[fieldName];
    if (state.computedValue && state.computeOnCreateOnly) {
      computedValues.push({
        fieldName,
        expression: state.computedValue,
      });
    }
  });

  return computedValues;
};

export const ExecuteComputedValue = (
  expression: string,
  values: IEntityData,
  fieldName?: string,
  parentEntity?: IEntityData,
  currentUserId?: string
): SubEntityType => {
  return evaluateExpression(expression, values, fieldName, parentEntity, currentUserId) as SubEntityType;
};

export const CheckFieldValidationRules = (
  value: unknown,
  fieldName: string,
  entityData: IEntityData,
  state: IRuntimeFieldState
): string | undefined => {
  if (!state.validate || state.validate.length === 0) return undefined;
  const context: IValidationContext = { fieldName, values: entityData };
  const result = runSyncValidations(value, state.validate, context);
  logEvent("validation_run", fieldName, result ? `failed: ${result}` : "passed");
  return result;
};

export const CheckAsyncFieldValidationRules = async (
  value: unknown,
  fieldName: string,
  entityData: IEntityData,
  state: IRuntimeFieldState,
  signal?: AbortSignal
): Promise<string | undefined> => {
  if (!state.validate || state.validate.length === 0) return undefined;
  const context: IValidationContext = { fieldName, values: entityData, signal };
  return runValidations(value, state.validate, context);
};

export const CheckValidDropdownOptions = (
  fieldStates: Record<string, IRuntimeFieldState>,
  formValues: IEntityData,
  setValue: UseFormSetValue<IEntityData>
) => {
  if (isEmpty(fieldStates) || isEmpty(formValues)) return;

  Object.keys(fieldStates).forEach(fieldName => {
    const { type, options } = fieldStates[fieldName];
    const fieldValue = getNestedFormValue(formValues, fieldName);
    if (
      (type === "Dropdown" || type === "StatusDropdown") &&
      !isNull(fieldValue) &&
      options &&
      options.findIndex(o => String(o.value) === String(fieldValue)) === -1
    ) {
      setValue(`${fieldName}` as const, null, { shouldDirty: false });
    } else if (type === "Multiselect" && !isNull(fieldValue) && options) {
      const filteredValues = (fieldValue as string[])?.filter(
        val => options.some(o => String(o.value) === val)
      );
      if (filteredValues?.length !== (fieldValue as string[])?.length) {
        setValue(`${fieldName}` as const, filteredValues, { shouldDirty: false });
      }
    }
  });
};

export const CheckDefaultValues = (
  fieldStates: Record<string, IRuntimeFieldState>,
  formValues: IEntityData,
  setValue: UseFormSetValue<IEntityData>
) => {
  if (isEmpty(fieldStates) || isEmpty(formValues)) return;

  Object.keys(fieldStates).forEach(fieldName => {
    const { defaultValue, hidden } = fieldStates[fieldName];
    if (!isNull(defaultValue) && isNull(getNestedFormValue(formValues, fieldName)) && !hidden) {
      // Per audit P1-2: applying defaults must NOT dirty the form. Dirtying
      // the form at mount triggers useBeforeUnload warnings and may cause
      // spurious autosaves of values the user never touched.
      setValue(`${fieldName}` as const, defaultValue, { shouldDirty: false });
    }
  });
};

export const InitOnCreateFormState = (
  configName: string,
  fields: Record<string, IFieldConfig>,
  defaultValues: IEntityData,
  parentEntity: IEntityData,
  userId: string,
  setValue: UseFormSetValue<IEntityData>,
  initFormState: (
    configName: string,
    defaultValues: IEntityData,
    fields: Record<string, IFieldConfig>,
    areAllFieldsReadonly?: boolean
  ) => IRuntimeFormState,
  getValues?: UseFormGetValues<IEntityData>
): { formState: IRuntimeFormState; initEntityData: IEntityData } => {
  const initEntityData: IEntityData = { ...defaultValues, Parent: { ...parentEntity } };

  // Execute computed values and apply defaults in topological order so a field
  // whose computedValue depends on another field (possibly also computed) reads
  // the already-computed value rather than undefined. Use nested writes so
  // dotted field names (e.g. "shipping.name") are legible to subsequent reads
  // via getNestedFormValue / ExpressionEngine. See audit finding P0-6.
  const graph = buildDependencyGraph(fields);
  const { sorted } = topologicalSort(graph);
  const fieldNames = sorted.length > 0 ? sorted : Object.keys(fields);

  for (const fieldName of fieldNames) {
    const config = fields[fieldName];
    if (!config) continue;
    if (config.computedValue && config.computeOnCreateOnly) {
      const result = ExecuteComputedValue(
        config.computedValue,
        initEntityData,
        fieldName,
        parentEntity,
        userId
      );
      if (result !== undefined) {
        setValue(`${fieldName}` as const, result);
        setNestedFormValue(initEntityData, fieldName, result);
      }
    }
    if (config.defaultValue !== undefined && isNull(getNestedFormValue(initEntityData, fieldName))) {
      setValue(`${fieldName}` as const, config.defaultValue);
      setNestedFormValue(initEntityData, fieldName, config.defaultValue);
    }
  }

  // If caller passed getValues, rebuild initEntityData from the RHF store so
  // the returned data is the authoritative form state.
  const finalEntityData: IEntityData = getValues
    ? { ...(getValues() as IEntityData), Parent: initEntityData.Parent }
    : initEntityData;

  return {
    formState: initFormState(configName, finalEntityData, fields, false),
    initEntityData: finalEntityData,
  };
};

export const InitOnEditFormState = (
  configName: string,
  fields: Record<string, IFieldConfig>,
  defaultValues: IEntityData,
  areAllFieldsReadonly: boolean,
  initFormState: (
    configName: string,
    defaultValues: IEntityData,
    fields: Record<string, IFieldConfig>,
    areAllFieldsReadonly?: boolean
  ) => IRuntimeFormState
): { formState: IRuntimeFormState; initEntityData: IEntityData } => {
  return {
    formState: initFormState(configName, defaultValues, fields, areAllFieldsReadonly),
    initEntityData: defaultValues,
  };
};

export const ShowField = (filterText?: string, value?: SubEntityType, label?: string): boolean => {
  if (!filterText) return true;
  const valueStr = JSON.stringify(value)?.toLowerCase();
  const labelStr = label?.toLowerCase();
  return (valueStr?.includes(filterText.toLowerCase()) ?? false) ||
    (labelStr?.includes(filterText.toLowerCase()) ?? false);
};

export const GetFieldsToRender = (
  fieldRenderLimit: number,
  fieldOrder: string[],
  fieldStates?: Record<string, IRuntimeFieldState>
): IFieldToRender[] => {
  if (fieldRenderLimit) {
    const fieldsToRender: IFieldToRender[] = [];
    let count = 0;
    fieldOrder.forEach(fieldName => {
      if (fieldStates?.[fieldName]?.hidden) return;
      if (count === fieldRenderLimit) {
        fieldsToRender.push({ fieldName, softHidden: true });
      } else {
        fieldsToRender.push({ fieldName, softHidden: false });
        count += 1;
      }
    });
    return fieldsToRender;
  }
  return fieldOrder?.map(fieldName => ({ fieldName, softHidden: false }));
};

