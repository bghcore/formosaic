import { IEntityData } from "@cxpui/common";
import { IHookFormPanelActionProps } from "./IHookFormPanelActionProps";

/**
 * Props shared by HookInlineForm and HookInlineFormWrapper
 */
export interface IHookInlineFormSharedProps {
  /**
   * Entity Id
   */
  entityId?: string;

  /**
   * Entity Type
   */
  entityType?: string;

  /**
   * Program Name
   */
  programName: string;

  /**
   * Config Name
   */
  configName: string;

  /**
   * Parent Entity Id
   */
  parentEntityId?: string;

  /**
   * Parent Entity Type
   */
  parentEntityType?: string;

  /**
   * Entity Path (Child Entity)
   */
  entityPath?: string;

  /**
   * Are all fields readonly
   */
  areAllFieldsReadonly?: boolean;

  /**
   * Expand Cutoff Count
   */
  expandCutoffCount?: number;

  /**
   * Collapsed Max Height
   */
  collapsedMaxHeight?: number;

  /**
   * In Panel
   */
  inPanel?: boolean;

  /**
   * Panel Props
   */
  panelProps?: IHookFormPanelActionProps;

  /**
   * Parent Entity
   */
  parentEntity?: IEntityData;

  /**
   * Is Create from API Actions in panel config
   */
  isCreate?: boolean;

  /**
   * Custom Save Key
   */
  customSaveKey?: string;

  /**
   * Custom Save Callback Key
   */
  customSaveCallbackKey?: string;

  /**
   * Enable Search box filter
   */
  enableFilter?: boolean;
}
