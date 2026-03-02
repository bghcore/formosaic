import { IBasePickerSuggestionsProps } from "@fluentui/react";
import { IHookPerson } from "./Interfaces/IHookPerson";
import { HookInlineFormStrings } from "./Strings";

export const HookInlineFormConstants = {
  defaultExpandCutoffCount: 12,
  loadingShimmerCount: 12,
  loadingFieldShimmerHeight: 32,
  na: "n/a",
  dynamicFragment: "DynamicFragment",
  newStatusReasonDescription: "NewStatusReasonDescription",
  statusReasonDescription: "StatusReasonDescription",
  dropdown: "Dropdown",
  multiselect: "Multiselect",
  statusDropdown: "StatusDropdown",
  panelActionKeys: {
    cancel: "Cancel",
    close: "Close",
    create: "Create",
    update: "Update",
  },
  unassigned: "Unassigned",
  defaultPeopleSearch: "a",
  urlRegex: /(http(s?)):\/\//i,
  errorColor: "#a4262c",
  "150kb": 150,
  "32kb": 32,
};

export const suggestionProps: IBasePickerSuggestionsProps = {
  loadingText: HookInlineFormStrings.loading,
  noResultsFoundText: HookInlineFormStrings.noResultsFound,
  showRemoveButtons: false,
  suggestionsHeaderText: HookInlineFormStrings.suggestedPeople,
  suggestionsContainerAriaLabel: HookInlineFormStrings.suggestedContacts,
};

export const UnassignedPerson: IHookPerson = {
  Upn: HookInlineFormConstants.unassigned,
};
