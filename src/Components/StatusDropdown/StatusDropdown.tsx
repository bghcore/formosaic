import { Dictionary } from "@cxpui/common";
import { getEntityDetails, UseEntitiesState } from "@cxpui/commoncontrols";
import { Dropdown, IDropdownOption } from "@fluentui/react";
import React from "react";
import { IBlockStatusChange } from "../../../../Models/IBlockStatusChange";
import { IHookStatusDropdownProps } from "../../Fields/HookStatusDropdown";
import { GetFieldDataTestId, onRenderDropdownItemWithIcon, ProcessBlockStatusChange } from "../../Helpers";
import StatusColor from "./StatusColor";

interface IStatusDropdownProps {
  className: string;
  entityId: string;
  entityType: string;
  programName: string;
  fieldName: string;
  status: string;
  dropdownOptions: IDropdownOption[];
  meta?: IHookStatusDropdownProps;
  onChange: (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => void;
}

const StatusDropdown = (props: IStatusDropdownProps) => {
  const { fieldName, programName, entityType, entityId, className, status, meta, dropdownOptions, onChange } = props;
  const { statusColors, blockStatusChanges } = meta;

  const { allEntities } = UseEntitiesState();
  const [statusOptions, setStatusOptions] = React.useState<IDropdownOption[]>();

  React.useEffect(() => {
    const entity = getEntityDetails(allEntities, entityType, entityId);

    const updatedOptions: IDropdownOption[] = [];
    dropdownOptions?.map((option: IDropdownOption) => {
      const blockStatusChange: IBlockStatusChange = (blockStatusChanges as IBlockStatusChange[])?.find(
        (blockStatusChange: IBlockStatusChange) => blockStatusChange.status === option.text
      );

      updatedOptions.push(blockStatusChange ? ProcessBlockStatusChange(blockStatusChange, entity, option) : option);
    });

    setStatusOptions(updatedOptions);
  }, [allEntities, entityType, entityId, dropdownOptions]);

  return (
    <div className={className}>
      <StatusColor statusColors={statusColors as Dictionary<string>} status={status} />
      <Dropdown
        options={statusOptions}
        onChange={onChange}
        selectedKey={status}
        onRenderOption={onRenderDropdownItemWithIcon}
        calloutProps={{
          className: "hook-status-dropdown-callout"
        }}
        data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
        {...meta}
      />
    </div>
  );
};

export default StatusDropdown;
