import { ComponentTypes, Dictionary } from "@formosaic/core";
import Textbox from "./fields/Textbox";
import NumberField from "./fields/Number";
import Toggle from "./fields/Toggle";
import Dropdown from "./fields/Dropdown";
import MultiSelect from "./fields/MultiSelect";
import DateControl from "./fields/DateControl";
import Slider from "./fields/Slider";
import DynamicFragment from "./fields/DynamicFragment";
import MultiSelectSearch from "./fields/MultiSelectSearch";
import Textarea from "./fields/Textarea";
import DocumentLinks from "./fields/DocumentLinks";
import StatusDropdown from "./fields/StatusDropdown";
import ReadOnly from "./fields/readonly/ReadOnly";
import ReadOnlyArray from "./fields/readonly/ReadOnlyArray";
import ReadOnlyDateTime from "./fields/readonly/ReadOnlyDateTime";
import ReadOnlyCumulativeNumber from "./fields/readonly/ReadOnlyCumulativeNumber";
import ReadOnlyRichText from "./fields/readonly/ReadOnlyRichText";
import ReadOnlyWithButton from "./fields/readonly/ReadOnlyWithButton";
import RadioGroup from "./fields/RadioGroup";
import CheckboxGroup from "./fields/CheckboxGroup";
import RatingField from "./fields/Rating";
import ColorPicker from "./fields/ColorPicker";
import AutocompleteField from "./fields/Autocomplete";
import FileUpload from "./fields/FileUpload";
import DateRange from "./fields/DateRange";
import DateTimeField from "./fields/DateTime";
import PhoneInput from "./fields/PhoneInput";
import React from "react";

/** Creates the default headless (unstyled semantic HTML) field registry for use with InjectedFieldProvider */
export function createHeadlessFieldRegistry(): Dictionary<React.JSX.Element> {
  return {
    [ComponentTypes.Textbox]: React.createElement(Textbox),
    [ComponentTypes.Number]: React.createElement(NumberField),
    [ComponentTypes.Toggle]: React.createElement(Toggle),
    [ComponentTypes.Dropdown]: React.createElement(Dropdown),
    [ComponentTypes.MultiSelect]: React.createElement(MultiSelect),
    [ComponentTypes.DateControl]: React.createElement(DateControl),
    [ComponentTypes.Slider]: React.createElement(Slider),
    [ComponentTypes.Fragment]: React.createElement(DynamicFragment),
    [ComponentTypes.MultiSelectSearch]: React.createElement(MultiSelectSearch),
    [ComponentTypes.Textarea]: React.createElement(Textarea),
    [ComponentTypes.DocumentLinks]: React.createElement(DocumentLinks),
    [ComponentTypes.StatusDropdown]: React.createElement(StatusDropdown),
    [ComponentTypes.ReadOnly]: React.createElement(ReadOnly),
    [ComponentTypes.ReadOnlyArray]: React.createElement(ReadOnlyArray),
    [ComponentTypes.ReadOnlyDateTime]: React.createElement(ReadOnlyDateTime),
    [ComponentTypes.ReadOnlyCumulativeNumber]: React.createElement(ReadOnlyCumulativeNumber),
    [ComponentTypes.ReadOnlyRichText]: React.createElement(ReadOnlyRichText),
    [ComponentTypes.ReadOnlyWithButton]: React.createElement(ReadOnlyWithButton),
    [ComponentTypes.RadioGroup]: React.createElement(RadioGroup),
    [ComponentTypes.CheckboxGroup]: React.createElement(CheckboxGroup),
    [ComponentTypes.Rating]: React.createElement(RatingField),
    [ComponentTypes.ColorPicker]: React.createElement(ColorPicker),
    [ComponentTypes.Autocomplete]: React.createElement(AutocompleteField),
    [ComponentTypes.FileUpload]: React.createElement(FileUpload),
    [ComponentTypes.DateRange]: React.createElement(DateRange),
    [ComponentTypes.DateTime]: React.createElement(DateTimeField),
    [ComponentTypes.PhoneInput]: React.createElement(PhoneInput),
  };
}
