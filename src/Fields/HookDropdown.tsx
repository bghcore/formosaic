import { GetDropdownValue } from "@cxpui/common";
import { IHookFieldSharedProps } from "../Interfaces/IHookFieldSharedProps";

import { Dropdown, IDropdownOption, IDropdownProps } from "@fluentui/react";
import React from "react";
import ReadOnlyText from "../Components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId, onRenderDropdownItemWithIcon } from "../Helpers";

interface IHookDropdownProps extends IDropdownProps {
  placeHolder?: string;
  setDefaultKeyIfOnlyOneOption?: boolean;
}

const HookDropdown = (props: IHookFieldSharedProps<IHookDropdownProps>) => {
  const {
    fieldName,
    programName,
    entityType,
    entityId,
    value,
    readOnly,
    meta,
    error,
    dropdownOptions,
    setFieldValue
  } = props;

  const onChange = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
    setFieldValue(fieldName, GetDropdownValue(option));
  };

  React.useEffect(() => {
    if (!value && !readOnly && meta?.setDefaultKeyIfOnlyOneOption && dropdownOptions.length === 1) {
      setFieldValue(fieldName, GetDropdownValue(dropdownOptions[0]));
    }
  }, [dropdownOptions]);

  return readOnly ? (
    <ReadOnlyText fieldName={fieldName} value={value as string} />
  ) : (
    <Dropdown
      className={FieldClassName("hook-dropdown", error)}
      options={dropdownOptions}
      onChange={onChange}
      selectedKey={!!value ? `${value}` : undefined}
      onRenderOption={onRenderDropdownItemWithIcon}
      calloutProps={{
        className: "hook-dropdown-callout"
      }}
      data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
      {...meta}
    />
  );
};

export default HookDropdown;
