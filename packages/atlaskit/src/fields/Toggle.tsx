import { IFieldProps } from "@formosaic/core";
import { convertBooleanToYesOrNoText } from "../helpers";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState } from "../helpers";

const Toggle = (props: IFieldProps<{}>) => {
  const {
    fieldName, testId, value, readOnly, error, required, label, setFieldValue,
    errorCount, saving, savePending, options, optionsLoading, type, description, helpText, placeholder, config,
    ...rest
  } = props;

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(fieldName, event.target.checked);
  };

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={convertBooleanToYesOrNoText(value as boolean)} />;
  }

  return (
    <label
      className="ak-toggle"
      data-field-type="Toggle"
      data-field-state={getFieldState({ error, required, readOnly })}
    >
      <input
        aria-invalid={!!error}
        aria-required={required}
        {...rest}
        type="checkbox"
        className="ak-toggle__input"
        role="switch"
        checked={!!value}
        onChange={onChange}
        data-testid={GetFieldDataTestId(fieldName, testId)}
      />
      <span className="ak-toggle__label">{label}</span>
    </label>
  );
};

export default Toggle;
