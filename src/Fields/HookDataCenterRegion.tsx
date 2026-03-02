import { BuildDropdownOption } from "@cxpui/common";
import { IHookFieldSharedProps } from "../Interfaces/IHookFieldSharedProps";
import { GetAllRegions } from "@cxpui/generalapi";
import { ElxDropdown, SelectedKeyTypes } from "@elixir/components";
import { IDropdownOption, IDropdownProps } from "@fluentui/react";
import React from "react";
import { useFormContext } from "react-hook-form";
import { FieldClassName, GetFieldDataTestId } from "../Helpers";
import { HookInlineFormStrings } from "../Strings";

interface IHookDataCenterRegionProps extends IDropdownProps {
  placeHolder?: string;
}

const HookDataCenterRegion = (props: IHookFieldSharedProps<IHookDataCenterRegionProps>) => {
  const { fieldName, programName, entityType, entityId, setFieldValue, readOnly, error, meta } = props;

  const { watch } = useFormContext();
  const selectedRegions: string[] = watch(`${fieldName}` as const);

  const [regionOptions, setRegionOptions] = React.useState<IDropdownOption[]>();
  const [selectedKeys, setSelectedKeys] = React.useState<string[]>();

  React.useEffect(() => {
    if (!regionOptions && !readOnly) {
      GetAllRegions().then(regions => {
        const options: IDropdownOption[] = regions.map(region => BuildDropdownOption(region.fullName, region.id));
        options.sort((a, b) => (a.text > b.text ? 1 : -1));
        setRegionOptions(options);
        setSelectedKeys(selectedRegions);
      });
    }
  }, []);

  React.useEffect(() => {
    if (readOnly && selectedRegions) {
      setRegionOptions(
        selectedRegions.map(region => ({
          key: region,
          text: region
        }))
      );
    }
  }, [selectedRegions]);

  const onMultiSelectChange = (selectedKeys?: SelectedKeyTypes) => {
    setSelectedKeys(selectedKeys as string[]);
    setFieldValue(fieldName, selectedKeys, false, 3000);
  };

  return regionOptions ? (
    <ElxDropdown
      {...meta}
      multiSelect
      placeholder={meta?.placeHolder ?? HookInlineFormStrings.dataCenterRegionsPlaceholder}
      readOnly={readOnly}
      className={readOnly ? "hook-read-only-data-center-region" : FieldClassName("hook-data-center-region", error)}
      options={regionOptions}
      selectedKeys={selectedKeys}
      onMultiSelectChange={onMultiSelectChange}
      label={undefined}
      data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
    />
  ) : (
    <></>
  );
};

export default HookDataCenterRegion;
