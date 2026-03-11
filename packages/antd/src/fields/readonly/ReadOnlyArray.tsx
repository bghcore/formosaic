import { IFieldProps } from "@form-eng/core";
import React from "react";

const ReadOnlyArray = (props: IFieldProps<{}>) => {
  const { fieldName, value } = props;
  const items = (value as string[]) ?? [];

  if (items.length === 0) {
    return <span className="fe-read-only-text" data-field-type="ReadOnlyArray">-</span>;
  }

  return (
    <ul
      className="fe-read-only-array"
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

export default ReadOnlyArray;
