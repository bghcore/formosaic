import { IHookFieldSharedProps } from "@bghcore/dynamic-forms-core";
import { Dropdown, Option } from "@fluentui/react-components";
import type { OptionOnSelectData } from "@fluentui/react-components";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

interface IHookDropdownProps {
  placeHolder?: string;
  setDefaultKeyIfOnlyOneOption?: boolean;
}

const HookDropdown = (props: IHookFieldSharedProps<IHookDropdownProps>) => {
  const { fieldName, programName, entityType, entityId, value, readOnly, meta, error, dropdownOptions, setFieldValue } = props;

  const onOptionSelect = (_: unknown, data: OptionOnSelectData) => {
    setFieldValue(fieldName, data.optionValue);
  };

  React.useEffect(() => {
    if (!value && !readOnly && meta?.setDefaultKeyIfOnlyOneOption && dropdownOptions?.length === 1) {
      setFieldValue(fieldName, String(dropdownOptions[0].key));
    }
  }, [dropdownOptions]);

  const selectedText = dropdownOptions?.find(o => String(o.key) === String(value))?.text;

  return readOnly ? (
    <ReadOnlyText fieldName={fieldName} value={value as string} />
  ) : (
    <Dropdown
      className={FieldClassName("hook-dropdown", error)}
      value={selectedText ?? ""}
      selectedOptions={value ? [String(value)] : []}
      onOptionSelect={onOptionSelect}
      data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
    >
      {dropdownOptions?.map(option => (
        <Option key={String(option.key)} value={String(option.key)} disabled={option.disabled}>
          {option.text}
        </Option>
      ))}
    </Dropdown>
  );
};

export default HookDropdown;
