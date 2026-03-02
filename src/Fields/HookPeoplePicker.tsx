import { IHookFieldSharedProps, Person } from "@cxpui/commoncontrols";
import { IPeoplePickerProps, PersonaSize } from "@fluentui/react";
import React from "react";
import { IHookPerson } from "../../../Models/IHookPerson";
import PeoplePicker from "../Components/PeoplePicker";
import { FieldClassName } from "../Helpers";

interface IHookPeoplePickerProps extends IPeoplePickerProps {}

const HookPeoplePicker = (props: IHookFieldSharedProps<IHookPeoplePickerProps>) => {
  const { fieldName, programName, entityType, entityId, value, readOnly, meta, error, setFieldValue } = props;

  const onChange = (person?: IHookPerson) => {
    setFieldValue(fieldName, person);
  };

  return readOnly ? (
    <>
      {value && (value as IHookPerson).Upn ? (
        <Person
          upn={(value as IHookPerson).Upn}
          secondaryText={(value as IHookPerson).Upn}
          size={PersonaSize.size32}
          showSecondaryText
        />
      ) : (
        <></>
      )}
    </>
  ) : (
    <PeoplePicker
      fieldName={fieldName}
      programName={programName}
      entityType={entityType}
      entityId={entityId}
      className={FieldClassName("hook-people-picker", error)}
      selectedPerson={value as IHookPerson}
      onChange={onChange}
      meta={meta}
    />
  );
};

export default HookPeoplePicker;
