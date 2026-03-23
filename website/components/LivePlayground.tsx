"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";

// Dynamically import heavy client components to avoid SSR issues
const JsonEditor = dynamic(() => import("./JsonEditor"), { ssr: false });
const FormRenderer = dynamic(() => import("./FormRenderer"), { ssr: false });

// Import all JSON configs
import patientIntake from "../../examples/configs/patient-intake.json";
import jobApplication from "../../examples/configs/job-application.json";
import supportTicket from "../../examples/configs/support-ticket.json";
import expenseReport from "../../examples/configs/expense-report.json";
import eventRegistration from "../../examples/configs/event-registration.json";
import userSettings from "../../examples/configs/user-settings.json";
import survey from "../../examples/configs/survey.json";
import vehicleInsuranceQuote from "../../examples/configs/vehicle-insurance-quote.json";
// Existing TS examples
import { loginMfaFormConfig } from "../../packages/examples/src/login-mfa/loginMfaConfig";
import { checkoutFormConfig } from "../../packages/examples/src/checkout/checkoutConfig";
import { dataEntryFormConfig } from "../../packages/examples/src/data-entry/dataEntryConfig";

interface PresetEntry {
  label: string;
  config: unknown;
  group: "showcase" | "getting-started";
}

const presets: Record<string, PresetEntry> = {
  // Showcase (8 new)
  "patient-intake": { label: "Patient Intake", config: patientIntake, group: "showcase" },
  "job-application": { label: "Job Application", config: jobApplication, group: "showcase" },
  "support-ticket": { label: "Support Ticket", config: supportTicket, group: "showcase" },
  "expense-report": { label: "Expense Report", config: expenseReport, group: "showcase" },
  "event-registration": { label: "Event Registration", config: eventRegistration, group: "showcase" },
  "user-settings": { label: "User Settings", config: userSettings, group: "showcase" },
  survey: { label: "Survey", config: survey, group: "showcase" },
  "vehicle-insurance-quote": { label: "Vehicle Insurance Quote", config: vehicleInsuranceQuote, group: "showcase" },
  // Getting Started (3 existing)
  "login-mfa": { label: "Login + MFA", config: loginMfaFormConfig, group: "getting-started" },
  checkout: { label: "E-Commerce Checkout", config: checkoutFormConfig, group: "getting-started" },
  "data-entry": { label: "Data Entry", config: dataEntryFormConfig, group: "getting-started" },
};

const ADAPTERS = [
  { value: "headless", label: "Headless" },
  { value: "fluent", label: "Fluent UI" },
  { value: "mui", label: "Material UI" },
  { value: "antd", label: "Ant Design" },
  { value: "mantine", label: "Mantine" },
  { value: "chakra", label: "Chakra UI" },
  { value: "radix", label: "Radix" },
  { value: "react-aria", label: "React Aria" },
  { value: "base-web", label: "Base Web" },
  { value: "heroui", label: "HeroUI" },
  { value: "atlaskit", label: "Atlaskit" },
];

function getInitialPreset(): string {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const example = params.get("example");
    if (example && presets[example]) return example;
  }
  return "patient-intake";
}

function getInitialAdapter(): string {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const adapter = params.get("adapter");
    if (adapter) return adapter;
  }
  return "headless";
}

export default function LivePlayground() {
  const [selectedPreset, setSelectedPreset] = useState(getInitialPreset);
  const [selectedAdapter, setSelectedAdapter] = useState(getInitialAdapter);
  const [editorContent, setEditorContent] = useState(() =>
    JSON.stringify(presets[getInitialPreset()].config, null, 2)
  );
  const [parsedConfig, setParsedConfig] = useState<Record<string, unknown> | null>(
    () => presets[getInitialPreset()].config as Record<string, unknown>
  );
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [adapterError, setAdapterError] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<"editor" | "form">("form");
  const [isMobile, setIsMobile] = useState(false);
  const [renderKey, setRenderKey] = useState(0);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const configName = useMemo(
    () => `playground-${selectedPreset}-${renderKey}`,
    [selectedPreset, renderKey]
  );

  const showcaseExamples = useMemo(
    () =>
      Object.entries(presets)
        .filter(([, v]) => v.group === "showcase")
        .map(([key, v]) => ({ key, label: v.label })),
    []
  );

  const gettingStartedExamples = useMemo(
    () =>
      Object.entries(presets)
        .filter(([, v]) => v.group === "getting-started")
        .map(([key, v]) => ({ key, label: v.label })),
    []
  );

  // Check mobile on mount and resize
  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth < 768);
    }
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const onPresetChange = useCallback((newPreset: string) => {
    setSelectedPreset(newPreset);
    const preset = presets[newPreset];
    if (preset) {
      const json = JSON.stringify(preset.config, null, 2);
      setEditorContent(json);
      setParsedConfig(preset.config as Record<string, unknown>);
      setJsonError(null);
      setRenderKey((k) => k + 1);
    }
  }, []);

  const resetToPreset = useCallback(() => {
    onPresetChange(selectedPreset);
  }, [selectedPreset, onPresetChange]);

  const onJsonError = useCallback((message: string) => {
    setJsonError(message);
  }, []);

  const onJsonValid = useCallback(() => {
    setJsonError(null);
  }, []);

  const onAdapterError = useCallback((message: string) => {
    setAdapterError(message);
    setTimeout(() => setAdapterError(null), 5000);
  }, []);

  // Debounced JSON parsing when editor content changes
  const onEditorChange = useCallback((value: string) => {
    setEditorContent(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      try {
        const parsed = JSON.parse(value);
        setParsedConfig(parsed);
        setRenderKey((k) => k + 1);
        setJsonError(null);
      } catch {
        // Error handler will catch it via onJsonError
      }
    }, 300);
  }, []);

  const errorBanner = (
    <>
      {jsonError && (
        <div className="playground-error">{jsonError}</div>
      )}
      {adapterError && (
        <div className="playground-error adapter-error">{adapterError}</div>
      )}
    </>
  );

  return (
    <div className="playground">
      <div className="playground-toolbar">
        <select
          className="playground-select"
          value={selectedPreset}
          onChange={(e) => onPresetChange(e.target.value)}
        >
          <optgroup label="Showcase">
            {showcaseExamples.map((ex) => (
              <option key={ex.key} value={ex.key}>
                {ex.label}
              </option>
            ))}
          </optgroup>
          <optgroup label="Getting Started">
            {gettingStartedExamples.map((ex) => (
              <option key={ex.key} value={ex.key}>
                {ex.label}
              </option>
            ))}
          </optgroup>
        </select>
        <select
          className="playground-select"
          value={selectedAdapter}
          onChange={(e) => setSelectedAdapter(e.target.value)}
        >
          {ADAPTERS.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
        <button
          className="playground-reset"
          onClick={resetToPreset}
          title="Reset to preset"
        >
          Reset
        </button>
      </div>

      {/* Desktop: side by side */}
      {!isMobile ? (
        <div className="playground-panels">
          <div className="playground-editor">
            <JsonEditor
              value={editorContent}
              onChange={onEditorChange}
              onError={onJsonError}
              onValid={onJsonValid}
            />
          </div>
          <div className="playground-form">
            {errorBanner}
            <FormRenderer
              config={parsedConfig}
              adapter={selectedAdapter}
              configName={configName}
              onAdapterError={onAdapterError}
            />
          </div>
        </div>
      ) : (
        /* Mobile: tabs */
        <div className="playground-mobile">
          <div className="playground-tabs">
            <button
              className={mobileTab === "editor" ? "active" : ""}
              onClick={() => setMobileTab("editor")}
            >
              Editor
            </button>
            <button
              className={mobileTab === "form" ? "active" : ""}
              onClick={() => setMobileTab("form")}
            >
              Form
            </button>
          </div>
          <div
            className="playground-editor"
            style={{ display: mobileTab === "editor" ? "block" : "none" }}
          >
            <JsonEditor
              value={editorContent}
              onChange={onEditorChange}
              onError={onJsonError}
              onValid={onJsonValid}
            />
          </div>
          <div
            className="playground-form"
            style={{ display: mobileTab === "form" ? "block" : "none" }}
          >
            {errorBanner}
            <FormRenderer
              config={parsedConfig}
              adapter={selectedAdapter}
              configName={configName}
              onAdapterError={onAdapterError}
            />
          </div>
        </div>
      )}

      <style jsx>{`
        .playground {
          margin: 32px 0;
          border: 1px solid var(--nextra-border-color, #e5e7eb);
          border-radius: 8px;
          overflow: hidden;
        }
        .playground-toolbar {
          display: flex;
          gap: 8px;
          padding: 12px;
          background: var(--nextra-bg-secondary, #f9fafb);
          border-bottom: 1px solid var(--nextra-border-color, #e5e7eb);
          flex-wrap: wrap;
        }
        .playground-select {
          padding: 6px 12px;
          border: 1px solid var(--nextra-border-color, #e5e7eb);
          border-radius: 4px;
          background: var(--nextra-bg, #fff);
          color: var(--nextra-text, #111);
          font-size: 14px;
        }
        .playground-reset {
          padding: 6px 12px;
          border: 1px solid var(--nextra-border-color, #e5e7eb);
          border-radius: 4px;
          background: var(--nextra-bg, #fff);
          color: var(--nextra-text-secondary, #6b7280);
          cursor: pointer;
          font-size: 14px;
        }
        .playground-reset:hover {
          background: var(--nextra-bg-secondary, #f9fafb);
        }
        .playground-panels {
          display: flex;
          height: 500px;
        }
        .playground-editor {
          flex: 0 0 45%;
          border-right: 1px solid var(--nextra-border-color, #e5e7eb);
          overflow: hidden;
        }
        .playground-form {
          flex: 1;
          overflow: auto;
        }
        .playground-error {
          padding: 8px 12px;
          background: #fff3cd;
          color: #856404;
          font-size: 13px;
          border-bottom: 1px solid #ffc107;
        }
        .playground-mobile {
          height: 500px;
          display: flex;
          flex-direction: column;
        }
        .playground-tabs {
          display: flex;
          border-bottom: 1px solid var(--nextra-border-color, #e5e7eb);
        }
        .playground-tabs button {
          flex: 1;
          padding: 8px;
          border: none;
          background: var(--nextra-bg-secondary, #f9fafb);
          cursor: pointer;
          font-size: 14px;
          color: var(--nextra-text-secondary, #6b7280);
        }
        .playground-tabs button.active {
          background: var(--nextra-bg, #fff);
          color: var(--nextra-text, #111);
          font-weight: 600;
        }
        .playground-mobile .playground-editor,
        .playground-mobile .playground-form {
          flex: 1;
          overflow: auto;
        }
      `}</style>
    </div>
  );
}
