import { Dictionary } from "@cxpui/common";

export interface IInjectedHookFieldProvider {
  /**
   * Fields that are injected
   */
  injectedFields: Dictionary<JSX.Element>;

  /**
   * Set Injected Fields
   */
  setInjectedFields: (injectedFields: Dictionary<JSX.Element>) => void;
}
