import { IFieldProps, IRatingConfig } from "@formosaic/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId } from "../helpers";
import { Rating as MantineRating } from "@mantine/core";

const Rating = (props: IFieldProps<IRatingConfig>) => {
  const {
    fieldName, testId, value, readOnly, error, required, config, setFieldValue,
    errorCount, saving, savePending, options, optionsLoading, label, type, description, helpText, placeholder,
    ...rest
  } = props;

  const max = config?.max ?? 5;
  const rating = (value as number) ?? 0;

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={String(rating)} />;
  }

  return (
    <MantineRating
      aria-invalid={!!error}
      aria-required={required}
      {...rest}
      className="fe-rating"
      count={max}
      value={rating}
      onChange={(val) => setFieldValue(fieldName, val)}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    />
  );
};

export default Rating;
