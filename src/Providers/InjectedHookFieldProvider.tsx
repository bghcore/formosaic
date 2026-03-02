import { Dictionary } from "@cxpui/common";
import React from "react";
import { IInjectedHookFieldProvider } from "./IInjectedHookFieldProvider";

const InjectedHookFieldContext: React.Context<IInjectedHookFieldProvider> = React.createContext(undefined);

export function UseInjectedHookFieldContext() {
  const context = React.useContext(InjectedHookFieldContext);
  if (context === undefined) {
    throw new Error("InjectedHookFieldContext must be used within InjectedHookFieldProvider");
  }
  return context;
}

export const InjectedHookFieldProvider: React.FC<React.PropsWithChildren<{}>> = (
  props: React.PropsWithChildren<{}>
): JSX.Element => {
  const [injectedFields, setInjectedFields] = React.useState<Dictionary<JSX.Element>>(undefined);

  const InjectedHookFieldContextProvider: IInjectedHookFieldProvider = {
    injectedFields,
    setInjectedFields
  };

  return (
    <InjectedHookFieldContext.Provider value={InjectedHookFieldContextProvider}>
      {props.children}
    </InjectedHookFieldContext.Provider>
  );
};
