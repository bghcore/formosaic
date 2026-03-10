import { IFieldProps } from "@form-eng/core";
import { Select } from "@mantine/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

interface IDropdownProps {
  placeHolder?: string;
  setDefaultKeyIfOnlyOneOption?: boolean;
}

const Dropdown = (props: IFieldProps<IDropdownProps>) => {
  const { fieldName, programName, entityType, entityId, value, readOnly, config, error, required, options, placeholder, setFieldValue } = props;

  const onChange = (val: string | null) => {
    setFieldValue(fieldName, val ?? "");
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

  const data = options?.map(option => ({
    value: String(option.value),
    label: option.label,
    disabled: option.disabled,
  })) ?? [];

  return (
    <Select
      className={FieldClassName("fe-dropdown", error)}
      value={value ? String(value) : null}
      onChange={onChange}
      data={data}
      placeholder={placeholder ?? config?.placeHolder}
      clearable
      required={required}
      aria-invalid={!!error}
      aria-required={required}
      data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
    />
  );
};

export default Dropdown;
