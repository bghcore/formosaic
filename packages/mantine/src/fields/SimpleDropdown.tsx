import { IFieldProps } from "@formosaic/core";
import { NativeSelect } from "@mantine/core";
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
    setFieldValue(fieldName, event.currentTarget.value);
  };

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={value as string} />;
  }

  const data = [
    { value: "", label: placeholder ?? config?.placeHolder ?? "" },
    ...simpleOptions.map(option => ({ value: option, label: option })),
  ];

  return (
    <NativeSelect
      className={FieldClassName("fe-simple-dropdown", error)}
      value={(value as string) ?? ""}
      onChange={onChange}
      data={data}
      required={required}
      aria-invalid={!!error}
      aria-required={required}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    />
  );
};

export default SimpleDropdown;
