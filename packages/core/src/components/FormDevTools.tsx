import React from "react";
import { IRuntimeFormState, IRuntimeFieldState } from "../types/IRuntimeFieldState";
import { getRenderCounts, getLastRenderedFields, getTotalFormRenders, resetRenderTracker } from "../helpers/RenderTracker";
import { getTimeline, clearTimeline, ITimelineEvent } from "../helpers/EventTimeline";
import { ITemplateMeta } from "../types/IResolvedFormConfig";

export interface IFormDevToolsProps {
  configName: string;
  formState?: IRuntimeFormState;
  formValues?: Record<string, unknown>;
  formErrors?: Record<string, unknown>;
  dirtyFields?: Record<string, boolean>;
  enabled?: boolean;
  /** Template provenance metadata from IResolvedFormConfig._templateMeta */
  templateMeta?: ITemplateMeta;
}

type TabKey = "rules" | "values" | "errors" | "graph" | "performance" | "depgraph" | "timeline";

export const FormDevTools: React.FC<IFormDevToolsProps> = (props) => {
  const { configName, formState, formValues, formErrors, dirtyFields, enabled = true, templateMeta } = props;

  const [isOpen, setIsOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<TabKey>("rules");
  const [timelineFilter, setTimelineFilter] = React.useState("");
  const [depGraphSort, setDepGraphSort] = React.useState<"name" | "depCount">("name");
  const [, forceUpdate] = React.useReducer((x: number) => x + 1, 0);

  if (!enabled) return null;

  const fieldStates = formState?.fieldStates ?? {};
  const fieldNames = Object.keys(fieldStates);

  const dependencyGraph = React.useMemo(() => {
    const lines: string[] = [];
    for (const [name, state] of Object.entries(fieldStates)) {
      if (state.dependentFields?.length) {
        lines.push(`${name} -> ${state.dependentFields.join(", ")}`);
      }
      if (state.dependsOnFields?.length) {
        lines.push(`${name} (depends on) ${state.dependsOnFields.join(", ")}`);
      }
    }
    return lines;
  }, [fieldStates]);

  const containerStyle: React.CSSProperties = {
    position: "fixed", bottom: 0, right: 0,
    width: isOpen ? "520px" : "auto", maxHeight: isOpen ? "50vh" : "auto",
    background: "#1e1e1e", color: "#d4d4d4", fontFamily: "monospace", fontSize: "12px",
    zIndex: 9999, borderTopLeftRadius: "8px", overflow: "hidden", boxShadow: "0 -2px 10px rgba(0,0,0,0.3)",
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "4px 8px", cursor: "pointer",
    background: active ? "#333" : "transparent", color: active ? "#fff" : "#888",
    border: "none", borderBottom: active ? "2px solid #007acc" : "2px solid transparent",
    fontFamily: "monospace", fontSize: "11px",
  });

  const thStyle: React.CSSProperties = {
    textAlign: "left", padding: "3px 6px", borderBottom: "1px solid #555",
    fontWeight: "bold", color: "#fff", fontSize: "11px",
  };

  const tdStyle: React.CSSProperties = {
    padding: "3px 6px", borderBottom: "1px solid #333", fontSize: "11px",
  };

  const btnStyle: React.CSSProperties = {
    padding: "2px 8px", margin: "0 4px", cursor: "pointer",
    background: "#333", color: "#d4d4d4", border: "1px solid #555",
    fontFamily: "monospace", fontSize: "10px", borderRadius: "3px",
  };

  // --- Performance Tab ---
  const renderPerformanceTab = () => {
    const counts = getRenderCounts();
    const lastRendered = getLastRenderedFields();
    const totalRenders = getTotalFormRenders();
    const entries = Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    const avgCount = entries.length > 0
      ? entries.reduce((sum, [, c]) => sum + c, 0) / entries.length
      : 0;

    return (
      <div>
        <div style={{ marginBottom: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>Total form renders: <strong style={{ color: "#4ec9b0" }}>{totalRenders}</strong></span>
          <button style={btnStyle} onClick={() => { resetRenderTracker(); forceUpdate(); }}>Reset</button>
          <button style={btnStyle} onClick={() => forceUpdate()}>Refresh</button>
        </div>
        {entries.length === 0 ? (
          <div>No render data yet.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Field</th>
                <th style={thStyle}>Renders</th>
                <th style={thStyle}>Last Cycle</th>
                <th style={thStyle}>Hot</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(([fieldName, count]) => {
                const isHot = count > avgCount * 1.5;
                const wasLastRendered = lastRendered.has(fieldName);
                return (
                  <tr key={fieldName} style={isHot ? { background: "#3e2a00" } : undefined}>
                    <td style={tdStyle}>{fieldName}</td>
                    <td style={{ ...tdStyle, color: isHot ? "#ff9900" : "#d4d4d4" }}>{count}</td>
                    <td style={tdStyle}>{wasLastRendered ? "\u2713" : ""}</td>
                    <td style={tdStyle}>{isHot ? "\u26a0" : ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  // --- Dependency Graph Tab ---
  const renderDepGraphTab = () => {
    // Build adjacency data from fieldStates
    const rows: Array<{
      name: string;
      dependsOn: string[];
      dependedBy: string[];
      effects: string[];
    }> = [];

    let hasCycles = false;

    for (const [name, state] of Object.entries(fieldStates)) {
      const dependsOn = state.dependsOnFields ?? [];
      const dependedBy = state.dependentFields ?? [];

      // Determine primary effect types from this field's state
      const effects: string[] = [];
      if (state.hidden) effects.push("hidden");
      if (state.required) effects.push("required");
      if (state.readOnly) effects.push("readOnly");
      if (state.options && state.options.length > 0 && dependsOn.length > 0) effects.push("options");
      if (state.computedValue) effects.push("computed");

      rows.push({ name, dependsOn, dependedBy, effects });
    }

    // Check for cycles: a field that both depends on and is depended by the same field
    for (const row of rows) {
      for (const dep of row.dependsOn) {
        const depRow = rows.find(r => r.name === dep);
        if (depRow?.dependsOn.includes(row.name)) {
          hasCycles = true;
          break;
        }
      }
      if (hasCycles) break;
    }

    // Filter to only fields with dependencies
    const depRows = rows.filter(r => r.dependsOn.length > 0 || r.dependedBy.length > 0);

    // Sort
    if (depGraphSort === "name") {
      depRows.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      depRows.sort((a, b) => (b.dependsOn.length + b.dependedBy.length) - (a.dependsOn.length + a.dependedBy.length));
    }

    const effectColor = (effects: string[]): React.CSSProperties => {
      if (effects.includes("hidden")) return { background: "#3e3a20" };     // light yellow
      if (effects.includes("required")) return { background: "#1e2a3e" };   // light blue
      if (effects.includes("readOnly")) return { background: "#2a2a2a" };   // light gray
      if (effects.includes("options")) return { background: "#1e3a2a" };    // light green
      return {};
    };

    return (
      <div>
        <div style={{ marginBottom: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>Sort by:</span>
          <button style={{ ...btnStyle, borderColor: depGraphSort === "name" ? "#007acc" : "#555" }} onClick={() => setDepGraphSort("name")}>Name</button>
          <button style={{ ...btnStyle, borderColor: depGraphSort === "depCount" ? "#007acc" : "#555" }} onClick={() => setDepGraphSort("depCount")}>Dep Count</button>
          {hasCycles && <span style={{ color: "#f44747", fontWeight: "bold" }}>Cycles detected!</span>}
        </div>
        {depRows.length === 0 ? (
          <div>No dependencies defined.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Field</th>
                <th style={thStyle}>Depends On</th>
                <th style={thStyle}>Depended By</th>
                <th style={thStyle}>Effects</th>
                <th style={thStyle}>Source</th>
              </tr>
            </thead>
            <tbody>
              {depRows.map(row => {
                const meta = templateMeta?.[row.name];
                const source = meta ? `${meta.template} (${meta.fragment})` : "direct";
                const sourceColor: React.CSSProperties = meta
                  ? { color: "#9cdcfe" }
                  : { color: "#888" };
                return (
                  <tr key={row.name} style={effectColor(row.effects)}>
                    <td style={tdStyle}>{row.name}</td>
                    <td style={tdStyle}>{row.dependsOn.join(", ") || "\u2014"}</td>
                    <td style={tdStyle}>{row.dependedBy.join(", ") || "\u2014"}</td>
                    <td style={tdStyle}>{row.effects.join(", ") || "\u2014"}</td>
                    <td style={{ ...tdStyle, ...sourceColor }}>{source}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  // --- Timeline Tab ---
  const renderTimelineTab = () => {
    const timeline = getTimeline();
    const filterLower = timelineFilter.toLowerCase();
    const filtered = filterLower
      ? timeline.filter(e => e.fieldName.toLowerCase().includes(filterLower) || e.type.toLowerCase().includes(filterLower))
      : timeline;
    // Show newest first
    const reversed = [...filtered].reverse();

    const typeColor = (type: string): string => {
      switch (type) {
        case "field_change": return "#4ec9b0";
        case "rule_evaluated": return "#ce9178";
        case "validation_run": return "#dcdcaa";
        case "form_submit": return "#569cd6";
        default: return "#d4d4d4";
      }
    };

    const formatTime = (ts: number): string => {
      const d = new Date(ts);
      return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}.${String(d.getMilliseconds()).padStart(3, "0")}`;
    };

    return (
      <div>
        <div style={{ marginBottom: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
          <input
            type="text"
            placeholder="Filter by field or type..."
            value={timelineFilter}
            onChange={e => setTimelineFilter(e.target.value)}
            style={{
              padding: "2px 6px", background: "#2d2d2d", color: "#d4d4d4",
              border: "1px solid #555", fontFamily: "monospace", fontSize: "11px",
              borderRadius: "3px", flex: 1,
            }}
          />
          <button style={btnStyle} onClick={() => { clearTimeline(); forceUpdate(); }}>Clear</button>
          <button style={btnStyle} onClick={() => forceUpdate()}>Refresh</button>
        </div>
        <div style={{ fontSize: "10px", color: "#888", marginBottom: "4px" }}>
          {filtered.length} event{filtered.length !== 1 ? "s" : ""}
        </div>
        {reversed.length === 0 ? (
          <div>No events recorded yet.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Time</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Field</th>
                <th style={thStyle}>Details</th>
              </tr>
            </thead>
            <tbody>
              {reversed.slice(0, 200).map((event, i) => (
                <tr key={i}>
                  <td style={{ ...tdStyle, whiteSpace: "nowrap", color: "#888" }}>{formatTime(event.timestamp)}</td>
                  <td style={{ ...tdStyle, color: typeColor(event.type), whiteSpace: "nowrap" }}>{event.type}</td>
                  <td style={tdStyle}>{event.fieldName}</td>
                  <td style={{ ...tdStyle, maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{event.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  return (
    <div style={containerStyle} data-testid="form-devtools">
      <button type="button" aria-expanded={isOpen} aria-controls="devtools-content" style={{ width: "100%", padding: "4px 8px", cursor: "pointer", background: "#333", display: "flex", justifyContent: "space-between", alignItems: "center", border: "none", color: "inherit", font: "inherit" }} onClick={() => setIsOpen(!isOpen)}>
        <span style={{ color: "#007acc", fontWeight: "bold" }}>DevTools: {configName}</span>
        <span aria-hidden="true">{isOpen ? "\u25BC" : "\u25B2"}</span>
      </button>
      {isOpen && (
        <>
          <div role="tablist" aria-label="DevTools panels" style={{ display: "flex", borderBottom: "1px solid #333", flexWrap: "wrap" }}>
            <button role="tab" aria-selected={activeTab === "rules"} aria-controls="devtools-panel-rules" style={tabStyle(activeTab === "rules")} onClick={() => setActiveTab("rules")}>Rules ({fieldNames.length})</button>
            <button role="tab" aria-selected={activeTab === "values"} aria-controls="devtools-panel-values" style={tabStyle(activeTab === "values")} onClick={() => setActiveTab("values")}>Values</button>
            <button role="tab" aria-selected={activeTab === "errors"} aria-controls="devtools-panel-errors" style={tabStyle(activeTab === "errors")} onClick={() => setActiveTab("errors")}>Errors</button>
            <button role="tab" aria-selected={activeTab === "graph"} aria-controls="devtools-panel-graph" style={tabStyle(activeTab === "graph")} onClick={() => setActiveTab("graph")}>Graph</button>
            <button role="tab" aria-selected={activeTab === "performance"} aria-controls="devtools-panel-performance" style={tabStyle(activeTab === "performance")} onClick={() => { setActiveTab("performance"); forceUpdate(); }}>Perf</button>
            <button role="tab" aria-selected={activeTab === "depgraph"} aria-controls="devtools-panel-depgraph" style={tabStyle(activeTab === "depgraph")} onClick={() => setActiveTab("depgraph")}>Deps</button>
            <button role="tab" aria-selected={activeTab === "timeline"} aria-controls="devtools-panel-timeline" style={tabStyle(activeTab === "timeline")} onClick={() => { setActiveTab("timeline"); forceUpdate(); }}>Timeline</button>
          </div>
          <div role="tabpanel" id={`devtools-panel-${activeTab}`} aria-label={activeTab} style={{ overflow: "auto", maxHeight: "calc(50vh - 60px)", padding: "8px" }}>
            {activeTab === "rules" && fieldNames.map(name => {
              const state = fieldStates[name];
              return (
                <div key={name} style={{ marginBottom: "8px", borderBottom: "1px solid #333", paddingBottom: "4px" }}>
                  <div style={{ color: "#4ec9b0" }}>{name}</div>
                  <div>type: {state.type ?? "\u2014"} | required: {String(state.required ?? false)} | hidden: {String(state.hidden ?? false)} | readOnly: {String(state.readOnly ?? false)}</div>
                  {state.validate?.length ? <div>validate: {state.validate.map(v => v.name).join(", ")}</div> : null}
                  {state.computedValue ? <div>computedValue: {state.computedValue}</div> : null}
                  {state.activeRuleIds?.length ? <div>activeRules: {state.activeRuleIds.join(", ")}</div> : null}
                </div>
              );
            })}
            {activeTab === "values" && <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{JSON.stringify(formValues, null, 2)}</pre>}
            {activeTab === "errors" && (
              <pre style={{ margin: 0, whiteSpace: "pre-wrap", color: formErrors && Object.keys(formErrors).length > 0 ? "#f44747" : "#4ec9b0" }}>
                {formErrors && Object.keys(formErrors).length > 0 ? JSON.stringify(formErrors, null, 2) : "No errors"}
              </pre>
            )}
            {activeTab === "graph" && (dependencyGraph.length > 0
              ? dependencyGraph.map((line, i) => <div key={i} style={{ color: "#ce9178" }}>{line}</div>)
              : <div>No dependencies defined</div>
            )}
            {activeTab === "performance" && renderPerformanceTab()}
            {activeTab === "depgraph" && renderDepGraphTab()}
            {activeTab === "timeline" && renderTimelineTab()}
          </div>
        </>
      )}
    </div>
  );
};
