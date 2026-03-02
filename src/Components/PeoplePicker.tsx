import { GetUserDetailsFromToken } from "@cxpui/common";
import { CxpAuthContext } from "@cxpui/commoncontrols";
import { IPeoplePickerProps, IPersonaProps, NormalPeoplePicker } from "@fluentui/react";
import React from "react";
import { IHookPerson } from "../../../Models/IHookPerson";
import { HookInlineFormConstants, UnassignedPerson, suggestionProps } from "../Constants";
import { GetFieldDataTestId, onRenderPerson, onRenderPersonSuggestion, onResolveSuggestions } from "../Helpers";
import { HookInlineFormStrings } from "../Strings";

interface ISinglePeoplePickerProps {
  fieldName: string;
  programName: string;
  entityType: string;
  entityId: string;
  className?: string;
  ariaLabel?: string;
  placeholder?: string;
  selectedPerson: IPersonaProps;
  meta?: IPeoplePickerProps;
  hideLoggedInUser?: boolean;
  onChange: (person?: IPersonaProps) => void;
}

const PeoplePicker = (props: ISinglePeoplePickerProps) => {
  const {
    fieldName,
    programName,
    entityType,
    entityId,
    className,
    placeholder,
    selectedPerson,
    meta,
    hideLoggedInUser,
    onChange
  } = props;
  const { unassigned, defaultPeopleSearch } = HookInlineFormConstants;
  const { remove } = HookInlineFormStrings;

  const [showUnassigned, setShowUnassigned] = React.useState<boolean>(true);
  const [selectingPerson, setSelectingPerson] = React.useState<boolean>(false);
  const peoplePickerRef = React.useRef(null);

  const authContext = React.useContext(CxpAuthContext);
  const userDetails = hideLoggedInUser ? undefined : GetUserDetailsFromToken(authContext);

  const onRemovePersonUnassigned = (upn: string) => {
    setShowUnassigned(false);
    setSelectingPerson(true);
    peoplePickerRef.current?._userTriggeredSuggestions();
  };

  const onChangeUnassigned = (items?: IPersonaProps[]) => {
    if (items?.length === 1) {
      const person = items[0] as IHookPerson;
      if (person.Upn === unassigned) {
        onChange(null);
        setShowUnassigned(true);
      } else {
        onChange(person);
      }
      setSelectingPerson(false);
    }
  };

  const onDismiss = () => {
    if (!selectedPerson) {
      setShowUnassigned(true);
    }
    setSelectingPerson(false);
    peoplePickerRef.current?.dismissSuggestions();
  };

  return (
    <div data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}>
      <NormalPeoplePicker
        componentRef={peoplePickerRef}
        className={className}
        onResolveSuggestions={(filter: string) => onResolveSuggestions(filter, userDetails, true)}
        onRenderSuggestionsItem={onRenderPersonSuggestion}
        onRenderItem={props => onRenderPerson(props, onRemovePersonUnassigned)}
        resolveDelay={500}
        itemLimit={1}
        pickerSuggestionsProps={suggestionProps}
        onEmptyResolveSuggestions={() => onResolveSuggestions(defaultPeopleSearch, userDetails, true)}
        removeButtonAriaLabel={remove}
        selectedItems={
          selectingPerson ? [] : selectedPerson ? [selectedPerson] : showUnassigned ? [UnassignedPerson] : []
        }
        onChange={onChangeUnassigned}
        inputProps={{
          placeholder
        }}
        pickerCalloutProps={{
          className: "people-picker-callout",
          onDismiss
        }}
        {...meta}
      />
    </div>
  );
};

export default PeoplePicker;
