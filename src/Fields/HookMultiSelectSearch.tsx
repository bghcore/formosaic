import { IHookFieldSharedProps } from "../Interfaces/IHookFieldSharedProps";

import { ElxHierarchicalDropdown, IElxHierarchicalDropdownProps, SelectedKeyTypes } from "@elixir/components";
import { Dropdown } from "@fluentui/react";
import React from "react";
import { FieldClassName, GetFieldDataTestId, onRenderDropdownItemWithIcon } from "../Helpers";

interface IHookMultiSelectProps extends IElxHierarchicalDropdownProps {}

const HookMultiSelectSearch = (props: IHookFieldSharedProps<IHookMultiSelectProps>) => {
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

  const onMultiSelectChange = (selectedKeys?: SelectedKeyTypes) => {
    setFieldValue(fieldName, selectedKeys, false, 3000);
  };

  return readOnly ? (
    <>
      {value && (value as string[]).length > 0 ? (
        <Dropdown
          className="hook-multi-select-search-read-only"
          options={(value as string[]).map((v: string) => ({ key: v, text: v }))}
          multiSelect
          selectedKeys={value as string[]}
        />
      ) : (
        <></>
      )}
    </>
  ) : (
    <ElxHierarchicalDropdown
      className={FieldClassName("hook-multi-select-search", error)}
      options={dropdownOptions}
      onMultiSelectChange={onMultiSelectChange}
      enableSelectAll
      enableSearchBox
      multiSelect
      selectedKeys={value as string[]}
      onRenderOption={onRenderDropdownItemWithIcon}
      calloutProps={{
        className: "hook-multi-select-search-callout"
      }}
      data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
      {...meta}
    />
  );
};

export default HookMultiSelectSearch;
