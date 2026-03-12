import { IFieldProps } from "@formosaic/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState } from "../helpers";
import { CheckboxGroup as AriaCheckboxGroup, Checkbox } from "react-aria-components";

const CheckboxGroup = (props: IFieldProps<{}>) => {
  const { fieldName, testId, value, readOnly, error, required, options, setFieldValue } = props;

  const selected = Array.isArray(value) ? (value as string[]) : [];

  if (readOnly) {
    const labels = options
      ?.filter(o => selected.includes(String(o.value)))
      .map(o => o.label)
      .join(", ");
    return <ReadOnlyText fieldName={fieldName} value={labels ?? ""} />;
  }

  return (
    <AriaCheckboxGroup
      className="df-checkbox-group"
      value={selected}
      onChange={(vals) => setFieldValue(fieldName, vals)}
      isInvalid={!!error}
      isRequired={required}
      data-field-type="CheckboxGroup"
      data-field-state={getFieldState({ error, required, readOnly })}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    >
      {options?.map(option => (
        <Checkbox
          key={String(option.value)}
          value={String(option.value)}
          className="df-checkbox-group__option"
          isDisabled={option.disabled}
        >
          {option.label}
        </Checkbox>
      ))}
    </AriaCheckboxGroup>
  );
};

export default CheckboxGroup;
