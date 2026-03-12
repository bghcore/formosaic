import { IFieldProps } from "@formosaic/core";
import { convertBooleanToYesOrNoText } from "../helpers";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState } from "../helpers";
import { Switch } from "react-aria-components";

const Toggle = (props: IFieldProps<{}>) => {
  const { fieldName, testId, value, readOnly, error, required, label, setFieldValue } = props;

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={convertBooleanToYesOrNoText(value as boolean)} />;
  }

  return (
    <Switch
      className="df-toggle"
      isSelected={!!value}
      onChange={(checked) => setFieldValue(fieldName, checked)}
      data-field-type="Toggle"
      data-field-state={getFieldState({ error, required, readOnly })}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    >
      <span className="df-toggle__label">{label}</span>
    </Switch>
  );
};

export default Toggle;
