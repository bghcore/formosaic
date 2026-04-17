import { IFieldProps } from "@formosaic/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

interface IDropdownProps {
  placeHolder?: string;
  setDefaultKeyIfOnlyOneOption?: boolean;
}

const Dropdown = (props: IFieldProps<IDropdownProps>) => {
  const {
    fieldName, testId, value, readOnly, config, error, required, options, placeholder, setFieldValue,
    errorCount, saving, savePending, optionsLoading, label, type, description, helpText,
    ...rest
  } = props;

  const onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFieldValue(fieldName, event.target.value);
  };

  React.useEffect(() => {
    if (!value && !readOnly && config?.setDefaultKeyIfOnlyOneOption && options?.length === 1) {
      setFieldValue(fieldName, String(options[0].value));
    }
  }, [options]);

  const selectedLabel = options?.find(o => String(o.value) === String(value))?.label;

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={selectedLabel ?? (value as string)} />;
  }

  return (
    <select
      aria-invalid={!!error}
      aria-required={required}
      {...rest}
      className={FieldClassName("fe-dropdown", error)}
      value={(value as string) ?? ""}
      onChange={onChange}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    >
      <option value="">{placeholder ?? config?.placeHolder ?? ""}</option>
      {options?.map(option => (
        <option key={String(option.value)} value={String(option.value)} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Dropdown;
