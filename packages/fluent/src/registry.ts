import { ComponentTypes, Dictionary } from "@form-eng/core";
import Textbox from "./fields/Textbox";
import NumberField from "./fields/Number";
import Toggle from "./fields/Toggle";
import DropdownField from "./fields/Dropdown";
import MultiSelect from "./fields/MultiSelect";
import DateControl from "./fields/DateControl";
import SliderField from "./fields/Slider";
import Fragment from "./fields/DynamicFragment";
import SimpleDropdown from "./fields/SimpleDropdown";
import MultiSelectSearch from "./fields/MultiSelectSearch";
import PopOutEditor from "./fields/PopOutEditor";
import DocumentLinksField from "./fields/DocumentLinks";
import StatusDropdownField from "./fields/StatusDropdown";
import ReadOnly from "./fields/readonly/ReadOnly";
import ReadOnlyArray from "./fields/readonly/ReadOnlyArray";
import ReadOnlyDateTime from "./fields/readonly/ReadOnlyDateTime";
import ReadOnlyCumulativeNumber from "./fields/readonly/ReadOnlyCumulativeNumber";
import ReadOnlyRichText from "./fields/readonly/ReadOnlyRichText";
import ReadOnlyWithButton from "./fields/readonly/ReadOnlyWithButton";
import React from "react";

/** Creates the default Fluent UI v9 field registry for use with InjectedFieldProvider */
export function createFluentFieldRegistry(): Dictionary<React.JSX.Element> {
  return {
    [ComponentTypes.Textbox]: React.createElement(Textbox),
    [ComponentTypes.Number]: React.createElement(NumberField),
    [ComponentTypes.Toggle]: React.createElement(Toggle),
    [ComponentTypes.Dropdown]: React.createElement(DropdownField),
    [ComponentTypes.MultiSelect]: React.createElement(MultiSelect),
    [ComponentTypes.DateControl]: React.createElement(DateControl),
    [ComponentTypes.Slider]: React.createElement(SliderField),
    [ComponentTypes.Fragment]: React.createElement(Fragment),
    [ComponentTypes.SimpleDropdown]: React.createElement(SimpleDropdown),
    [ComponentTypes.MultiSelectSearch]: React.createElement(MultiSelectSearch),
    [ComponentTypes.Textarea]: React.createElement(PopOutEditor),
    [ComponentTypes.DocumentLinks]: React.createElement(DocumentLinksField),
    [ComponentTypes.StatusDropdown]: React.createElement(StatusDropdownField),
    [ComponentTypes.ReadOnly]: React.createElement(ReadOnly),
    [ComponentTypes.ReadOnlyArray]: React.createElement(ReadOnlyArray),
    [ComponentTypes.ReadOnlyDateTime]: React.createElement(ReadOnlyDateTime),
    [ComponentTypes.ReadOnlyCumulativeNumber]: React.createElement(ReadOnlyCumulativeNumber),
    [ComponentTypes.ReadOnlyRichText]: React.createElement(ReadOnlyRichText),
    [ComponentTypes.ReadOnlyWithButton]: React.createElement(ReadOnlyWithButton),
  };
}
