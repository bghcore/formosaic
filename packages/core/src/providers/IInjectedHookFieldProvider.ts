import { Dictionary } from "../utils";
import React from "react";

export interface IInjectedHookFieldProvider {
  injectedFields: Dictionary<React.JSX.Element>;
  setInjectedFields: (injectedFields: Dictionary<React.JSX.Element>) => void;
}
