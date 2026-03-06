import React, { useState, useCallback, useRef } from "react";
import type { IFormConfig } from "@form-eng/core";
import { useDesigner } from "../state/useDesigner";

export function ImportExport() {
  const { importConfig, exportConfig, state } = useDesigner();
  const [importText, setImportText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndImport = useCallback(
    (json: string) => {
      setError(null);
      setSuccess(null);
      try {
        const parsed = JSON.parse(json);
        if (!parsed || typeof parsed !== "object") {
          setError("Must be a JSON object");
          return;
        }
        if (parsed.version !== 2) {
          setError("Only IFormConfig v2 is supported (version must be 2)");
          return;
        }
        if (!parsed.fields || typeof parsed.fields !== "object") {
          setError('Config must have a "fields" object');
          return;
        }
        importConfig(parsed as IFormConfig);
        setImportText("");
        setSuccess(
          `Imported ${Object.keys(parsed.fields).length} fields successfully`,
        );
        setTimeout(() => setSuccess(null), 3000);
      } catch {
        setError("Invalid JSON format");
      }
    },
    [importConfig],
  );

  const handleImportPaste = useCallback(() => {
    if (!importText.trim()) {
      setError("Paste a JSON config first");
      return;
    }
    validateAndImport(importText);
  }, [importText, validateAndImport]);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          validateAndImport(reader.result);
        }
      };
      reader.onerror = () => setError("Failed to read file");
      reader.readAsText(file);
      // Reset the input so the same file can be uploaded again
      e.target.value = "";
    },
    [validateAndImport],
  );

  const handleExportDownload = useCallback(() => {
    const config = exportConfig();
    const json = JSON.stringify(config, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "form-config.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [exportConfig]);

  return (
    <div>
      {/* Import */}
      <div className="dfd-panel-section">
        <h4 className="dfd-panel-section-title">Import</h4>
        <textarea
          className="dfd-import-area"
          placeholder='Paste IFormConfig JSON here (version: 2)...'
          value={importText}
          onChange={(e) => {
            setImportText(e.target.value);
            setError(null);
          }}
        />
        {error && <div className="dfd-error-text">{error}</div>}
        {success && (
          <div style={{ color: "var(--designer-success)", fontSize: "var(--designer-font-size-sm)", marginTop: 4 }}>
            {success}
          </div>
        )}
        <div className="dfd-import-actions">
          <button className="dfd-btn dfd-btn-primary" onClick={handleImportPaste}>
            Import from Text
          </button>
          <button
            className="dfd-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            Import from File
          </button>
          <input
            ref={fileInputRef}
            className="dfd-file-input"
            type="file"
            accept=".json"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      {/* Export */}
      <div className="dfd-panel-section">
        <h4 className="dfd-panel-section-title">Export</h4>
        <p style={{ color: "var(--designer-text-secondary)", margin: "0 0 8px 0", fontSize: "var(--designer-font-size-sm)" }}>
          Download the current form configuration as a JSON file.
          {state.isDirty && " (unsaved changes)"}
        </p>
        <button
          className="dfd-btn dfd-btn-primary"
          onClick={handleExportDownload}
          disabled={state.fieldOrder.length === 0}
        >
          Download JSON
        </button>
      </div>
    </div>
  );
}
