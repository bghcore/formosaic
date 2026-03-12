import { IFieldProps } from "@formosaic/core";
import { NativeSelect } from "@chakra-ui/react";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState } from "../helpers";

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
    <NativeSelect.Root
      data-field-type="SimpleDropdown"
      data-field-state={getFieldState({ error, required, readOnly })}
    >
      <NativeSelect.Field
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
      </NativeSelect.Field>
      <NativeSelect.Indicator />
    </NativeSelect.Root>
  );
};

export default SimpleDropdown;
