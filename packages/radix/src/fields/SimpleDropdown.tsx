import { IFieldProps } from "@formosaic/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState } from "../helpers";
import * as Select from "@radix-ui/react-select";

interface ISimpleDropdownProps {
  dropdownOptions?: string[];
  placeHolder?: string;
}

const SimpleDropdown = (props: IFieldProps<ISimpleDropdownProps>) => {
  const { fieldName, testId, value, readOnly, config, error, required, placeholder, setFieldValue } = props;

  const simpleOptions = config?.dropdownOptions ?? [];

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={value as string} />;
  }

  return (
    <div
      data-field-type="SimpleDropdown"
      data-field-state={getFieldState({ error, required, readOnly })}
    >
      <Select.Root
        value={(value as string) || undefined}
        onValueChange={(val) => setFieldValue(fieldName, val)}
      >
        <Select.Trigger
          className="df-simple-dropdown"
          aria-invalid={!!error}
          aria-required={required}
          data-testid={GetFieldDataTestId(fieldName, testId)}
        >
          <Select.Value placeholder={placeholder ?? config?.placeHolder ?? ""} />
          <Select.Icon className="df-simple-dropdown__icon">&#9660;</Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className="df-simple-dropdown__content">
            <Select.Viewport className="df-simple-dropdown__viewport">
              {simpleOptions.map(option => (
                <Select.Item key={option} value={option} className="df-simple-dropdown__item">
                  <Select.ItemText>{option}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
};

export default SimpleDropdown;
