import { IFieldProps } from "@form-eng/core";
import { Combobox, Option } from "@fluentui/react-components";
import type { ComboboxProps } from "@fluentui/react-components";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

const Autocomplete = (props: IFieldProps<{}>) => {
  const { fieldName, programName, entityType, entityId, value, readOnly, error, required, placeholder, options, setFieldValue } = props;

  const selectedText = options?.find(o => String(o.value) === String(value))?.label ?? (value as string) ?? "";

  const onOptionSelect: ComboboxProps["onOptionSelect"] = (_, data) => {
    setFieldValue(fieldName, data.optionValue ?? "");
  };

  const onInput: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    if (!event.target.value) {
      setFieldValue(fieldName, "");
    }
  };

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={selectedText} />;
  }

  return (
    <Combobox
      className={FieldClassName("fe-autocomplete", error)}
      value={selectedText}
      selectedOptions={value ? [String(value)] : []}
      onOptionSelect={onOptionSelect}
      onInput={onInput}
      placeholder={placeholder}
      freeform
      aria-invalid={!!error}
      aria-required={required}
      data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
    >
      {options?.map(option => (
        <Option key={String(option.value)} value={String(option.value)} disabled={option.disabled}>
          {option.label}
        </Option>
      ))}
    </Combobox>
  );
};

export default Autocomplete;
