import { IFieldProps, convertBooleanToYesOrNoText } from "@form-eng/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState } from "../helpers";

const Toggle = (props: IFieldProps<{}>) => {
  const { fieldName, programName, entityType, entityId, value, readOnly, error, required, label, setFieldValue } = props;

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(fieldName, event.target.checked);
  };

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={convertBooleanToYesOrNoText(value as boolean)} />;
  }

  return (
    <label
      className="df-toggle"
      data-field-type="Toggle"
      data-field-state={getFieldState({ error, required, readOnly })}
    >
      <input
        type="checkbox"
        className="df-toggle__input"
        role="switch"
        checked={!!value}
        onChange={onChange}
        aria-invalid={!!error}
        aria-required={required}
        data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
      />
      <span className="df-toggle__label">{label}</span>
    </label>
  );
};

export default Toggle;
