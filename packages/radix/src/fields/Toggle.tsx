import { IFieldProps } from "@formosaic/core";
import { convertBooleanToYesOrNoText } from "../helpers";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState } from "../helpers";
import * as Switch from "@radix-ui/react-switch";

const Toggle = (props: IFieldProps<{}>) => {
  const {
    fieldName, testId, value, readOnly, error, required, label, setFieldValue,
    errorCount, saving, savePending, options, optionsLoading, type, description, helpText, placeholder, config,
    ...rest
  } = props;

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={convertBooleanToYesOrNoText(value as boolean)} />;
  }

  return (
    <label
      className="df-toggle"
      data-field-type="Toggle"
      data-field-state={getFieldState({ error, required, readOnly })}
    >
      <Switch.Root
        aria-invalid={!!error}
        aria-required={required}
        {...rest}
        className="df-toggle__input"
        checked={!!value}
        onCheckedChange={(checked) => setFieldValue(fieldName, checked)}
        data-testid={GetFieldDataTestId(fieldName, testId)}
      >
        <Switch.Thumb className="df-toggle__thumb" />
      </Switch.Root>
      <span className="df-toggle__label">{label}</span>
    </label>
  );
};

export default Toggle;
