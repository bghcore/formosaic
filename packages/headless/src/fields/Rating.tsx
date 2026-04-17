import { IFieldProps, IRatingConfig } from "@formosaic/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState } from "../helpers";

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

  const stars = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <div
      role="radiogroup"
      aria-label={`Rating, ${rating} of ${max}`}
      aria-invalid={!!error}
      aria-required={required}
      {...rest}
      className="df-rating"
      data-field-type="Rating"
      data-field-state={getFieldState({ error, required, readOnly })}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    >
      {stars.map(star => (
        <label key={star} className="df-rating__star-label">
          <input
            type="radio"
            className="df-rating__input"
            name={fieldName}
            value={String(star)}
            checked={rating === star}
            onChange={() => setFieldValue(fieldName, star)}
            aria-label={`${star} star${star !== 1 ? "s" : ""}`}
          />
          <span className={`df-rating__star${star <= rating ? " df-rating__star--filled" : ""}`} aria-hidden="true">
            {star <= rating ? "★" : "☆"}
          </span>
        </label>
      ))}
    </div>
  );
};

export default Rating;
