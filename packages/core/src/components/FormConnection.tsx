import { ICondition } from "../types/ICondition";

export interface IFormConnectionProps {
  name: string;
  when: ICondition;
  source: { fragment: string; port: string };
  target: { fragment: string; port: string };
  effect: "copyValues" | "hide" | "readOnly" | "computeFrom";
}

/** Declaration-only component. Returns null. Props read by ComposedForm. */
export function FormConnection(_props: IFormConnectionProps): null {
  return null;
}
FormConnection.displayName = "FormConnection";
