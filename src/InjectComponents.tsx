import { Dictionary } from "@cxpui/common";
import { ComponentTypes } from "@cxpui/commoncontrols/dist/DynamicLayout/Models/Enums";
import React from "react";
import HookADOTemplates from "./Fields/HookADOTemplates";
import HookADOWorkItem from "./Fields/HookADOWorkItem";
import HookChildEntitySearch from "./Fields/HookChildEntitySearch";
import HookDataCenterRegion from "./Fields/HookDataCenterRegion";
import HookDateControl from "./Fields/HookDateControl";
import HookDocumentLinks from "./Fields/HookDocumentLinks";
import HookDropdown from "./Fields/HookDropdown";
import HookFragment from "./Fields/HookFragment";
import HookMultiSelect from "./Fields/HookMultiSelect";
import HookMultiSelectSearch from "./Fields/HookMultiSelectSearch";
import HookNumber from "./Fields/HookNumber";
import HookPeoplePicker from "./Fields/HookPeoplePicker";
import HookPeoplePickerList from "./Fields/HookPeoplePickerList";
import HookPopOutEditor from "./Fields/HookPopOutEditor";
import HookProductTaxonomy from "./Fields/HookProductTaxonomy";
import HookSimpleDropdown from "./Fields/HookSimpleDropdown";
import HookSlider from "./Fields/HookSlider";
import HookStatusDropdown from "./Fields/HookStatusDropdown";
import HookStatusReasonDescription from "./Fields/HookStatusReasonDescription";
import HookSubscriptionsTextArea from "./Fields/HookSubscriptionsTextArea";
import HookTextbox from "./Fields/HookTextbox";
import HookToggle from "./Fields/HookToggle";
import HookReadOnly from "./Fields/ReadOnly/HookReadOnly";
import HookReadOnlyACRImpactFields from "./Fields/ReadOnly/HookReadOnlyACRImpactFields";
import HookReadOnlyArray from "./Fields/ReadOnly/HookReadOnlyArray";
import HookReadOnlyArrayFieldAsTable from "./Fields/ReadOnly/HookReadOnlyArrayFieldAsTable";
import HookReadOnlyCumulativeNumber from "./Fields/ReadOnly/HookReadOnlyCumulativeNumber";
import HookReadOnlyDateTime from "./Fields/ReadOnly/HookReadOnlyDateTime";
import HookReadOnlyListTable from "./Fields/ReadOnly/HookReadOnlyListTable";
import HookReadOnlyPerson from "./Fields/ReadOnly/HookReadOnlyPerson";
import HookReadOnlyRichText from "./Fields/ReadOnly/HookReadOnlyRichText";
import HookCustomerNameField from "./Fields/ReadOnly/HookCustomerNameField";
import HookReadOnlyWithButton from "./Fields/ReadOnly/HookReadOnlyWithButton";
import HookMSXViewLink from "./Fields/ReadOnly/HookMSXViewLink";

export const hookFields: Dictionary<JSX.Element> = {
  [ComponentTypes.Dropdown]: <HookDropdown />,
  [ComponentTypes.Textarea]: <HookPopOutEditor />,
  [ComponentTypes.Toggle]: <HookToggle />,
  [ComponentTypes.Multiselect]: <HookMultiSelect />,
  [ComponentTypes.DateControl]: <HookDateControl />,
  [ComponentTypes.Textbox]: <HookTextbox />,
  [ComponentTypes.Number]: <HookNumber />,
  [ComponentTypes.PeoplePicker]: <HookPeoplePicker />,
  PeoplePickerList: <HookPeoplePickerList />,
  [ComponentTypes.StatusDropdown]: <HookStatusDropdown />,
  [ComponentTypes.Slider]: <HookSlider />,
  DynamicDocumentLinksWrapper: <HookDocumentLinks />,
  DynamicProductTaxonomy: <HookProductTaxonomy />,
  DataCenterRegion: <HookDataCenterRegion />,
  DynamicStatusReasonDescription: <HookStatusReasonDescription />,
  [ComponentTypes.PersonUpnOnly]: <HookReadOnlyPerson />,
  CumulativeNumberField: <HookReadOnlyCumulativeNumber />,
  [ComponentTypes.ReadOnlyField]: <HookReadOnly />,
  [ComponentTypes.ReadOnlyDateTimeField]: <HookReadOnlyDateTime />,
  [ComponentTypes.ReadOnlyArrayField]: <HookReadOnlyArray />,
  [ComponentTypes.ListTableControl]: <HookReadOnlyListTable />,
  [ComponentTypes.ReadOnlyRichTextField]: <HookReadOnlyRichText />,
  RichText: <HookPopOutEditor />,
  DynamicFragment: <HookFragment />,
  SubscriptionsTextArea: <HookSubscriptionsTextArea />,
  HookSimpleDropdown: <HookSimpleDropdown />,
  HookChildEntitySearch: <HookChildEntitySearch />,
  HookADOWorkItem: <HookADOWorkItem />,
  HookADOTemplates: <HookADOTemplates />,
  MultiSelectSearch: <HookMultiSelectSearch />,
  ArrayFieldAsTable: <HookReadOnlyArrayFieldAsTable />,
  ACRImpactFields: <HookReadOnlyACRImpactFields />,
  CustomerNameField: <HookCustomerNameField />,
  ReadOnlyFieldWithButton: <HookReadOnlyWithButton />,
  MSXViewLink: <HookMSXViewLink />
};
