import { IFieldProps } from "@form-eng/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

interface IRatingConfig {
  max?: number;
  allowHalf?: boolean;
}

const Rating = (props: IFieldProps<IRatingConfig>) => {
  const { fieldName, programName, entityType, entityId, value, readOnly, error, required, config, setFieldValue } = props;

  const max = config?.max ?? 5;
  const rating = (value as number) ?? 0;

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={String(rating)} />;
  }

  const stars = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <div
      className={FieldClassName("fe-rating", error)}
      role="radiogroup"
      aria-label={`Rating, ${rating} of ${max}`}
      aria-invalid={!!error}
      aria-required={required}
      data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
    >
      {stars.map(star => (
        <button
          key={star}
          type="button"
          className={`fe-rating__star${star <= rating ? " fe-rating__star--filled" : ""}`}
          aria-label={`${star} star${star !== 1 ? "s" : ""}`}
          aria-pressed={star === rating}
          onClick={() => setFieldValue(fieldName, star)}
        >
          {star <= rating ? "★" : "☆"}
        </button>
      ))}
    </div>
  );
};

export default Rating;
