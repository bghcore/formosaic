import { IFieldProps } from "@formosaic/core";
import { isNull } from "../helpers";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState } from "../helpers";
import { NumberField, Input } from "react-aria-components";

const NumberFieldComponent = (props: IFieldProps<{}>) => {
  const { fieldName, testId, value, readOnly, error, required, setFieldValue } = props;

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={!isNull(value) ? String(value) : undefined} />;
  }

  return (
    <NumberField
      className="df-number"
      value={!isNull(value) ? (value as number) : undefined}
      onChange={(num) => {
        if (!isNaN(num)) {
          setFieldValue(fieldName, num, false, 1500);
        }
      }}
      isInvalid={!!error}
      isRequired={required}
      formatOptions={{ useGrouping: false }}
      data-field-type="Number"
      data-field-state={getFieldState({ error, required, readOnly })}
    >
      <Input
        autoComplete="off"
        data-testid={GetFieldDataTestId(fieldName, testId)}
      />
    </NumberField>
  );
};

export default NumberFieldComponent;
