import { IContainerAction } from "@elixir/components";
import { IApiActionProps } from "../../DynamicLayout/Models/IDynamicModals";

export interface IHookFormPanelActionProps {
  /**
   * On Dismiss
   * @returns Void
   */
  onDismiss?: () => void;

  /**
   * Actions
   */
  actions: IContainerAction[];

  /**
   * Set Panel Actions
   * @param actions Actions
   * @returns void
   */
  setPanelActions: (actions: IContainerAction[]) => void;

  /**
   * Api Action Details from Panel Config
   */
  apiActionDetails?: IApiActionProps;

  /**
   * Keep Open On Save
   */
  keepOpenOnSave?: boolean;
}
