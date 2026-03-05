import React, { createContext, useReducer, useMemo, type ReactNode } from "react";
import type { IDesignerState } from "../types/IDesignerState";
import { createInitialDesignerState } from "../types/IDesignerState";
import type { IDesignerAction } from "../types/IDesignerAction";
import { designerReducer } from "./designerReducer";

export interface IDesignerContextValue {
  state: IDesignerState;
  dispatch: React.Dispatch<IDesignerAction>;
}

export const DesignerContext = createContext<IDesignerContextValue | null>(null);

export interface IDesignerProviderProps {
  children: ReactNode;
  /** Optional initial state (e.g., for pre-loading a config) */
  initialState?: IDesignerState;
}

export function DesignerProvider({ children, initialState }: IDesignerProviderProps) {
  const [state, dispatch] = useReducer(
    designerReducer,
    initialState ?? createInitialDesignerState(),
  );

  const value = useMemo<IDesignerContextValue>(
    () => ({ state, dispatch }),
    [state, dispatch],
  );

  return (
    <DesignerContext.Provider value={value}>
      {children}
    </DesignerContext.Provider>
  );
}
