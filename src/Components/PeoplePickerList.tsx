import { GetUserDetailsFromToken } from "@cxpui/common";
import { CxpAuthContext } from "@cxpui/commoncontrols";
import { IPeoplePickerProps, IPersonaProps, ListPeoplePicker } from "@fluentui/react";
import React from "react";
import { HookInlineFormConstants, suggestionProps } from "../Constants";
import { GetFieldDataTestId, onRenderPerson, onRenderPersonSuggestion, onResolveSuggestions } from "../Helpers";
import { HookInlineFormStrings } from "../Strings";

interface IPeoplePickerListProps {
  fieldName?: string;
  programName?: string;
  entityType?: string;
  entityId?: string;
  className?: string;
  ariaLabel?: string;
  placeholder?: string;
  selectedPeople: IPersonaProps[];
  meta?: IPeoplePickerProps;
  hideLoggedInUser?: boolean;
  onChange: (items?: IPersonaProps[]) => void;
  onRemovePerson: (upn: string) => void;
}

const PeoplePickerList = (props: IPeoplePickerListProps) => {
  const {
    fieldName,
    programName,
    entityType,
    entityId,
    className,
    placeholder,
    selectedPeople,
    meta,
    hideLoggedInUser,
    onChange,
    onRemovePerson
  } = props;
  const { defaultPeopleSearch } = HookInlineFormConstants;
  const { remove } = HookInlineFormStrings;

  const authContext = React.useContext(CxpAuthContext);
  const userDetails = hideLoggedInUser ? undefined : GetUserDetailsFromToken(authContext);

  return (
    <ListPeoplePicker
      className={className}
      onResolveSuggestions={(filter: string) => onResolveSuggestions(filter, userDetails)}
      onRenderSuggestionsItem={onRenderPersonSuggestion}
      onRenderItem={props => onRenderPerson(props, onRemovePerson)}
      resolveDelay={500}
      pickerSuggestionsProps={suggestionProps}
      onEmptyResolveSuggestions={() => onResolveSuggestions(defaultPeopleSearch, userDetails)}
      removeButtonAriaLabel={remove}
      selectedItems={selectedPeople ? selectedPeople : []}
      onChange={onChange}
      inputProps={{ placeholder }}
      data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
      {...meta}
    />
  );
};

export default PeoplePickerList;
