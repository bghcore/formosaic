import { IEntityData } from "@cxpui/common";

export interface IHookPanelConfig {
  /**
   * Panel Config Name
   */
  panelConfigName: string;

  /**
   * Entity Id
   */
  entityId: string;

  /**
   * Entity Type
   */
  entityType: string;

  /**
   * Program Name
   */
  programName: string;

  /**
   * CXP Is Ref
   */
  cxpIsRef?: boolean;

  /**
   * Skip Call Get Entity
   */
  skipCallGetEntity?: boolean;

  /**
   * Init Default Values in form
   */
  initDefaultValues?: IEntityData;

  /**
   * Enable global Filter on field values and labels
   */
  enableFilter?: boolean;

  /**
   * Parent Entity Id
   */
  parentEntityId?: string;
}
