import { IFieldProps } from "@form-eng/core";
import React, { useState, useId } from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState } from "../helpers";

const Autocomplete = (props: IFieldProps<{}>) => {
  const { fieldName, programName, entityType, entityId, value, readOnly, error, required, placeholder, options, setFieldValue } = props;

  const listId = useId();
  const [inputValue, setInputValue] = useState<string>(
    options?.find(o => String(o.value) === String(value))?.label ?? (value as string) ?? ""
  );

  const selectedLabel = options?.find(o => String(o.value) === String(value))?.label ?? (value as string) ?? "";

  const onInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value;
    setInputValue(text);
    const match = options?.find(o => o.label.toLowerCase() === text.toLowerCase());
    setFieldValue(fieldName, match ? String(match.value) : text);
  };

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={selectedLabel} />;
  }

  return (
    <div
      className="df-autocomplete"
      data-field-type="Autocomplete"
      data-field-state={getFieldState({ error, required, readOnly })}
    >
      <input
        className="df-autocomplete__input"
        type="text"
        list={listId}
        value={inputValue}
        onChange={onInput}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-required={required}
        data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
      />
      <datalist id={listId}>
        {options?.map(option => (
          <option key={String(option.value)} value={option.label} />
        ))}
      </datalist>
    </div>
  );
};

export default Autocomplete;
