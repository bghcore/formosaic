import { IFieldProps } from "@formosaic/core";
import { Textarea as BaseTextarea } from "baseui/textarea";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId } from "../helpers";

interface ITextareaProps {
  autoAdjustHeight?: boolean;
  numberOfRows?: number;
  ellipsifyTextCharacters?: number;
  maxLimit?: number;
}

const Textarea = (props: IFieldProps<ITextareaProps>) => {
  const { fieldName, testId, value, readOnly, config, error, required, setFieldValue } = props;

  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFieldValue(fieldName, event.target.value, false, 3000);
  };

  if (readOnly) {
    return (
      <ReadOnlyText
        fieldName={fieldName}
        value={value ? `${value}` : ""}
        ellipsifyTextCharacters={config?.ellipsifyTextCharacters}
      />
    );
  }

  return (
    <BaseTextarea
      autoComplete="off"
      value={value ? `${value}` : ""}
      onChange={onChange}
      error={!!error}
      aria-invalid={!!error}
      aria-required={required}
      overrides={{
        Root: {
          props: {
            "data-testid": GetFieldDataTestId(fieldName, testId),
          },
        },
      }}
    />
  );
};

export default Textarea;
