import { Dictionary, GetDropdownValue } from "@cxpui/common";
import { IHookFieldSharedProps } from "../Interfaces/IHookFieldSharedProps";

import { IDropdownOption, IDropdownProps } from "@fluentui/react";
import React from "react";
import { IBlockStatusChange } from "../../../Models/IBlockStatusChange";
import ReadOnlyText from "../Components/ReadOnlyText";
import StatusColor from "../Components/StatusDropdown/StatusColor";
import StatusDropdown from "../Components/StatusDropdown/StatusDropdown";
import { FieldClassName } from "../Helpers";

export interface IHookStatusDropdownProps extends IDropdownProps {
  placeHolder?: string;
  statusColors?: Dictionary<string>;
  blockStatusChanges?: IBlockStatusChange[];
}

const HookStatusDropdown = (props: IHookFieldSharedProps<IHookStatusDropdownProps>) => {
  const {
    fieldName,
    programName,
    entityType,
    entityId,
    value,
    readOnly,
    error,
    meta,
    dropdownOptions,
    setFieldValue
  } = props;

  const onChange = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
    setFieldValue(fieldName, GetDropdownValue(option));
  };

  return readOnly ? (
    <div className="hook-read-only-status-dropdown">
      <StatusColor statusColors={meta.statusColors as Dictionary<string>} status={value as string} />
      <ReadOnlyText fieldName={fieldName} value={value as string} {...meta} />
    </div>
  ) : (
    <StatusDropdown
      className={FieldClassName("hook-status-dropdown", error)}
      fieldName={fieldName}
      programName={programName}
      entityType={entityType}
      entityId={entityId}
      dropdownOptions={dropdownOptions}
      status={value as string}
      onChange={onChange}
      meta={meta}
    />
  );
};

export default HookStatusDropdown;
