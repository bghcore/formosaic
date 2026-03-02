import { ElxPanel, IContainerAction, PanelSize } from "@elixir/components";
import React from "react";
import { UseComponentConfigsDispatch, UseDynamicLayoutState } from "../../DynamicLayout";
import { ApiActions } from "../../DynamicLayout/Models/Enums";
import { IDynamicPanelProps } from "../../DynamicLayout/Models/IDynamicModals";
import { IHookPanelConfig } from "../Interfaces/IHookPanelConfig";
import { HookInlineFormStrings } from "../Strings";
import HookFormLoading from "./HookFormLoading";
import HookInlineFormWrapper from "./HookInlineFormWrapper";

interface IHookFormPanelProps {
  /**
   * Panel Config
   */
  panelConfig: IHookPanelConfig;

  /**
   * Dismiss Panel
   * @returns void
   */
  onDismiss: () => void;
}

export const HookFormPanel = (props: IHookFormPanelProps) => {
  const { panelConfig, onDismiss } = props;

  const { GetComponentConfigs } = UseComponentConfigsDispatch();
  const { appName } = UseDynamicLayoutState();

  const [loadedPanelConfig, setLoadedPanelConfig] = React.useState<IDynamicPanelProps>();
  const [panelActions, setPanelActions] = React.useState<IContainerAction[]>(undefined);
  const [loadedConfigName, setLoadedConfigName] = React.useState(undefined);

  const {
    entityId,
    entityType,
    programName,
    cxpIsRef,
    skipCallGetEntity,
    initDefaultValues,
    enableFilter,
    panelConfigName,
    parentEntityId
  } = panelConfig;

  /**
   * Load Panel Config
   */
  React.useEffect(() => {
    setLoadedConfigName(undefined);
    if (panelConfig && loadedConfigName !== panelConfigName) {
      GetComponentConfigs(appName, undefined, [panelConfigName])
        .then(configs => {
          if (configs && configs[panelConfigName]) {
            const config = configs[panelConfigName] as IDynamicPanelProps;

            setLoadedPanelConfig(config);
            setLoadedConfigName(panelConfigName);

            if (config.actions?.length > 0) {
              setPanelActions(config.actions);
            }
          } else {
            setLoadedConfigName(HookInlineFormStrings.na);
          }
        })
        .catch(() => {
          setLoadedConfigName(HookInlineFormStrings.na);
        });
    }
  }, [panelConfig]);

  const { configName, headerText, subHeaderText, size, apiActionDetails } = loadedPanelConfig ?? {
    configName: undefined,
    headerText: undefined,
    subHeaderText: undefined,
    size: undefined,
    apiActionDetails: undefined
  };
  const {
    action,
    customSaveKey,
    customSaveCallbackKey,
    parentEntityType,
    entityPath,
    customGetUri
  } = apiActionDetails ?? {
    action: undefined,
    customSaveKey: undefined,
    customSaveCallbackKey: undefined,
    parentEntityType: undefined,
    entityPath: undefined,
    customGetUri: undefined
  };

  const isCreate = action === ApiActions.create;

  return (
    <ElxPanel
      className="hook-inline-form-panel"
      headerText={headerText}
      subHeaderText={subHeaderText}
      size={size ?? PanelSize.medium}
      isOpen
      actions={panelActions}
      onDismiss={onDismiss}
    >
      {loadedPanelConfig ? (
        <HookInlineFormWrapper
          entityId={!isCreate ? entityId : undefined}
          entityType={entityType}
          configName={configName}
          parentEntityId={parentEntityId}
          parentEntityType={parentEntityType}
          entityPath={entityPath}
          programName={programName}
          panelProps={{
            actions: panelActions,
            apiActionDetails,
            setPanelActions,
            onDismiss
          }}
          callGetEntity={!skipCallGetEntity}
          inPanel
          cxpIsRef={cxpIsRef}
          isCreate={isCreate}
          customSaveKey={customSaveKey}
          customSaveCallbackKey={customSaveCallbackKey}
          initDefaultValues={initDefaultValues}
          enableFilter={enableFilter}
          customGetUri={customGetUri}
        />
      ) : (
        <HookFormLoading inPanel />
      )}
    </ElxPanel>
  );
};
