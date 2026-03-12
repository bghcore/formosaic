import { IFieldProps } from "@formosaic/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId } from "../helpers";

const RadioGroup = (props: IFieldProps<{}>) => {
  const { fieldName, testId, value, readOnly, error, required, options, setFieldValue } = props;

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(fieldName, event.target.value);
  };

  if (readOnly) {
    const label = options?.find(o => String(o.value) === String(value))?.label ?? (value as string);
    return <ReadOnlyText fieldName={fieldName} value={label} />;
  }

  return (
    <div
      role="radiogroup"
      aria-invalid={!!error}
      aria-required={required}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    >
      {options?.map(option => (
        <label key={String(option.value)}>
          <input
            type="radio"
            name={fieldName}
            value={String(option.value)}
            checked={String(value) === String(option.value)}
            onChange={onChange}
            disabled={option.disabled}
          />
          {option.label}
        </label>
      ))}
    </div>
  );
};

export default RadioGroup;
