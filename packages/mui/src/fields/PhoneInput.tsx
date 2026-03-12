import { IFieldProps, IPhoneInputConfig, extractDigits, formatPhone } from "@formosaic/core";
import React from "react";
import { TextField } from "@mui/material";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

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
    <TextField
      type="tel"
      className={FieldClassName("fe-phone-input", error)}
      value={(value as string) ?? ""}
      onChange={onChange}
      error={!!error}
      required={required}
      inputProps={{
        "aria-invalid": !!error,
        "aria-required": required,
        "data-testid": GetFieldDataTestId(fieldName, testId),
      }}
      size="small"
      fullWidth
    />
  );
};

export default PhoneInput;
