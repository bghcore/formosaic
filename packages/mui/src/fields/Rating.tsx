import { IFieldProps, IRatingConfig } from "@formosaic/core";
import { Rating as MuiRating } from "@mui/material";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

const Rating = (props: IFieldProps<IRatingConfig>) => {
  const {
    fieldName, testId, value, readOnly, error, required, config, setFieldValue,
    errorCount, saving, savePending, options, optionsLoading, label, type, description, helpText, placeholder,
    ...rest
  } = props;

  const max = config?.max ?? 5;
  const precision = config?.allowHalf ? 0.5 : 1;
  const rating = (value as number) ?? null;

  const onChange = (_: React.SyntheticEvent, newValue: number | null) => {
    setFieldValue(fieldName, newValue ?? 0);
  };

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={String(rating ?? 0)} />;
  }

  return (
    <MuiRating
      aria-invalid={!!error}
      aria-required={required}
      {...rest}
      className={FieldClassName("fe-rating", error)}
      value={rating}
      max={max}
      precision={precision}
      onChange={onChange}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    />
  );
};

export default Rating;
