import React, { useCallback } from "react";
import { ComponentTypes } from "@bghcore/dynamic-forms-core";

/** Palette field types grouped by category */
const PALETTE_GROUPS: { label: string; types: { key: string; label: string }[] }[] = [
  {
    label: "Input",
    types: [
      { key: ComponentTypes.Textbox, label: "Textbox" },
      { key: ComponentTypes.Number, label: "Number" },
      { key: ComponentTypes.Textarea, label: "Textarea" },
      { key: ComponentTypes.RichText, label: "Rich Text" },
      { key: ComponentTypes.DateControl, label: "Date" },
      { key: ComponentTypes.Slider, label: "Slider" },
    ],
  },
  {
    label: "Selection",
    types: [
      { key: ComponentTypes.Dropdown, label: "Dropdown" },
      { key: ComponentTypes.SimpleDropdown, label: "Simple Dropdown" },
      { key: ComponentTypes.MultiSelect, label: "Multi Select" },
      { key: ComponentTypes.MultiSelectSearch, label: "Multi Search" },
      { key: ComponentTypes.StatusDropdown, label: "Status Dropdown" },
      { key: ComponentTypes.Toggle, label: "Toggle" },
      { key: ComponentTypes.ChoiceSet, label: "Choice Set" },
    ],
  },
  {
    label: "Layout",
    types: [
      { key: ComponentTypes.Fragment, label: "Fragment" },
      { key: ComponentTypes.FieldArray, label: "Field Array" },
      { key: ComponentTypes.PopOutEditor, label: "Pop Out Editor" },
      { key: ComponentTypes.DocumentLinks, label: "Document Links" },
    ],
  },
  {
    label: "Read Only",
    types: [
      { key: ComponentTypes.ReadOnly, label: "Read Only" },
      { key: ComponentTypes.ReadOnlyArray, label: "Read Only Array" },
      { key: ComponentTypes.ReadOnlyDateTime, label: "Read Only DateTime" },
      { key: ComponentTypes.ReadOnlyRichText, label: "Read Only Rich Text" },
      { key: ComponentTypes.ReadOnlyCumulativeNumber, label: "Read Only Number" },
      { key: ComponentTypes.ReadOnlyWithButton, label: "Read Only + Button" },
    ],
  },
];

export function FieldPalette() {
  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>, type: string) => {
      e.dataTransfer.setData("application/x-designer-field-type", type);
      e.dataTransfer.effectAllowed = "copy";
    },
    [],
  );

  return (
    <div className="dfd-palette">
      <h3 className="dfd-palette-title">Fields</h3>
      {PALETTE_GROUPS.map((group) => (
        <div key={group.label} className="dfd-panel-section">
          <h4 className="dfd-panel-section-title">{group.label}</h4>
          <div className="dfd-palette-grid">
            {group.types.map(({ key, label }) => (
              <div
                key={key}
                className="dfd-palette-item"
                draggable
                onDragStart={(e) => handleDragStart(e, key)}
                title={`Drag to add ${label}`}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
