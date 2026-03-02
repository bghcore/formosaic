import { GetDropdownValue } from "@cxpui/common";
import { IHookFieldSharedProps, UseEntitiesState } from "@cxpui/commoncontrols";
import { GetADOTemplates } from "@cxpui/service";
import { Dropdown, IDropdownOption } from "@fluentui/react";
import React from "react";
import ReadOnlyText from "../Components/ReadOnlyText";
import {
  FieldClassName,
  GetFieldDataTestId,
  GetParentCustomer,
  onRenderDropdownItemWithIcon,
} from "../Helpers";

interface IHookADOTemplatesProps {
  placeHolder?: string;
}

const HookADOTemplates = (
  props: IHookFieldSharedProps<IHookADOTemplatesProps>
) => {
  const {
    fieldName,
    programName,
    entityType,
    entityId,
    parentEntityId,
    parentEntityType,
    value,
    readOnly,
    meta,
    error,
    setFieldValue,
  } = props;

  const { allEntities } = UseEntitiesState();

  const [dropdownOptions, setDropdownOptions] =
    React.useState<IDropdownOption[]>();
  const [customerName, setCustomerName] = React.useState<string>();
  const [customerId, setCustomerId] = React.useState<string>();

  React.useEffect(() => {
    if (!dropdownOptions && programName && customerName && customerId) {
      GetADOTemplates(programName, customerName, customerId).then(
        (response) => {
          if (response.isSuccess) {
            setDropdownOptions(
              response.result.map((template) => ({
                key: template.EntityId,
                text: template.EntityTitle,
              }))
            );
          } else {
            setDropdownOptions([]);
          }
        }
      );
    }
  }, [programName, customerName, customerId]);

  React.useEffect(() => {
    if (!customerName && !customerId) {
      const customerEntity = GetParentCustomer(
        allEntities,
        allEntities?.[parentEntityType]?.entities?.[parentEntityId]
      );
      if (customerEntity) {
        setCustomerName(customerEntity.EntityTitle);
        setCustomerId(customerEntity.EntityId);
      }
    }
  }, [allEntities]);

  const onChange = (
    event: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption
  ) => {
    setFieldValue(fieldName, GetDropdownValue(option));
  };

  return readOnly ? (
    <ReadOnlyText fieldName={fieldName} value={String(value)} />
  ) : (
    <Dropdown
      className={FieldClassName("hook-dropdown", error)}
      options={dropdownOptions}
      onChange={onChange}
      selectedKey={`${value}`}
      onRenderOption={onRenderDropdownItemWithIcon}
      calloutProps={{
        className: "hook-dropdown-callout",
      }}
      data-testid={GetFieldDataTestId(
        fieldName,
        programName,
        entityType,
        entityId
      )}
      {...meta}
    />
  );
};

export default HookADOTemplates;
