import { IFieldProps } from "@formosaic/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

interface ISimpleDropdownProps {
  dropdownOptions?: string[];
  placeHolder?: string;
}

const SimpleDropdown = (props: IFieldProps<ISimpleDropdownProps>) => {
  const { fieldName, testId, value, readOnly, config, error, required, placeholder, setFieldValue } = props;

  const simpleOptions = config?.dropdownOptions ?? [];

  const onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFieldValue(fieldName, event.target.value);
  };

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={value as string} />;
  }

  return (
    <select
      className={FieldClassName("fe-simple-dropdown", error)}
      value={(value as string) ?? ""}
      onChange={onChange}
      aria-invalid={!!error}
      aria-required={required}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    >
      <option value="">{placeholder ?? config?.placeHolder ?? ""}</option>
      {simpleOptions.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  );
};

export default SimpleDropdown;
