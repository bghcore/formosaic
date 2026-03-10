import { IFieldProps } from "@form-eng/core";
import { Select } from "baseui/select";
import type { OnChangeParams } from "baseui/select";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId } from "../helpers";

interface IDropdownProps {
  placeHolder?: string;
  setDefaultKeyIfOnlyOneOption?: boolean;
}

const Dropdown = (props: IFieldProps<IDropdownProps>) => {
  const { fieldName, programName, entityType, entityId, value, readOnly, config, error, required, options, placeholder, setFieldValue } = props;

  const selectOptions = options?.map(option => ({
    id: String(option.value),
    label: option.label,
    disabled: option.disabled,
  })) ?? [];

  const selectedOption = selectOptions.find(o => o.id === String(value));

  const onChange = (params: OnChangeParams) => {
    if (params.value.length > 0) {
      setFieldValue(fieldName, params.value[0].id);
    } else {
      setFieldValue(fieldName, null);
    }
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
    <Select
      options={selectOptions}
      value={selectedOption ? [selectedOption] : []}
      onChange={onChange}
      placeholder={placeholder ?? config?.placeHolder}
      clearable
      error={!!error}
      overrides={{
        Root: {
          props: {
            "aria-invalid": !!error,
            "aria-required": required,
            "data-testid": GetFieldDataTestId(fieldName, programName, entityType, entityId),
          },
        },
      }}
    />
  );
};

export default Dropdown;
