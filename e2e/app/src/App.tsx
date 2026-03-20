import React from "react";
import {
  RulesEngineProvider,
  InjectedFieldProvider,
  UseInjectedFieldContext,
  Formosaic,
  WizardForm,
  useDraftPersistence,
} from "@formosaic/core";
import { createFluentFieldRegistry } from "@formosaic/fluent";
import "@formosaic/core/styles.css";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import type { IFormConfig } from "@formosaic/core";

import { basicFormConfig, basicFormDefaults } from "./configs/basic-form";
import { rulesFormConfig, rulesFormDefaults } from "./configs/rules-form";
import { validationFormConfig, validationFormDefaults } from "./configs/validation-form";
import { wizardFormConfig, wizardFormDefaults } from "./configs/wizard-form";
import { fieldArrayFormConfig, fieldArrayFormDefaults } from "./configs/field-array-form";

/** Maps route paths to form configs and default data */
const FORM_ROUTES: Record<string, { config: IFormConfig; defaults: Record<string, unknown> }> = {
  "/basic": { config: basicFormConfig, defaults: basicFormDefaults },
  "/rules": { config: rulesFormConfig, defaults: rulesFormDefaults },
  "/validation": { config: validationFormConfig, defaults: validationFormDefaults },
  "/wizard": { config: wizardFormConfig, defaults: wizardFormDefaults },
  "/field-array": { config: fieldArrayFormConfig, defaults: fieldArrayFormDefaults },
};

function FormShell(props: {
  config: IFormConfig;
  defaults: Record<string, unknown>;
  isWizard?: boolean;
}) {
  const { config, defaults, isWizard } = props;
  const { setInjectedFields } = UseInjectedFieldContext();

  const [saveResult, setSaveResult] = React.useState<string>("");
  const [savedData, setSavedData] = React.useState<Record<string, unknown> | null>(null);

  React.useEffect(() => {
    setInjectedFields(createFluentFieldRegistry());
  }, [setInjectedFields]);

  const saveData = React.useCallback(
    async (data: Record<string, unknown>, dirtyFields?: string[]) => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 200));
      setSaveResult("saved");
      setSavedData(data);
      return data;
    },
    []
  );

  // Draft persistence for the draft-recovery test
  const draftPersistence = useDraftPersistence({
    formId: `e2e-${window.location.pathname}`,
    data: defaults,
    saveIntervalMs: 2000,
    enabled: window.location.search.includes("draft=true"),
  });

  const draftData = React.useMemo(() => {
    if (window.location.search.includes("draft=true")) {
      const recovered = draftPersistence.recoverDraft();
      if (recovered) return recovered.data;
    }
    return defaults;
  }, []);

  return (
    <div data-testid="form-shell">
      <Formosaic
        configName="e2e-test"
        testId="e2e-test"
        formConfig={config}
        defaultValues={draftData}
        isManualSave={config.settings?.manualSave}
        saveData={saveData}
        isCreate={window.location.search.includes("create=true")}
      />
      {saveResult && (
        <div data-testid="save-result" data-save-status={saveResult}>
          {saveResult}
        </div>
      )}
      {savedData && (
        <pre data-testid="saved-data">{JSON.stringify(savedData, null, 2)}</pre>
      )}
      {window.location.search.includes("draft=true") && (
        <div data-testid="draft-controls">
          <button
            data-testid="save-draft-btn"
            onClick={() => draftPersistence.saveDraft()}
          >
            Save Draft
          </button>
          <button
            data-testid="clear-draft-btn"
            onClick={() => draftPersistence.clearDraft()}
          >
            Clear Draft
          </button>
          <span data-testid="draft-status">
            {draftPersistence.hasDraft ? "has-draft" : "no-draft"}
          </span>
        </div>
      )}
    </div>
  );
}

export function App() {
  const path = window.location.pathname;
  const route = FORM_ROUTES[path];

  if (!route) {
    return (
      <div data-testid="route-index">
        <h1>E2E Test Forms</h1>
        <nav>
          <ul>
            {Object.keys(FORM_ROUTES).map((routePath) => (
              <li key={routePath}>
                <a href={routePath}>{routePath.slice(1)}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    );
  }

  return (
    <FluentProvider theme={webLightTheme}>
      <RulesEngineProvider>
        <InjectedFieldProvider>
          <FormShell
            config={route.config}
            defaults={route.defaults}
            isWizard={!!route.config.wizard}
          />
        </InjectedFieldProvider>
      </RulesEngineProvider>
    </FluentProvider>
  );
}
