import React from "react";
import { IInjectedFieldProvider } from "./IInjectedFieldProvider";

const InjectedFieldContext: React.Context<IInjectedFieldProvider> = React.createContext(
  undefined as unknown as IInjectedFieldProvider
);

export function UseInjectedFieldContext() {
  const context = React.useContext(InjectedFieldContext);
  if (context === undefined) {
    throw new Error(
      "UseInjectedFieldContext() was called outside of <InjectedFieldProvider>. " +
      "Required hierarchy: <RulesEngineProvider> > <InjectedFieldProvider> > <FormEngine>"
    );
  }
  return context;
}


interface InjectedFieldProviderProps {
  /** Optional initial field registry. If provided, fields are set immediately. */
  injectedFields?: Record<string, React.JSX.Element>;
  children?: React.ReactNode;
}

export const InjectedFieldProvider: React.FC<InjectedFieldProviderProps> = (
  props: InjectedFieldProviderProps
): React.JSX.Element => {
  const [injectedFields, setInjectedFields] = React.useState<Record<string, React.JSX.Element>>(
    (props.injectedFields ?? undefined) as unknown as Record<string, React.JSX.Element>
  );

  const providerValue: IInjectedFieldProvider = React.useMemo(() => ({
    injectedFields,
    setInjectedFields,
  }), [injectedFields]);

  return (
    <InjectedFieldContext.Provider value={providerValue}>
      {props.children}
    </InjectedFieldContext.Provider>
  );
};

