import { IFieldProps } from "@form-eng/core";
import { Radio, RadioGroup as FluentRadioGroup } from "@fluentui/react-components";
import type { RadioGroupOnChangeData } from "@fluentui/react-components";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

const RadioGroup = (props: IFieldProps<{}>) => {
  const { fieldName, programName, entityType, entityId, value, readOnly, error, required, options, setFieldValue } = props;

  const onChange = (_: React.FormEvent<HTMLDivElement>, data: RadioGroupOnChangeData) => {
    setFieldValue(fieldName, data.value);
  };

  if (readOnly) {
    const label = options?.find(o => String(o.value) === String(value))?.label ?? (value as string);
    return <ReadOnlyText fieldName={fieldName} value={label} />;
  }

  return (
    <FluentRadioGroup
      className={FieldClassName("fe-radio-group", error)}
      value={value ? String(value) : ""}
      onChange={onChange}
      aria-invalid={!!error}
      aria-required={required}
      data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
    >
      {options?.map(option => (
        <Radio
          key={String(option.value)}
          value={String(option.value)}
          label={option.label}
          disabled={option.disabled}
        />
      ))}
    </FluentRadioGroup>
  );
};

export default RadioGroup;
