import { IFieldProps, IPhoneInputConfig, extractDigits, formatPhone } from "@formosaic/core";
import React from "react";
import { Input } from "@fluentui/react-components";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

const PhoneInput = (props: IFieldProps<IPhoneInputConfig>) => {
  const { fieldName, testId, value, readOnly, error, required, config, setFieldValue } = props;

  const format = config?.format ?? "us";

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={(value as string) ?? ""} />;
  }

  const onChange = (_: React.ChangeEvent<HTMLInputElement>, data: { value: string }) => {
    const digits = extractDigits(data.value);
    const formatted = formatPhone(digits, format);
    setFieldValue(fieldName, formatted);
  };

  return (
    <Input
      type="tel"
      className={FieldClassName("fe-phone-input", error)}
      value={(value as string) ?? ""}
      onChange={onChange}
      aria-invalid={!!error}
      aria-required={required}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    />
  );
};

export default PhoneInput;
