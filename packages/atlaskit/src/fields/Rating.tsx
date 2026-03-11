import { IFieldProps, IRatingConfig } from "@form-eng/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState } from "../helpers";

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
      className="ak-rating"
      role="radiogroup"
      aria-label={`Rating, ${rating} of ${max}`}
      aria-invalid={!!error}
      aria-required={required}
      data-field-type="Rating"
      data-field-state={getFieldState({ error, required, readOnly })}
      data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
    >
      {stars.map(star => (
        <label key={star} className="ak-rating__star-label">
          <input
            type="radio"
            className="ak-rating__input"
            name={fieldName}
            value={String(star)}
            checked={rating === star}
            onChange={() => setFieldValue(fieldName, star)}
            aria-label={`${star} star${star !== 1 ? "s" : ""}`}
          />
          <span className={`ak-rating__star${star <= rating ? " ak-rating__star--filled" : ""}`} aria-hidden="true">
            {star <= rating ? "\u2605" : "\u2606"}
          </span>
        </label>
      ))}
    </div>
  );
};

export default Rating;
