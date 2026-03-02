import { Dictionary, IEntityData } from "@cxpui/common";

export interface IHookInlineFormPanelProvider {
  /**
   * Init Panel
   * @param panelConfigName Panel Config Name
   * @param entityId Entity Id
   * @param entityType Entity Type
   * @param programName Program Name
   * @param cxpIsRef Is CXP Ref
   * @param skipCallGetEntity Skip Call Get Entity
   * @param initDefaultValues Init Default Values
   * @param enableFilter Enable Filter
   * @param parentEntityId Parent Entity Id
   * @returns void
   */
  initPanel: (
    panelConfigName: string,
    entityId: string,
    entityType: string,
    programName: string,
    cxpIsRef: boolean,
    skipCallGetEntity: boolean,
    initDefaultValues?: IEntityData,
    enableFilter?: boolean,
    parentEntityId?: string
  ) => void;

  /**
   * Dictionary of custom save functions
   */
  customSaveFunctions: Dictionary<(entityData: IEntityData) => Promise<IEntityData>>;

  /**
   * Set Dictionary of custom save functions
   * @param customSaveFunctions Dictionary of custom save functions
   * @returns void
   */
  setCustomSaveFunctions: (customSaveFunctions: Dictionary<(entityData: IEntityData) => Promise<IEntityData>>) => void;

  /**
   * Dictionary of custom save callbacks
   */
  customSaveCallbacks: Dictionary<(entityData: IEntityData) => void>;

  /**
   * Set Dictionary of custom save callbacks
   * @param customSaveCallbacks Dictionary of custom save callbacks
   * @returns void
   */
  setCustomSaveCallbacks: (customSaveCallbacks: Dictionary<(entityData: IEntityData) => void>) => void;
}
