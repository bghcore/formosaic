import { IHookFieldSharedProps, Person } from "@cxpui/commoncontrols";
import { IPeoplePickerProps, PersonaSize } from "@fluentui/react";
import React from "react";
import { useFormContext } from "react-hook-form";
import { IHookPerson } from "../../../Models/IHookPerson";
import PeoplePickerList from "../Components/PeoplePickerList";
import { FieldClassName } from "../Helpers";

interface IHookPeoplePickerListProps extends IPeoplePickerProps {}

const HookPeoplePickerList = (props: IHookFieldSharedProps<IHookPeoplePickerListProps>) => {
  const { fieldName, programName, entityType, entityId, value, readOnly, meta, error, setFieldValue } = props;

  const { watch } = useFormContext();
  const selectedPeople = watch(`${fieldName}` as const);

  const onChange = (items?: IHookPerson[]) => {
    setFieldValue(fieldName, items && items.length > 0 ? items : null, false, 3000);
  };

  const onRemovePerson = (upn: string) => {
    const updatedSelectedPeople = (selectedPeople as IHookPerson[]).filter(p => p.Upn !== upn);
    setFieldValue(fieldName, updatedSelectedPeople.length === 0 ? null : updatedSelectedPeople, false, 3000);
  };

  return readOnly ? (
    <div className="hook-read-only-people-picker-list">
      {value &&
        (value as IHookPerson[]).map(person => (
          <Person
            upn={person.Upn || person.EmailAddress}
            secondaryText={person.Upn || person.EmailAddress}
            size={PersonaSize.size32}
            showSecondaryText
          />
        ))}
    </div>
  ) : (
    <PeoplePickerList
      fieldName={fieldName}
      programName={programName}
      entityType={entityType}
      entityId={entityId}
      className={FieldClassName("hook-people-picker-list", error)}
      selectedPeople={Array.isArray(value) ? value : []}
      onChange={onChange}
      onRemovePerson={onRemovePerson}
      meta={meta}
    />
  );
};

export default HookPeoplePickerList;
