import { IFieldProps } from "@formosaic/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState } from "../helpers";
import { Select, SelectValue, Button, Popover, ListBox, ListBoxItem } from "react-aria-components";
import type { Key } from "react-aria-components";

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
    <Select
      className="df-simple-dropdown"
      selectedKey={(value as string) || null}
      onSelectionChange={(key: Key) => setFieldValue(fieldName, String(key))}
      isInvalid={!!error}
      isRequired={required}
      data-field-type="SimpleDropdown"
      data-field-state={getFieldState({ error, required, readOnly })}
    >
      <Button
        className="df-simple-dropdown__trigger"
        data-testid={GetFieldDataTestId(fieldName, testId)}
      >
        <SelectValue>{placeholder ?? config?.placeHolder ?? ""}</SelectValue>
        <span className="df-simple-dropdown__icon" aria-hidden="true">&#9660;</span>
      </Button>
      <Popover className="df-simple-dropdown__popover">
        <ListBox className="df-simple-dropdown__listbox">
          {simpleOptions.map(option => (
            <ListBoxItem key={option} id={option} className="df-simple-dropdown__item">
              {option}
            </ListBoxItem>
          ))}
        </ListBox>
      </Popover>
    </Select>
  );
};

export default SimpleDropdown;
