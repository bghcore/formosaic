import { IFieldProps, IPhoneInputConfig, extractDigits, formatPhone } from "@formosaic/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState } from "../helpers";

const PhoneInput = (props: IFieldProps<IPhoneInputConfig>) => {
  const { fieldName, testId, value, readOnly, error, required, config, setFieldValue } = props;

  const format = config?.format ?? "us";

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={(value as string) ?? ""} />;
  }

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const digits = extractDigits(event.target.value);
    const formatted = formatPhone(digits, format);
    setFieldValue(fieldName, formatted);
  };

  return (
    <input
      type="tel"
      className="fe-phone-input"
      data-field-type="PhoneInput"
      data-field-state={getFieldState({ error, required, readOnly })}
      value={(value as string) ?? ""}
      onChange={onChange}
      aria-invalid={!!error}
      aria-required={required}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    />
  );
};

export default PhoneInput;
