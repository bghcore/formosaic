import { IHookFieldSharedProps } from "@bghcore/dynamic-forms-core";
import { Dropdown, Option } from "@fluentui/react-components";
import type { OptionOnSelectData } from "@fluentui/react-components";
import React from "react";
import { useFormContext } from "react-hook-form";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

const HookMultiSelect = (props: IHookFieldSharedProps<{}>) => {
  const { fieldName, programName, entityType, entityId, value, readOnly, error, dropdownOptions, setFieldValue } = props;

  const { watch } = useFormContext();
  const selectedOptions = (watch(`${fieldName}` as const) as string[]) ?? [];

  const onOptionSelect = (_: unknown, data: OptionOnSelectData) => {
    setFieldValue(fieldName, data.selectedOptions, false, 1500);
  };

  return readOnly ? (
    <>
      {value && (value as string[]).length > 0 ? (
        <Dropdown
          className="hook-multi-select-read-only"
          multiselect
          value={(value as string[]).join(", ")}
          selectedOptions={value as string[]}
        >
          {(value as string[]).map(v => (
            <Option key={v} value={v}>{v}</Option>
          ))}
        </Dropdown>
      ) : null}
    </>
  ) : (
    <Dropdown
      className={FieldClassName("hook-multi-select", error)}
      multiselect
      value={selectedOptions.join(", ")}
      selectedOptions={selectedOptions}
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

export default HookMultiSelect;
