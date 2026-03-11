import { IFieldProps } from "@form-eng/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState } from "../helpers";
import { ComboBox, Input, Button, Popover, ListBox, ListBoxItem } from "react-aria-components";

const Autocomplete = (props: IFieldProps<{}>) => {
  const { fieldName, programName, entityType, entityId, value, readOnly, error, required, placeholder, options, setFieldValue } = props;

  const selectedLabel = options?.find(o => String(o.value) === String(value))?.label ?? (value as string) ?? "";

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={selectedLabel} />;
  }

  return (
    <ComboBox
      className="df-autocomplete"
      aria-label={fieldName}
      defaultInputValue={selectedLabel}
      onSelectionChange={(key) => {
        if (key !== null) setFieldValue(fieldName, String(key));
      }}
      onInputChange={(text) => {
        const match = options?.find(o => o.label.toLowerCase() === text.toLowerCase());
        setFieldValue(fieldName, match ? String(match.value) : text);
      }}
      data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
      isRequired={required}
      isInvalid={!!error}
    >
      <Input className="df-autocomplete__input" placeholder={placeholder} />
      <Button className="df-autocomplete__button">&#9660;</Button>
      <Popover>
        <ListBox className="df-autocomplete__listbox">
          {options?.map(option => (
            <ListBoxItem key={String(option.value)} id={String(option.value)}>
              {option.label}
            </ListBoxItem>
          ))}
        </ListBox>
      </Popover>
    </ComboBox>
  );
};

export default Autocomplete;
