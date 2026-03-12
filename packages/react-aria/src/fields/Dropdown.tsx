import { IFieldProps } from "@formosaic/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState } from "../helpers";
import { Select, SelectValue, Button, Popover, ListBox, ListBoxItem } from "react-aria-components";
import type { Key } from "react-aria-components";

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
    <Select
      className="df-dropdown"
      selectedKey={(value as string) || null}
      onSelectionChange={(key: Key) => setFieldValue(fieldName, String(key))}
      isInvalid={!!error}
      isRequired={required}
      data-field-type="Dropdown"
      data-field-state={getFieldState({ error, required, readOnly })}
    >
      <Button
        className="df-dropdown__trigger"
        data-testid={GetFieldDataTestId(fieldName, testId)}
      >
        <SelectValue>{placeholder ?? config?.placeHolder ?? ""}</SelectValue>
        <span className="df-dropdown__icon" aria-hidden="true">&#9660;</span>
      </Button>
      <Popover className="df-dropdown__popover">
        <ListBox className="df-dropdown__listbox">
          {options?.map(option => (
            <ListBoxItem
              key={String(option.value)}
              id={String(option.value)}
              className="df-dropdown__item"
              isDisabled={option.disabled}
            >
              {option.label}
            </ListBoxItem>
          ))}
        </ListBox>
      </Popover>
    </Select>
  );
};

export default Dropdown;
