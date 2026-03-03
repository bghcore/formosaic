import React from "react";
import { Dictionary } from "../utils";
import { IBusinessRule } from "../types/IBusinessRule";
import { IConfigBusinessRules } from "../types/IConfigBusinessRules";

export interface IHookFormDevToolsProps {
  configName: string;
  configRules?: IConfigBusinessRules;
  formValues?: Record<string, unknown>;
  formErrors?: Record<string, unknown>;
  dirtyFields?: Record<string, boolean>;
  enabled?: boolean;
}

export const HookFormDevTools: React.FC<IHookFormDevToolsProps> = (props) => {
  const {
    configName,
    configRules,
    formValues,
    formErrors,
    dirtyFields,
    enabled = true,
  } = props;

  const [isOpen, setIsOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"rules" | "values" | "errors" | "graph">("rules");

  if (!enabled) return null;

  const fieldRules = configRules?.fieldRules ?? {};
  const fieldNames = Object.keys(fieldRules);

  const dependencyGraph = React.useMemo(() => {
    const lines: string[] = [];
    for (const [name, rule] of Object.entries(fieldRules)) {
      if (rule.dependentFields?.length) {
        lines.push(`${name} -> ${rule.dependentFields.join(", ")}`);
      }
      if (rule.comboDependsOnFields?.length) {
        lines.push(`${name} (combo depends on) ${rule.comboDependsOnFields.join(", ")}`);
      }
    }
    return lines;
  }, [fieldRules]);

  const containerStyle: React.CSSProperties = {
    position: "fixed",
    bottom: 0,
    right: 0,
    width: isOpen ? "400px" : "auto",
    maxHeight: isOpen ? "50vh" : "auto",
    background: "#1e1e1e",
    color: "#d4d4d4",
    fontFamily: "monospace",
    fontSize: "12px",
    zIndex: 9999,
    borderTopLeftRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 -2px 10px rgba(0,0,0,0.3)",
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "4px 8px",
    cursor: "pointer",
    background: active ? "#333" : "transparent",
    color: active ? "#fff" : "#888",
    border: "none",
    borderBottom: active ? "2px solid #007acc" : "2px solid transparent",
    fontFamily: "monospace",
    fontSize: "11px",
  });

  return (
    <div style={containerStyle} data-testid="hook-form-devtools">
      <div
        style={{ padding: "4px 8px", cursor: "pointer", background: "#333", display: "flex", justifyContent: "space-between", alignItems: "center" }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ color: "#007acc", fontWeight: "bold" }}>DevTools: {configName}</span>
        <span>{isOpen ? "\u25BC" : "\u25B2"}</span>
      </div>
      {isOpen && (
        <>
          <div style={{ display: "flex", borderBottom: "1px solid #333" }}>
            <button style={tabStyle(activeTab === "rules")} onClick={() => setActiveTab("rules")}>Rules ({fieldNames.length})</button>
            <button style={tabStyle(activeTab === "values")} onClick={() => setActiveTab("values")}>Values</button>
            <button style={tabStyle(activeTab === "errors")} onClick={() => setActiveTab("errors")}>Errors</button>
            <button style={tabStyle(activeTab === "graph")} onClick={() => setActiveTab("graph")}>Graph</button>
          </div>
          <div style={{ overflow: "auto", maxHeight: "calc(50vh - 60px)", padding: "8px" }}>
            {activeTab === "rules" && (
              <div>
                {fieldNames.map(name => {
                  const rule = fieldRules[name];
                  return (
                    <div key={name} style={{ marginBottom: "8px", borderBottom: "1px solid #333", paddingBottom: "4px" }}>
                      <div style={{ color: "#4ec9b0" }}>{name}</div>
                      <div>component: {rule.component ?? "\u2014"} | required: {String(rule.required ?? false)} | hidden: {String(rule.hidden ?? false)} | readOnly: {String(rule.readOnly ?? false)}</div>
                      {rule.validations?.length ? <div>validations: {rule.validations.join(", ")}</div> : null}
                      {rule.valueFunction ? <div>valueFunction: {rule.valueFunction}</div> : null}
                    </div>
                  );
                })}
              </div>
            )}
            {activeTab === "values" && (
              <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                {JSON.stringify(formValues, null, 2)}
              </pre>
            )}
            {activeTab === "errors" && (
              <pre style={{ margin: 0, whiteSpace: "pre-wrap", color: formErrors && Object.keys(formErrors).length > 0 ? "#f44747" : "#4ec9b0" }}>
                {formErrors && Object.keys(formErrors).length > 0
                  ? JSON.stringify(formErrors, null, 2)
                  : "No errors"}
              </pre>
            )}
            {activeTab === "graph" && (
              <div>
                {dependencyGraph.length > 0 ? (
                  dependencyGraph.map((line, i) => (
                    <div key={i} style={{ color: "#ce9178" }}>{line}</div>
                  ))
                ) : (
                  <div>No dependencies defined</div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
