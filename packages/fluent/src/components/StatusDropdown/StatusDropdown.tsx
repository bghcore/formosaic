import { Dictionary, IOption } from "@formosaic/core";
import { Dropdown, Option } from "@fluentui/react-components";
import type { OptionOnSelectData } from "@fluentui/react-components";
import React from "react";
import { GetFieldDataTestId } from "../../helpers";
import StatusColor from "./StatusColor";

interface IStatusDropdownProps {
  className: string;
  testId?: string;
  fieldName: string;
  status: string;
  dropdownOptions: IOption[];
  meta?: Record<string, unknown>;
  onOptionSelect: (event: unknown, data: OptionOnSelectData) => void;
}

const StatusDropdown = (props: IStatusDropdownProps) => {
  const { fieldName, testId, className, status, meta, dropdownOptions, onOptionSelect } = props;
  const statusColors = (meta?.statusColors ?? {}) as Dictionary<string>;

  const selectedText = dropdownOptions?.find(o => String(o.value) === status)?.label;

  return (
    <div className={className} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <StatusColor statusColors={statusColors} status={status} />
      <Dropdown
        value={selectedText ?? ""}
        selectedOptions={status ? [status] : []}
        onOptionSelect={onOptionSelect}
        data-testid={GetFieldDataTestId(fieldName, testId)}
      >
        {dropdownOptions?.map(option => (
          <Option key={String(option.value)} value={String(option.value)} disabled={option.disabled}>
            {option.label}
          </Option>
        ))}
      </Dropdown>
    </div>
  );
};

export default StatusDropdown;
