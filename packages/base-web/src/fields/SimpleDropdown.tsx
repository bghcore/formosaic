import { IFieldProps } from "@formosaic/core";
import { Select } from "baseui/select";
import type { OnChangeParams } from "baseui/select";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId } from "../helpers";

interface ISimpleDropdownProps {
  dropdownOptions?: string[];
  placeHolder?: string;
}

const SimpleDropdown = (props: IFieldProps<ISimpleDropdownProps>) => {
  const { fieldName, testId, value, readOnly, config, error, required, placeholder, setFieldValue } = props;

  const simpleOptions = config?.dropdownOptions ?? [];

  const selectOptions = simpleOptions.map(option => ({
    id: option,
    label: option,
  }));

  const selectedOption = selectOptions.find(o => o.id === String(value));

  const onChange = (params: OnChangeParams) => {
    if (params.value.length > 0) {
      setFieldValue(fieldName, params.value[0].id);
    } else {
      setFieldValue(fieldName, null);
    }
  };

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={value as string} />;
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
            "data-testid": GetFieldDataTestId(fieldName, testId),
          },
        },
      }}
    />
  );
};

export default SimpleDropdown;
