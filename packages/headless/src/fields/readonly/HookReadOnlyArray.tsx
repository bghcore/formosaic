import { IFieldProps } from "@bghcore/dynamic-forms-core";
import React from "react";

const HookReadOnlyArray = (props: IFieldProps<{}>) => {
  const { fieldName, value } = props;
  const items = (value as string[]) ?? [];

  if (items.length === 0) {
    return <span className="df-read-only-text" data-field-type="ReadOnlyArray">-</span>;
  }

  return (
    <ul
      className="df-read-only-array"
      data-field-type="ReadOnlyArray"
      data-field-state="readonly"
      id={`${fieldName}-read-only`}
    >
      {items.map((v, i) => (
        <li key={i}>{v}</li>
      ))}
    </ul>
  );
};

export default HookReadOnlyArray;
