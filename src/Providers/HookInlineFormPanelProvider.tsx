import { Dictionary, IEntityData } from "@cxpui/common";
import React from "react";
import { HookFormPanel } from "../Components/HookFormPanel";
import { IHookPanelConfig } from "../Interfaces/IHookPanelConfig";
import { IHookInlineFormPanelProvider } from "./IHookInlineFormPanelProvider";

const HookInlineFormPanelContext: React.Context<IHookInlineFormPanelProvider> = React.createContext(undefined);

export function UseHookInlineFormPanelContext() {
  const context = React.useContext(HookInlineFormPanelContext);
  if (context === undefined) {
    throw new Error("HookInlineFormPanelContext must be used within HookInlineFormProvider");
  }
  return context;
}

export const HookInlineFormPanelProvider: React.FC<React.PropsWithChildren<{}>> = (
  props: React.PropsWithChildren<{}>
): JSX.Element => {
  const [customSaveFunctions, setCustomSaveFunctions] = React.useState<
    Dictionary<(entityData: IEntityData) => Promise<IEntityData>>
  >();
  const [customSaveCallbacks, setCustomSaveCallbacks] = React.useState<Dictionary<(entityData: IEntityData) => void>>();

  const [panelConfig, setPanelConfig] = React.useState<IHookPanelConfig>(undefined);

  const initPanel = (
    panelConfigName: string,
    entityId: string,
    entityType: string,
    programName: string,
    cxpIsRef: boolean,
    skipCallGetEntity: boolean,
    initDefaultValues?: IEntityData,
    enableFilter?: boolean,
    parentEntityId?: string
  ) => {
    setPanelConfig({
      panelConfigName,
      entityId,
      entityType,
      programName,
      cxpIsRef,
      skipCallGetEntity,
      initDefaultValues,
      enableFilter,
      parentEntityId
    });
  };

  const HookInlineFormPanelProvider: IHookInlineFormPanelProvider = {
    initPanel,
    customSaveFunctions,
    setCustomSaveFunctions,
    customSaveCallbacks,
    setCustomSaveCallbacks
  };

  const onDismiss = () => {
    setPanelConfig(undefined);
  };

  return (
    <HookInlineFormPanelContext.Provider value={HookInlineFormPanelProvider}>
      {panelConfig && <HookFormPanel panelConfig={panelConfig} onDismiss={onDismiss} />}
      {props.children}
    </HookInlineFormPanelContext.Provider>
  );
};
