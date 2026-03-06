import React, { useState, useCallback, useRef } from "react";
import type { IFieldConfig } from "@form-eng/core";
import { useDesigner } from "../state/useDesigner";

export function FormCanvas() {
  const {
    state,
    addField,
    removeField,
    duplicateField,
    reorderFields,
    setSelected,
  } = useDesigner();
  const { fields, fieldOrder, selectedFieldId } = state;

  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const dragSourceIndex = useRef<number | null>(null);

  const generateId = useCallback(
    (type: string) => {
      const base = type.charAt(0).toLowerCase() + type.slice(1);
      let counter = 1;
      let id = `${base}${counter}`;
      while (fields[id]) {
        counter++;
        id = `${base}${counter}`;
      }
      return id;
    },
    [fields],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = e.dataTransfer.types.includes(
      "application/x-designer-field-type",
    )
      ? "copy"
      : "move";
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (e.currentTarget === e.target) {
      setIsDragOver(false);
      setDragOverIndex(null);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      setDragOverIndex(null);

      const fieldType = e.dataTransfer.getData("application/x-designer-field-type");
      if (fieldType) {
        // Drop from palette: create new field
        const id = generateId(fieldType);
        const needsOptions =
          fieldType === "Dropdown" ||
          fieldType === "SimpleDropdown" ||
          fieldType === "Multiselect" ||
          fieldType === "MultiSelectSearch" ||
          fieldType === "StatusDropdown" ||
          fieldType === "ChoiceSet";
        const field: IFieldConfig = {
          type: fieldType,
          label: `New ${fieldType}`,
          ...(needsOptions
            ? {
                options: [
                  { value: "option1", label: "Option 1" },
                  { value: "option2", label: "Option 2" },
                ],
              }
            : {}),
        };
        const insertAt = dragOverIndex ?? fieldOrder.length;
        addField(id, field, insertAt);
        return;
      }

      // Reorder: drop from canvas
      const sourceIdx = dragSourceIndex.current;
      if (sourceIdx !== null && dragOverIndex !== null && sourceIdx !== dragOverIndex) {
        const newOrder = [...fieldOrder];
        const [moved] = newOrder.splice(sourceIdx, 1);
        const targetIdx = dragOverIndex > sourceIdx ? dragOverIndex - 1 : dragOverIndex;
        newOrder.splice(targetIdx, 0, moved);
        reorderFields(newOrder);
      }
      dragSourceIndex.current = null;
    },
    [generateId, fieldOrder, dragOverIndex, addField, reorderFields],
  );

  const handleCardDragStart = useCallback(
    (e: React.DragEvent, index: number) => {
      dragSourceIndex.current = index;
      e.dataTransfer.setData("application/x-designer-reorder", String(index));
      e.dataTransfer.effectAllowed = "move";
    },
    [],
  );

  const handleCardDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOverIndex(index);
    },
    [],
  );

  if (fieldOrder.length === 0) {
    return (
      <div
        className="dfd-canvas"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className={`dfd-canvas-empty${isDragOver ? " dfd-drag-over" : ""}`}>
          Drag fields from the palette to start building your form
        </div>
      </div>
    );
  }

  return (
    <div
      className="dfd-canvas"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={`dfd-canvas-drop-zone${isDragOver ? " dfd-drag-over" : ""}`}>
        {fieldOrder.map((id, index) => {
          const field = fields[id];
          if (!field) return null;
          const isSelected = selectedFieldId === id;
          const isDragTarget = dragOverIndex === index;
          const ruleCount = field.rules?.length ?? 0;

          return (
            <div
              key={id}
              className={`dfd-field-card${isSelected ? " dfd-selected" : ""}${isDragTarget ? " dfd-drag-over-card" : ""}`}
              onClick={() => setSelected(id)}
              draggable
              onDragStart={(e) => handleCardDragStart(e, index)}
              onDragOver={(e) => handleCardDragOver(e, index)}
              onDragLeave={() => setDragOverIndex(null)}
            >
              <span className="dfd-field-card-handle" title="Drag to reorder">
                &#x2630;
              </span>
              <div className="dfd-field-card-body">
                <div className="dfd-field-card-label">{field.label}</div>
                <div className="dfd-field-card-meta">
                  <span className="dfd-badge">{field.type}</span>
                  {field.required && (
                    <span className="dfd-badge dfd-badge-required">Required</span>
                  )}
                  {field.hidden && (
                    <span className="dfd-badge dfd-badge-hidden">Hidden</span>
                  )}
                  {ruleCount > 0 && (
                    <span className="dfd-badge dfd-badge-rules">
                      {ruleCount} rule{ruleCount !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
              <div className="dfd-field-card-actions">
                <button
                  className="dfd-btn dfd-btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateField(id);
                  }}
                  title="Duplicate field"
                >
                  Copy
                </button>
                <button
                  className="dfd-btn dfd-btn-sm dfd-btn-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeField(id);
                  }}
                  title="Delete field"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
