import React, { useMemo, useState, useCallback } from "react";
import type { IFormConfig } from "@bghcore/dynamic-forms-core";
import { useDesigner } from "../state/useDesigner";

export function ConfigPreview() {
  const { state } = useDesigner();
  const [copied, setCopied] = useState(false);

  const config = useMemo<IFormConfig>(() => {
    const c: IFormConfig = {
      version: 2,
      fields: state.fields,
      fieldOrder: state.fieldOrder,
    };
    if (state.wizard) c.wizard = state.wizard;
    if (Object.keys(state.settings).length > 0) c.settings = state.settings;
    return c;
  }, [state.fields, state.fieldOrder, state.wizard, state.settings]);

  const json = useMemo(() => JSON.stringify(config, null, 2), [config]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for non-secure contexts
      const textarea = document.createElement("textarea");
      textarea.value = json;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [json]);

  return (
    <div className="dfd-preview">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h4 className="dfd-panel-section-title" style={{ margin: 0, border: "none", paddingBottom: 0 }}>
          IFormConfig Preview
        </h4>
        <button className="dfd-btn dfd-btn-sm" onClick={handleCopy}>
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="dfd-preview-code">{json}</pre>
    </div>
  );
}
