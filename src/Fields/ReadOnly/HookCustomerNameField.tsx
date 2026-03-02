import {
  DynamicButton,
  IDynamicButtonProps,
  IHookFieldSharedProps,
  UseEntitiesState,
  getEntityDetails
} from "@cxpui/commoncontrols";
import React from "react";
import { VerifyCustomerIcon } from "../../../VerifyCustomer/VerifyCustomerIcon";
import ReadOnlyText, { IReadOnlyFieldProps } from "../../Components/ReadOnlyText";

interface IHookCustomerNameField extends IReadOnlyFieldProps {
  containerClassName?: string;
  buttonConfig?: IDynamicButtonProps;
}

const HookCustomerNameField = (props: IHookFieldSharedProps<IHookCustomerNameField>) => {
  const { fieldName, value, meta } = props;
  const { selectedEntity, allEntities } = UseEntitiesState();
  const entity = getEntityDetails(allEntities, selectedEntity.entityType, selectedEntity.entityId);

  return (
    <div className={`flexBox ${meta?.containerClassName}`}>
      <VerifyCustomerIcon IsVerified={entity?.Parent?.IsVerified as boolean} />
      <ReadOnlyText
        fieldName={fieldName}
        value={
          entity?.Parent?.ID && entity?.Parent?.EntityTitle
            ? `${entity.Parent.EntityTitle} (TPID: ${entity?.Parent?.ID})`
            : `${value}`
        }
        {...meta}
      />
      <DynamicButton {...(meta?.buttonConfig as IDynamicButtonProps)} entityId={props.entityId} />
    </div>
  );
};

export default HookCustomerNameField;
