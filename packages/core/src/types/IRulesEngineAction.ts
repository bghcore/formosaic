import { IRuntimeFormState } from "./IRuntimeFieldState";

/** Action type keys for the rules engine reducer */
export enum RulesEngineActionType {
  SET = "RULES_ENGINE_SET",
  UPDATE = "RULES_ENGINE_UPDATE",
  CLEAR = "RULES_ENGINE_CLEAR",
  CLEAR_PENDING_SETVALUE = "RULES_ENGINE_CLEAR_PENDING_SETVALUE",
}

export interface ISetRulesAction {
  readonly type: RulesEngineActionType.SET;
  readonly payload: {
    readonly configName: string;
    readonly formState: IRuntimeFormState;
  };
}

export interface IUpdateRulesAction {
  readonly type: RulesEngineActionType.UPDATE;
  readonly payload: {
    readonly configName: string;
    readonly formState: IRuntimeFormState;
  };
}

export interface IClearRulesAction {
  readonly type: RulesEngineActionType.CLEAR;
  readonly payload: {
    readonly configName?: string;
  };
}

export interface IClearPendingSetValueAction {
  readonly type: RulesEngineActionType.CLEAR_PENDING_SETVALUE;
  readonly payload: {
    readonly configName: string;
    /** Specific field names to clear. If omitted, clears pendingSetValue on every field. */
    readonly fieldNames?: readonly string[];
  };
}

export type RulesEngineAction =
  | ISetRulesAction
  | IUpdateRulesAction
  | IClearRulesAction
  | IClearPendingSetValueAction;
