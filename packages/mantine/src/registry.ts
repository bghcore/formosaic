import { ComponentTypes, Dictionary } from "@formosaic/core";
import Textbox from "./fields/Textbox";
import NumberField from "./fields/Number";
import Toggle from "./fields/Toggle";
import Dropdown from "./fields/Dropdown";
import MultiSelect from "./fields/MultiSelect";
import DateControl from "./fields/DateControl";
import Slider from "./fields/Slider";
import RadioGroup from "./fields/RadioGroup";
import CheckboxGroup from "./fields/CheckboxGroup";
import Textarea from "./fields/Textarea";
import DynamicFragment from "./fields/DynamicFragment";
import ReadOnly from "./fields/readonly/ReadOnly";
import RatingField from "./fields/Rating";
import AutocompleteField from "./fields/Autocomplete";
import DateTimeField from "./fields/DateTime";
import DateRange from "./fields/DateRange";
import PhoneInput from "./fields/PhoneInput";
import FileUploadField from "./fields/FileUpload";
import ColorPicker from "./fields/ColorPicker";
import MultiSelectSearchField from "./fields/MultiSelectSearch";
import StatusDropdown from "./fields/StatusDropdown";
import DocumentLinks from "./fields/DocumentLinks";
import ReadOnlyArray from "./fields/readonly/ReadOnlyArray";
import ReadOnlyDateTime from "./fields/readonly/ReadOnlyDateTime";
import ReadOnlyCumulativeNumber from "./fields/readonly/ReadOnlyCumulativeNumber";
import ReadOnlyRichText from "./fields/readonly/ReadOnlyRichText";
import ReadOnlyWithButton from "./fields/readonly/ReadOnlyWithButton";
import React from "react";

/** Creates the default Mantine v7 field registry for use with InjectedFieldProvider */
export function createMantineFieldRegistry(): Dictionary<React.JSX.Element> {
  return {
    [ComponentTypes.Textbox]: React.createElement(Textbox),
    [ComponentTypes.Number]: React.createElement(NumberField),
    [ComponentTypes.Toggle]: React.createElement(Toggle),
    [ComponentTypes.Dropdown]: React.createElement(Dropdown),
    [ComponentTypes.MultiSelect]: React.createElement(MultiSelect),
    [ComponentTypes.DateControl]: React.createElement(DateControl),
    [ComponentTypes.Slider]: React.createElement(Slider),
    [ComponentTypes.RadioGroup]: React.createElement(RadioGroup),
    [ComponentTypes.CheckboxGroup]: React.createElement(CheckboxGroup),
    [ComponentTypes.Textarea]: React.createElement(Textarea),
    [ComponentTypes.Fragment]: React.createElement(DynamicFragment),
    [ComponentTypes.ReadOnly]: React.createElement(ReadOnly),
    [ComponentTypes.Rating]: React.createElement(RatingField),
    [ComponentTypes.Autocomplete]: React.createElement(AutocompleteField),
    [ComponentTypes.DateTime]: React.createElement(DateTimeField),
    [ComponentTypes.DateRange]: React.createElement(DateRange),
    [ComponentTypes.PhoneInput]: React.createElement(PhoneInput),
    [ComponentTypes.FileUpload]: React.createElement(FileUploadField),
    [ComponentTypes.ColorPicker]: React.createElement(ColorPicker),
    [ComponentTypes.MultiSelectSearch]: React.createElement(MultiSelectSearchField),
    [ComponentTypes.StatusDropdown]: React.createElement(StatusDropdown),
    [ComponentTypes.DocumentLinks]: React.createElement(DocumentLinks),
    [ComponentTypes.ReadOnlyArray]: React.createElement(ReadOnlyArray),
    [ComponentTypes.ReadOnlyDateTime]: React.createElement(ReadOnlyDateTime),
    [ComponentTypes.ReadOnlyCumulativeNumber]: React.createElement(ReadOnlyCumulativeNumber),
    [ComponentTypes.ReadOnlyRichText]: React.createElement(ReadOnlyRichText),
    [ComponentTypes.ReadOnlyWithButton]: React.createElement(ReadOnlyWithButton),
  };
}
