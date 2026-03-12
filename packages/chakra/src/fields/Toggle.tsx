import { IFieldProps } from "@formosaic/core";
import { convertBooleanToYesOrNoText } from "../helpers";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState } from "../helpers";

const Toggle = (props: IFieldProps<{}>) => {
  const { fieldName, testId, value, readOnly, error, required, label, setFieldValue } = props;

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(fieldName, event.target.checked);
  };

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={convertBooleanToYesOrNoText(value as boolean)} />;
  }

  return (
    <label
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        cursor: "pointer",
      }}
      data-field-type="Toggle"
      data-field-state={getFieldState({ error, required, readOnly })}
    >
      <input
        type="checkbox"
        role="switch"
        checked={!!value}
        onChange={onChange}
        aria-invalid={!!error}
        aria-required={required}
        data-testid={GetFieldDataTestId(fieldName, testId)}
        style={{ accentColor: "var(--chakra-colors-blue-500, #3182CE)" }}
      />
      {label && <span style={{ fontSize: "var(--chakra-fontSizes-md, 16px)" }}>{label}</span>}
    </label>
  );
};

export default Toggle;
