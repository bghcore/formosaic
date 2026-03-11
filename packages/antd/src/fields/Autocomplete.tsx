import { IFieldProps } from "@form-eng/core";
import React, { useState } from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId } from "../helpers";
import { AutoComplete } from "antd";

const Autocomplete = (props: IFieldProps<{}>) => {
  const { fieldName, programName, entityType, entityId, value, readOnly, error, required, placeholder, options, setFieldValue } = props;

  const selectedLabel = options?.find(o => String(o.value) === String(value))?.label ?? (value as string) ?? "";
  const [inputValue, setInputValue] = useState<string>(selectedLabel);

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={selectedLabel} />;
  }

  const antdOptions = options?.map(o => ({ value: String(o.value), label: o.label })) ?? [];

  const onSearch = (text: string) => {
    setInputValue(text);
  };

  const onSelect = (val: string) => {
    setInputValue(options?.find(o => String(o.value) === val)?.label ?? val);
    setFieldValue(fieldName, val);
  };

  const onChange = (text: string) => {
    setInputValue(text);
    const match = options?.find(o => o.label.toLowerCase() === text.toLowerCase());
    setFieldValue(fieldName, match ? String(match.value) : text);
  };

  return (
    <AutoComplete
      className="fe-autocomplete"
      options={antdOptions}
      value={inputValue}
      onSearch={onSearch}
      onSelect={onSelect}
      onChange={onChange}
      placeholder={placeholder}
      status={error ? "error" : undefined}
      data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
    />
  );
};

export default Autocomplete;
