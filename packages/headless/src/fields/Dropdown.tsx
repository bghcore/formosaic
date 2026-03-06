import { IFieldProps } from "@form-eng/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState } from "../helpers";

interface IHookDropdownProps {
  placeHolder?: string;
  setDefaultKeyIfOnlyOneOption?: boolean;
}

const Dropdown = (props: IFieldProps<IHookDropdownProps>) => {
  const { fieldName, programName, entityType, entityId, value, readOnly, config, error, required, options, placeholder, setFieldValue } = props;

  const onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFieldValue(fieldName, event.target.value);
  };

  React.useEffect(() => {
    if (!value && !readOnly && config?.setDefaultKeyIfOnlyOneOption && options?.length === 1) {
      setFieldValue(fieldName, String(options[0].value));
    }
  }, [options]);

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={value as string} />;
  }

  return (
    <select
      className="df-dropdown"
      value={(value as string) ?? ""}
      onChange={onChange}
      aria-invalid={!!error}
      aria-required={required}
      data-field-type="Dropdown"
      data-field-state={getFieldState({ error, required, readOnly })}
      data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
    >
      <option value="">{placeholder ?? config?.placeHolder ?? ""}</option>
      {options?.map(option => (
        <option key={String(option.value)} value={String(option.value)} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Dropdown;
