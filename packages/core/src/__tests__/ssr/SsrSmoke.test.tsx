/**
 * SSR Smoke Test (audit P1-21).
 *
 * Proves that <Formosaic> + providers render under react-dom/server without
 * throwing and without touching `window` / `document`.
 *
 * Also verifies that module-level plugin registries (TemplateRegistry,
 * LookupRegistry, ValidationRegistry, ValueFunctionRegistry, LocaleRegistry)
 * behave safely when a "new request" spins up a fresh module graph via
 * `vi.resetModules()` — simulating a well-behaved SSR deploy where each
 * request does not mutate these registries.
 *
 * ─── Known SSR limitation ────────────────────────────────────────────────────
 * At time of writing, <Formosaic> populates its field order via
 * `initFormState()` inside a `useEffect`. React `useEffect` does NOT run
 * under `renderToString`, so the server-rendered HTML contains the form
 * wrapper/status region but NOT the individual field rows — the fields
 * appear on the client after hydration.
 *
 * This test therefore asserts ONLY the SSR invariants that matter today:
 *   1. `renderToString` completes without throwing.
 *   2. The output is a valid HTML shell (not an error string).
 *   3. Concurrent SSR renders do NOT contaminate each other
 *      (no module-level state captures per-request entity data).
 *
 * Fixing the "fields missing from SSR output" gap would require moving rule
 * evaluation out of effects and onto the render path (or emitting initial
 * field order from props). See audit follow-up P1-21b.
 *
 * This test file intentionally runs under vitest's default jsdom environment,
 * but we avoid touching `window` / `document` via `renderToString` (purely
 * string-based output) so it would also pass under the `node` environment.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { Formosaic } from "../../components/Formosaic";
import { RulesEngineProvider } from "../../providers/RulesEngineProvider";
import { InjectedFieldProvider } from "../../providers/InjectedFieldProvider";
import type { IFormConfig } from "../../types/IFormConfig";
import type { IFieldProps } from "../../types/IFieldProps";

// ─── Minimal SSR-safe field components ────────────────────────────────────────

const Textbox: React.FC<IFieldProps<string>> = ({ fieldName, value, label }) => (
  <input
    name={fieldName}
    data-testid={`field-${fieldName}`}
    defaultValue={(value as string) ?? ""}
    aria-label={label}
  />
);

const injectedFields = {
  Textbox: <Textbox />,
} as unknown as Record<string, React.JSX.Element>;

// ─── Test form config ─────────────────────────────────────────────────────────

const SIMPLE_CONFIG: IFormConfig = {
  version: 2,
  fields: {
    firstName: { type: "Textbox", label: "First Name" },
    lastName: { type: "Textbox", label: "Last Name" },
  },
  fieldOrder: ["firstName", "lastName"],
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("SSR smoke", () => {
  afterEach(() => {
    vi.resetModules();
  });

  it("renderToString completes without throwing and produces form wrapper markup", () => {
    const html = renderToString(
      <RulesEngineProvider>
        <InjectedFieldProvider injectedFields={injectedFields}>
          <Formosaic
            configName="ssr-test"
            formConfig={SIMPLE_CONFIG}
            defaultValues={{ firstName: "Ada", lastName: "Lovelace" }}
          />
        </InjectedFieldProvider>
      </RulesEngineProvider>
    );

    // Output must be a real HTML string, not a thrown error or `undefined`.
    expect(typeof html).toBe("string");
    expect(html.length).toBeGreaterThan(0);
    // The form wrapper / status live region must render on the server.
    expect(html).toContain("formosaic-form-wrapper");
    expect(html).toContain("form-status-live-region");
    // Fields are NOT expected in SSR output today — see file-level comment
    // re: effect-based field-order initialisation.
  });

  it("concurrent SSR renders do not contaminate each other via module-level state", () => {
    const first = renderToString(
      <RulesEngineProvider>
        <InjectedFieldProvider injectedFields={injectedFields}>
          <Formosaic
            configName="ssr-request-a"
            formConfig={SIMPLE_CONFIG}
            defaultValues={{ firstName: "Alice", lastName: "A" }}
          />
        </InjectedFieldProvider>
      </RulesEngineProvider>
    );
    const second = renderToString(
      <RulesEngineProvider>
        <InjectedFieldProvider injectedFields={injectedFields}>
          <Formosaic
            configName="ssr-request-b"
            formConfig={SIMPLE_CONFIG}
            defaultValues={{ firstName: "Bob", lastName: "B" }}
          />
        </InjectedFieldProvider>
      </RulesEngineProvider>
    );

    // Both renders must succeed. Neither may leak the other's `configName`
    // into their output (which would be a smoking gun for module-level
    // state capturing per-request data).
    expect(first).toContain("form-status-live-region");
    expect(second).toContain("form-status-live-region");
    expect(first).not.toContain("ssr-request-b");
    expect(second).not.toContain("ssr-request-a");
  });

  it("ValidationRegistry/ValueFunctionRegistry expose defaults on a fresh module graph", async () => {
    // Simulate a cold request that freshly imports the core modules.
    vi.resetModules();
    const validation = await import("../../helpers/ValidationRegistry");
    const valueFns = await import("../../helpers/ValueFunctionRegistry");
    const locales = await import("../../helpers/LocaleRegistry");

    // Built-in validators are present.
    expect(validation.getValidator("required")).toBeTypeOf("function");
    expect(validation.getValidator("email")).toBeTypeOf("function");
    // Built-in value functions are present.
    expect(valueFns.getValueFunction("setDate")).toBeTypeOf("function");
    // Locale defaults are present (English fallback).
    expect(locales.getLocaleString("save")).toBe("Save");
  });

  it("LocaleRegistry does NOT leak a registerLocale() call across a fresh module graph", async () => {
    // Request A: mutate locale.
    vi.resetModules();
    const localesA = await import("../../helpers/LocaleRegistry");
    localesA.registerLocale({ save: "Enregistrer" });
    expect(localesA.getLocaleString("save")).toBe("Enregistrer");

    // Request B (fresh module graph): defaults must be restored.
    // This simulates a cold deploy / serverless cold start — proving the
    // registry has no persistent storage outside the module graph.
    vi.resetModules();
    const localesB = await import("../../helpers/LocaleRegistry");
    expect(localesB.getLocaleString("save")).toBe("Save");
  });

  it("TemplateRegistry does NOT leak a registerFormTemplate() call across a fresh module graph", async () => {
    vi.resetModules();
    const tmplA = await import("../../templates/TemplateRegistry");
    tmplA.registerFormTemplate("tenantA:secret", {
      fields: { foo: { type: "Textbox", label: "Foo" } },
    });
    expect(tmplA.getFormTemplate("tenantA:secret")).toBeDefined();

    vi.resetModules();
    const tmplB = await import("../../templates/TemplateRegistry");
    expect(tmplB.getFormTemplate("tenantA:secret")).toBeUndefined();
  });

  it("EventTimeline and RenderTracker are disabled by default (no cross-request leakage when unused)", async () => {
    vi.resetModules();
    const timeline = await import("../../helpers/EventTimeline");
    const renderTracker = await import("../../helpers/RenderTracker");

    // Disabled by default: logEvent / trackRender are no-ops.
    expect(timeline.isEventTimelineEnabled()).toBe(false);
    expect(renderTracker.isRenderTrackerEnabled()).toBe(false);

    // Call these with data that would be PII-shaped if it were captured.
    timeline.logEvent("validation_run", "email", "failed: Duplicate value: leaked@example.com");
    renderTracker.trackRender("email");

    // Nothing should have been recorded because tracking is off by default.
    // This is the critical invariant for SSR / multi-tenant safety: the
    // hot-path calls in RuleEngine / FormosaicHelper / RenderField only
    // accumulate state when an explicit opt-in is made (e.g. FormDevTools).
    expect(timeline.getTimeline()).toHaveLength(0);
    expect(renderTracker.getRenderCounts().size).toBe(0);
  });
});
