import { IFieldProps } from "@formosaic/core";
import { Combobox, Option } from "@fluentui/react-components";
import type { ComboboxProps } from "@fluentui/react-components";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

interface IAutocompleteConfig {
  placeHolder?: string;
}

const Autocomplete = (props: IFieldProps<IAutocompleteConfig>) => {
  const {
    fieldName, testId, value, readOnly, error, required, placeholder, options, setFieldValue, config,
    errorCount, saving, savePending, optionsLoading, label, type, description, helpText,
    ...rest
  } = props;

  const selectedText = options?.find(o => String(o.value) === String(value))?.label ?? (value as string) ?? "";

  const onOptionSelect: ComboboxProps["onOptionSelect"] = (_, data) => {
    setFieldValue(fieldName, data.optionValue ?? "");
  };

  const onInput: React.FormEventHandler<HTMLInputElement> = (event) => {
    if (!(event.target as HTMLInputElement).value) {
      setFieldValue(fieldName, "");
    }
  };

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={selectedText} />;
  }

  return (
    <Combobox
      aria-invalid={!!error}
      aria-required={required}
      {...rest}
      className={FieldClassName("fe-autocomplete", error)}
      value={selectedText}
      selectedOptions={value ? [String(value)] : []}
      onOptionSelect={onOptionSelect}
      onInput={onInput}
      placeholder={placeholder ?? config?.placeHolder}
      freeform
      data-testid={GetFieldDataTestId(fieldName, testId)}
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
