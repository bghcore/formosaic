import { IFieldProps } from "@formosaic/core";
import React from "react";

const DynamicFragment = (props: IFieldProps<{}>) => {
  const {
    value,
    fieldName, testId, readOnly, error, required, setFieldValue, config,
    errorCount, saving, savePending, options, optionsLoading, label, type, description, helpText, placeholder,
    ...rest
  } = props;
  return <input {...rest} type="hidden" value={value as string} />;
};

export default DynamicFragment;
