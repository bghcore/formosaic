import { IFieldProps } from "@formosaic/core";
import { Combobox, Option } from "@fluentui/react-components";
import type { ComboboxProps } from "@fluentui/react-components";
import React from "react";
import { Dropdown } from "@fluentui/react-components";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

const MultiSelectSearch = (props: IFieldProps<{}>) => {
  const { fieldName, testId, value, readOnly, error, required, options, setFieldValue } = props;

  const onOptionSelect: ComboboxProps["onOptionSelect"] = (_, data) => {
    setFieldValue(fieldName, data.selectedOptions, false, 3000);
  };

  return readOnly ? (
    <>
      {value && (value as string[]).length > 0 ? (
        <Dropdown
          className="fe-multi-select-search-read-only"
          multiselect
          value={(value as string[]).join(", ")}
          selectedOptions={value as string[]}
        >
          {(value as string[]).map(v => (
            <Option key={v} value={v}>{v}</Option>
          ))}
        </Dropdown>
      ) : null}
    </>
  ) : (
    <Combobox
      className={FieldClassName("fe-multi-select-search", error)}
      multiselect
      freeform
      value={undefined}
      selectedOptions={(value as string[]) ?? []}
      onOptionSelect={onOptionSelect}
      aria-invalid={!!error}
      aria-required={required}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    >
      {options?.map(option => (
        <Option key={String(option.value)} value={String(option.value)}>
          {option.label}
        </Option>
      ))}
    </Combobox>
  );
};

export default MultiSelectSearch;
