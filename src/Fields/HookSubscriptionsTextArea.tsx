import { IEntityData } from "@cxpui/common";
import { getEntityDetails, IHookFieldSharedProps, UseEntitiesState } from "@cxpui/commoncontrols";
import React, { useState } from "react";
import { GetGuids } from "../../../Helpers/SharedHelper";
import { CPJSchemaEntity } from "../../../Models/CPJSchemaEntity";
import { ISubscriptionInfo } from "../../../Models/ISubscriptionInfo";
import { AddSubscriptions, IAddSubscriptionsProps } from "../../Subscriptions/AddSubscriptions";
import { FieldClassName } from "../Helpers";

const HookSubscriptionsTextArea = (props: IHookFieldSharedProps<IAddSubscriptionsProps>) => {
  const { fieldName, meta, error, setFieldValue, value } = props;
  const [text, setText] = useState(value);
  const { selectedEntity, allEntities } = UseEntitiesState();
  const entity = getEntityDetails(allEntities, selectedEntity.entityType, selectedEntity.entityId);
  const existingSubscriptions = (entity?.Subscriptions as IEntityData[]) || [];

  const setValue = (target: string, newValue: string) => {
    setText(newValue);
    if (GetGuids(newValue).length === 0) {
      setFieldValue(fieldName, "", false, 3000);
    }
  };

  const onSaveSubscriptions = (newSubscriptions: ISubscriptionInfo[]) => {
    const subscriptionsToAdd: ISubscriptionInfo[] = [
      ...existingSubscriptions.map(existingSub => ({
        SubscriptionId: existingSub.SubscriptionId as string,
        SubscriptionName: existingSub.EntityTitle,
        EntityType: CPJSchemaEntity.Subscription,
        EntityTitle: existingSub.EntityTitle
      })),
      ...newSubscriptions
    ];
    if (subscriptionsToAdd.length > 0) {
      setFieldValue(
        fieldName,
        meta?.sendAsString
          ? subscriptionsToAdd.map(existingSub => existingSub.SubscriptionId as string).toString()
          : subscriptionsToAdd.map(existingSub => existingSub.SubscriptionId as string),
        false,
        3000
      );
    } else {
      setFieldValue(fieldName, meta?.sendAsString ? "" : [], false, 3000);
    }
  };
  return (
    <div className={FieldClassName("hook-subscriptions-text-area", error)}>
      <AddSubscriptions
        existingSubscriptions={(entity?.Subscriptions as IEntityData[]) || []}
        field={text?.toString().replace(/,/g, "\n") ?? ""}
        onSaveSubscriptions={onSaveSubscriptions}
        setValue={setValue}
        needButtons={false}
        {...meta}
      />
    </div>
  );
};

export default HookSubscriptionsTextArea;
