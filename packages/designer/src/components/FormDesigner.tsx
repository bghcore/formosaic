import React, { useState } from "react";
import { useDesigner } from "../state/useDesigner";
import { FieldPalette } from "./FieldPalette";
import { FormCanvas } from "./FormCanvas";
import { FieldConfigPanel } from "./FieldConfigPanel";
import { RuleBuilder } from "./RuleBuilder";
import { ConfigPreview } from "./ConfigPreview";
import { WizardConfigurator } from "./WizardConfigurator";
import { ImportExport } from "./ImportExport";

type ToolbarTab = "design" | "rules" | "wizard" | "preview" | "import-export";

export interface IFormDesignerProps {
  /** Optional CSS class for the root element */
  className?: string;
  /** Optional inline styles for the root element */
  style?: React.CSSProperties;
}

export function FormDesigner({ className, style }: IFormDesignerProps) {
  const { state, undo, redo } = useDesigner();
  const [activeTab, setActiveTab] = useState<ToolbarTab>("design");

  const tabs: { key: ToolbarTab; label: string }[] = [
    { key: "design", label: "Design" },
    { key: "rules", label: "Rules" },
    { key: "wizard", label: "Wizard" },
    { key: "preview", label: "Preview" },
    { key: "import-export", label: "Import / Export" },
  ];

  return (
    <div
      className={`dfd-root${className ? ` ${className}` : ""}`}
      style={style}
    >
      {/* Toolbar */}
      <div className="dfd-toolbar">
        <div className="dfd-tabs" style={{ border: "none", margin: 0 }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`dfd-tab${activeTab === tab.key ? " dfd-tab-active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 4, alignItems: "center" }}>
          <button
            className="dfd-btn dfd-btn-sm"
            onClick={undo}
            disabled={state.undoStack.length === 0}
            title="Undo (Ctrl+Z)"
          >
            Undo
          </button>
          <button
            className="dfd-btn dfd-btn-sm"
            onClick={redo}
            disabled={state.redoStack.length === 0}
            title="Redo (Ctrl+Y)"
          >
            Redo
          </button>
          {state.isDirty && (
            <span style={{ fontSize: "var(--designer-font-size-sm)", color: "var(--designer-text-secondary)" }}>
              Unsaved changes
            </span>
          )}
          <span style={{ fontSize: "var(--designer-font-size-sm)", color: "var(--designer-text-secondary)" }}>
            {state.fieldOrder.length} field{state.fieldOrder.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="dfd-body">
        {activeTab === "design" && (
          <>
            <FieldPalette />
            <FormCanvas />
            <FieldConfigPanel />
          </>
        )}

        {activeTab === "rules" && (
          <>
            <FieldPalette />
            <FormCanvas />
            <div className="dfd-panel">
              <h3 className="dfd-panel-title">Rule Builder</h3>
              {state.selectedFieldId ? (
                <RuleBuilder />
              ) : (
                <div className="dfd-panel-empty">
                  Select a field to manage its rules
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "wizard" && (
          <>
            <div style={{ flex: 1, overflow: "auto", padding: "var(--designer-spacing-lg)" }}>
              <WizardConfigurator />
            </div>
          </>
        )}

        {activeTab === "preview" && (
          <div style={{ flex: 1, overflow: "auto", padding: "var(--designer-spacing-lg)" }}>
            <ConfigPreview />
          </div>
        )}

        {activeTab === "import-export" && (
          <div style={{ flex: 1, overflow: "auto", padding: "var(--designer-spacing-lg)", maxWidth: 700 }}>
            <ImportExport />
          </div>
        )}
      </div>
    </div>
  );
}
