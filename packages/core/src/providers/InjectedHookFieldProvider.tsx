import { Dictionary } from "../utils";
import React from "react";
import { IInjectedHookFieldProvider } from "./IInjectedHookFieldProvider";

const InjectedHookFieldContext: React.Context<IInjectedHookFieldProvider> = React.createContext(undefined as unknown as IInjectedHookFieldProvider);

export function UseInjectedHookFieldContext() {
  const context = React.useContext(InjectedHookFieldContext);
  if (context === undefined) {
    throw new Error(
      "UseInjectedHookFieldContext() was called outside of <InjectedHookFieldProvider>. " +
      "Required hierarchy: <BusinessRulesProvider> > <InjectedHookFieldProvider> > <HookInlineForm>"
    );
  }
  return context;
}

export const InjectedHookFieldProvider: React.FC<React.PropsWithChildren<{}>> = (
  props: React.PropsWithChildren<{}>
): React.JSX.Element => {
  const [injectedFields, setInjectedFields] = React.useState<Dictionary<React.JSX.Element>>(undefined as unknown as Dictionary<React.JSX.Element>);

  const providerValue: IInjectedHookFieldProvider = React.useMemo(() => ({
    injectedFields,
    setInjectedFields
  }), [injectedFields]);

  return (
    <InjectedHookFieldContext.Provider value={providerValue}>
      {props.children}
    </InjectedHookFieldContext.Provider>
  );
};
