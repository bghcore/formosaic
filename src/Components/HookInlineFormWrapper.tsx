import { Dictionary, IEntityData, SubEntityType, isEmpty, isNull, isStringEmpty } from "@cxpui/common";
import React from "react";
import { IPropertySchema } from "../../DataModelsSchema/Models/DataModelsSchema";
import {
  UseComponentConfigsDispatch,
  UseEntitiesDispatch,
  UseEntitiesState,
  getEntityDetails
} from "../../DynamicLayout";
import { UseDynamicLayoutState } from "../../DynamicLayout/Providers/DynamicLayoutProvider";
import useShallowEqualSelector from "../../Hooks/ShalowEqualSelector";
import { IStateStore } from "../../Shared/Store/IStateStore";
import { HookInlineFormConstants } from "../Constants";
import { CombineSchemaConfig, GetChildEntity } from "../Helpers/HookInlineFormHelper";
import { IFieldConfig } from "../Interfaces/IFieldConfig";
import { IHookInlineFormSharedProps } from "../Interfaces/IHookInlineFormSharedProps";
import { UseHookInlineFormPanelContext } from "../Providers/HookInlineFormPanelProvider";
import HookFormLoading from "./HookFormLoading";
import { HookInlineForm } from "./HookInlineForm";
import HttpServiceProvider from "@cxpui/common/dist/Http/HttpService";

export interface IHookInlineFormWrapperProps extends IHookInlineFormSharedProps {
  loadingShimmerCount?: number;
  callGetEntity?: boolean;
  cxpIsRef?: boolean;
  initDefaultValues?: IEntityData;
  customGetUri?: string;
  skipGetParent?: boolean;
}

// eslint-disable-next-line max-lines-per-function
export const HookInlineFormWrapper = (props: IHookInlineFormWrapperProps) => {
  const {
    entityId,
    entityType,
    programName,
    parentEntityId,
    parentEntityType,
    entityPath,
    configName,
    loadingShimmerCount,
    inPanel,
    callGetEntity,
    cxpIsRef,
    isCreate,
    customSaveKey,
    initDefaultValues,
    customGetUri,
    skipGetParent
  } = props;

  const { GetComponentConfigs } = UseComponentConfigsDispatch();
  const { appName } = UseDynamicLayoutState();
  const { getEntity, saveEntityData, createEntity } = UseEntitiesDispatch();
  const { allEntities } = UseEntitiesState();
  const dataModelSchema = useShallowEqualSelector((state: IStateStore) => state.datamodelSchema);
  const { customSaveFunctions } = UseHookInlineFormPanelContext();

  const [loadedConfigName, setLoadedConfigName] = React.useState<string>(undefined);
  const [defaultValues, setDefaultValues] = React.useState<IEntityData>(undefined);
  const [parentEntity, setParentEntity] = React.useState<IEntityData>(undefined);
  const [propertyConfigs, setPropertyConfigs] = React.useState<Dictionary<IFieldConfig>>(undefined);
  const [schemaConfigs, setSchemaConfigs] = React.useState<Dictionary<IPropertySchema>>(undefined);

  const [fieldConfigs, setFieldConfigs] = React.useState<Dictionary<IFieldConfig>>(undefined);

  const gettingEntity = React.useRef<boolean>(false);

  const isChildEntity = !isNull(parentEntityId) && !isNull(parentEntityType) && !isNull(entityPath);

  /**
   * Get & Set Property Configs
   */
  React.useEffect(() => {
    setLoadedConfigName(undefined);
    if (loadedConfigName !== configName) {
      // Get configs from meta data service
      GetComponentConfigs(appName, undefined, [configName])
        .then(configs => {
          if (configs && configs[configName]) {
            setPropertyConfigs(configs[configName] as Dictionary<IFieldConfig>);
            setLoadedConfigName(configName);
          } else {
            setLoadedConfigName(HookInlineFormConstants.na);
          }
        })
        .catch(() => {
          setLoadedConfigName(HookInlineFormConstants.na);
        });
    }
  }, [configName]);

  /**
   * Initialize Default Values for form
   */
  React.useEffect(() => {
    if (customGetUri) {
      // Editing Custom Entity - Get data via custom Api URI
      HttpServiceProvider.provide("CxpService")
        .get(customGetUri.replace("{entityId}", entityId))
        .then(entityResponse => {
          if (entityResponse?.isSuccess) {
            setDefaultValues(entityResponse.result as IEntityData);
          }
        });
    } else if (
      !cxpIsRef &&
      !isCreate &&
      parentEntityId &&
      (!defaultValues || defaultValues?.EntityId !== parentEntityId) &&
      parentEntityType &&
      entityPath &&
      allEntities?.[parentEntityType]?.entities?.[parentEntityId]?.[entityPath]
    ) {
      // Editing Direct Child Entity that is within the parent entity via entityPath
      setDefaultValues(GetChildEntity(entityId, allEntities[parentEntityType].entities[parentEntityId], entityPath));
    } else if (
      !isCreate &&
      (!defaultValues || defaultValues?.EntityId !== entityId) &&
      callGetEntity &&
      !gettingEntity?.current
    ) {
      // Editing Entity - Get latest data from back-end
      gettingEntity.current = true;
      getEntity(entityId, entityType, programName).then(entity => {
        setDefaultValues(entity);
      });
    } else if (!isCreate && (!defaultValues || defaultValues?.EntityId !== entityId)) {
      // Editing Entity - Get data from allEntities
      setDefaultValues(getEntityDetails(allEntities, entityType, entityId));
    } else if (isCreate && !defaultValues) {
      // Creating New Entity
      const onCreateDefaultValues = {
        EntityType: entityType,
        ProgramName: programName,
        CxpIsRef: cxpIsRef
      };
      setDefaultValues(initDefaultValues ? { ...onCreateDefaultValues, ...initDefaultValues } : onCreateDefaultValues);
    }
  }, [entityId, entityType, parentEntityId, parentEntityType, entityPath, callGetEntity]);

  /**
   * Get Parent Entity Data (Always API call)
   */
  React.useEffect(() => {
    if (parentEntityId && parentEntityType && !skipGetParent) {
      getEntity(parentEntityId, parentEntityType, programName).then(entity => {
        setParentEntity(entity);
      });
    } else {
      setParentEntity({});
    }
  }, [parentEntityId, parentEntityType]);

  /**
   * Set Schema Config
   */
  React.useEffect(() => {
    if (
      !isEmpty(dataModelSchema) &&
      !isEmpty(dataModelSchema[programName]) &&
      !isEmpty(dataModelSchema[programName][entityType])
    ) {
      setSchemaConfigs(dataModelSchema[programName][entityType]);
    }
  }, [dataModelSchema, programName, entityType]);

  /**
   * Combine Schema Configs
   */
  React.useEffect(() => {
    if (propertyConfigs && schemaConfigs) {
      const combinedConfigs = CombineSchemaConfig(propertyConfigs, schemaConfigs);
      setFieldConfigs(combinedConfigs);
    }
  }, [propertyConfigs, schemaConfigs]);

  const createNewEntity = (data: IEntityData) => {
    return createEntity(cxpIsRef, entityPath, data, allEntities, cxpIsRef ? entityId : parentEntityId);
  };

  const saveEntity = (data: IEntityData, dirtyFieldNames?: string[]) => {
    const entityPayload: Dictionary<SubEntityType> = {};

    dirtyFieldNames.forEach(fieldName => {
      if (fieldName === HookInlineFormConstants.newStatusReasonDescription) {
        // Special save case for StatusReasonDescription
        const previousStatusReasonDescription = `${data[HookInlineFormConstants.statusReasonDescription]}`;
        entityPayload[HookInlineFormConstants.statusReasonDescription] = `${data[fieldName]}${
          !isStringEmpty(previousStatusReasonDescription) ? `\n${previousStatusReasonDescription}` : ""
        }`;
      } else {
        entityPayload[fieldName] = data[fieldName];
      }
    });

    return saveEntityData(
      "",
      {
        EntityId: entityId,
        EntityType: entityType,
        ProgramName: programName
      },
      entityPayload,
      {},
      entityId,
      false,
      isChildEntity
        ? `${programName}/${parentEntityType}/${parentEntityId}/${entityPath}/${entityId}`
        : `${programName}/${entityType}/${entityId}`
    );
  };

  const saveData = (entityData: IEntityData, dirtyFieldNames?: string[]): Promise<IEntityData> => {
    const customSaveFunction = customSaveFunctions[customSaveKey];
    if (customSaveFunction) {
      return customSaveFunction(entityData);
    } else if (isCreate) {
      return createNewEntity(entityData);
    } else {
      return saveEntity(entityData, dirtyFieldNames);
    }
  };

  return loadedConfigName && fieldConfigs && defaultValues && parentEntity ? (
    <HookInlineForm
      fieldConfigs={fieldConfigs}
      defaultValues={defaultValues}
      parentEntity={parentEntity}
      isChildEntity={isChildEntity}
      saveData={saveData}
      {...props}
    />
  ) : (
    <HookFormLoading loadingShimmerCount={loadingShimmerCount} inPanel={inPanel} />
  );
};

export default HookInlineFormWrapper;
