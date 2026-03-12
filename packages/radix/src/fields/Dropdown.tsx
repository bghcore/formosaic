import { IFieldProps } from "@formosaic/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState } from "../helpers";
import * as Select from "@radix-ui/react-select";

interface IDropdownProps {
  placeHolder?: string;
  setDefaultKeyIfOnlyOneOption?: boolean;
}

const Dropdown = (props: IFieldProps<IDropdownProps>) => {
  const { fieldName, testId, value, readOnly, config, error, required, options, placeholder, setFieldValue } = props;

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
    <div
      data-field-type="Dropdown"
      data-field-state={getFieldState({ error, required, readOnly })}
    >
      <Select.Root
        value={(value as string) || undefined}
        onValueChange={(val) => setFieldValue(fieldName, val)}
      >
        <Select.Trigger
          className="df-dropdown"
          aria-invalid={!!error}
          aria-required={required}
          data-testid={GetFieldDataTestId(fieldName, testId)}
        >
          <Select.Value placeholder={placeholder ?? config?.placeHolder ?? ""} />
          <Select.Icon className="df-dropdown__icon">&#9660;</Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className="df-dropdown__content">
            <Select.Viewport className="df-dropdown__viewport">
              {options?.map(option => (
                <Select.Item
                  key={String(option.value)}
                  value={String(option.value)}
                  className="df-dropdown__item"
                  disabled={option.disabled}
                >
                  <Select.ItemText>{option.label}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
};

export default Dropdown;
