import { BuildDropdownOption, FilterList, GetDropdownValue } from "@cxpui/common";
import { BuildSearchRequest, IHookFieldSharedProps, UseEntitiesDispatch } from "@cxpui/commoncontrols";
import { ElxHierarchicalDropdown } from "@elixir/components";
import { IDropdownOption } from "@fluentui/react";
import React from "react";
import CPJConstants from "../../../Constants/CPJConstants";
import { CPJSchemaEntity } from "../../../Models/CPJSchemaEntity";
import ReadOnlyText from "../Components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../Helpers";

interface IHookChildEntitySearchProps {
  placeHolder?: string;
}

const HookChildEntitySearch = (props: IHookFieldSharedProps<IHookChildEntitySearchProps>) => {
  const {
    fieldName,
    programName,
    entityType,
    entityId,
    value,
    error,
    readOnly,
    setFieldValue,
    meta,
    parentEntityId
  } = props;

  const [dropdownOptions, setDropdownOptions] = React.useState<IDropdownOption[]>([]);

  const { searchAllEntities } = UseEntitiesDispatch();

  React.useEffect(() => {
    const filterList = new FilterList();
    filterList.Filters = [
      {
        Column: `${CPJConstants.tree.parentEntityId}`,
        SelectedValues: [parentEntityId]
      }
    ];
    const searchRequest = BuildSearchRequest(filterList);
    searchRequest.Top = 100;
    searchAllEntities(CPJSchemaEntity.Task, searchRequest, programName).then(response => {
      setDropdownOptions(
        response.Results.map(result => BuildDropdownOption(result.Document.EntityTitle, result.Document.EntityId))
      );
    });
  }, []);

  const onChange = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
    setFieldValue(fieldName, GetDropdownValue(option));
  };

  return readOnly ? (
    <ReadOnlyText fieldName={fieldName} value={value as string} />
  ) : (
    <ElxHierarchicalDropdown
      className={FieldClassName("hook-child-entity-search", error)}
      selectedKey={`${value}`}
      options={dropdownOptions}
      onChange={onChange}
      enableSearchBox
      {...meta}
      data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
    />
  );
};

export default HookChildEntitySearch;
