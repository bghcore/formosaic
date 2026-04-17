import { IFieldProps, Dictionary } from "@formosaic/core";
import { Dropdown, Option } from "@fluentui/react-components";
import type { OptionOnSelectData } from "@fluentui/react-components";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import StatusColor from "../components/StatusDropdown/StatusColor";
import StatusDropdown from "../components/StatusDropdown/StatusDropdown";
import { FieldClassName } from "../helpers";

export interface IStatusDropdownProps {
  placeHolder?: string;
  statusColors?: Dictionary<string>;
}

const StatusDropdownField = (props: IFieldProps<IStatusDropdownProps>) => {
  const {
    fieldName, testId, value, readOnly, error, config, options, setFieldValue,
    required, errorCount, saving, savePending, optionsLoading, label, type, description, helpText, placeholder,
    ...rest
  } = props;

  const onOptionSelect = (_: unknown, data: OptionOnSelectData) => {
    setFieldValue(fieldName, data.optionValue);
  };

  return readOnly ? (
    <div {...rest} className="fe-read-only-status-dropdown" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <StatusColor statusColors={config?.statusColors as Dictionary<string>} status={value as string} />
      <ReadOnlyText fieldName={fieldName} value={value as string} />
    </div>
  ) : (
    <StatusDropdown
      {...rest}
      aria-invalid={(rest as Record<string, unknown>)["aria-invalid"] as boolean ?? !!error}
      aria-required={(rest as Record<string, unknown>)["aria-required"] as boolean ?? required}
      className={FieldClassName("fe-status-dropdown", error)}
      fieldName={fieldName}
      testId={testId}
      dropdownOptions={options}
      status={value as string}
      onOptionSelect={onOptionSelect}
      meta={config as unknown as Record<string, unknown>}
    />
  );
};

export default StatusDropdownField;
