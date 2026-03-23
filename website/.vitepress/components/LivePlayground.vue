<template>
  <div class="playground">
    <div class="playground-toolbar">
      <select v-model="selectedPreset" class="playground-select" @change="onPresetChange">
        <optgroup label="Showcase">
          <option v-for="ex in showcaseExamples" :key="ex.key" :value="ex.key">
            {{ ex.label }}
          </option>
        </optgroup>
        <optgroup label="Getting Started">
          <option v-for="ex in gettingStartedExamples" :key="ex.key" :value="ex.key">
            {{ ex.label }}
          </option>
        </optgroup>
      </select>
      <select v-model="selectedAdapter" class="playground-select">
        <option value="headless">Headless</option>
        <option value="fluent">Fluent UI</option>
        <option value="mui">Material UI</option>
        <option value="antd">Ant Design</option>
        <option value="mantine">Mantine</option>
        <option value="chakra">Chakra UI</option>
        <option value="radix">Radix</option>
        <option value="react-aria">React Aria</option>
      </select>
      <button class="playground-reset" @click="resetToPreset" title="Reset to preset">
        ↺ Reset
      </button>
    </div>

    <!-- Desktop: side by side -->
    <div v-if="!isMobile" class="playground-panels">
      <div class="playground-editor">
        <JsonEditor v-model="editorContent" @error="onJsonError" @valid="onJsonValid" />
      </div>
      <div class="playground-form">
        <div v-if="jsonError" class="playground-error">{{ jsonError }}</div>
        <div v-if="adapterError" class="playground-error adapter-error">{{ adapterError }}</div>
        <FormRenderer :config="parsedConfig" :adapter="selectedAdapter" :config-name="playgroundConfigName" @adapter-error="onAdapterError" />
      </div>
    </div>

    <!-- Mobile: tabs -->
    <div v-else class="playground-mobile">
      <div class="playground-tabs">
        <button :class="{ active: mobileTab === 'editor' }" @click="mobileTab = 'editor'">
          Editor
        </button>
        <button :class="{ active: mobileTab === 'form' }" @click="mobileTab = 'form'">
          Form
        </button>
      </div>
      <div v-show="mobileTab === 'editor'" class="playground-editor">
        <JsonEditor v-model="editorContent" @error="onJsonError" @valid="onJsonValid" />
      </div>
      <div v-show="mobileTab === 'form'" class="playground-form">
        <div v-if="jsonError" class="playground-error">{{ jsonError }}</div>
        <div v-if="adapterError" class="playground-error adapter-error">{{ adapterError }}</div>
        <FormRenderer :config="parsedConfig" :adapter="selectedAdapter" :config-name="playgroundConfigName" @adapter-error="onAdapterError" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import JsonEditor from "./JsonEditor.vue";
import FormRenderer from "./FormRenderer.vue";

// Import all 8 new JSON configs
import patientIntake from "../../../examples/configs/patient-intake.json";
import jobApplication from "../../../examples/configs/job-application.json";
import supportTicket from "../../../examples/configs/support-ticket.json";
import expenseReport from "../../../examples/configs/expense-report.json";
import eventRegistration from "../../../examples/configs/event-registration.json";
import userSettings from "../../../examples/configs/user-settings.json";
import survey from "../../../examples/configs/survey.json";
import vehicleInsuranceQuote from "../../../examples/configs/vehicle-insurance-quote.json";
// Existing examples — named exports from packages/examples (TS files)
// If VitePress has trouble resolving TS files from packages/examples,
// create JSON snapshot copies in examples/configs/ instead.
import { loginMfaFormConfig } from "../../../packages/examples/src/login-mfa/loginMfaConfig";
import { checkoutFormConfig } from "../../../packages/examples/src/checkout/checkoutConfig";
import { dataEntryFormConfig } from "../../../packages/examples/src/data-entry/dataEntryConfig";

const presets: Record<string, { label: string; config: unknown; group: string }> = {
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

const showcaseExamples = computed(() =>
  Object.entries(presets)
    .filter(([, v]) => v.group === "showcase")
    .map(([key, v]) => ({ key, label: v.label }))
);

const gettingStartedExamples = computed(() =>
  Object.entries(presets)
    .filter(([, v]) => v.group === "getting-started")
    .map(([key, v]) => ({ key, label: v.label }))
);

// Read query params for deep linking (?example=patient-intake&adapter=headless)
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

const selectedPreset = ref(getInitialPreset());
const selectedAdapter = ref(getInitialAdapter());
const editorContent = ref(JSON.stringify(presets[selectedPreset.value].config, null, 2));
const jsonError = ref<string | null>(null);
const adapterError = ref<string | null>(null);
const mobileTab = ref<"editor" | "form">("form");
const isMobile = ref(false);

const renderKey = ref(0);
const playgroundConfigName = computed(() => `playground-${selectedPreset.value}-${renderKey.value}`);

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const parsedConfig = ref<Record<string, unknown> | null>(
  presets[selectedPreset.value].config as Record<string, unknown>
);

function onPresetChange() {
  const preset = presets[selectedPreset.value];
  if (preset) {
    editorContent.value = JSON.stringify(preset.config, null, 2);
    parsedConfig.value = preset.config as Record<string, unknown>;
    jsonError.value = null;
    renderKey.value++;
  }
}

function resetToPreset() {
  onPresetChange();
}

function onJsonError(message: string) {
  jsonError.value = message;
}

function onAdapterError(message: string) {
  adapterError.value = message;
  // Auto-clear after 5 seconds
  setTimeout(() => { adapterError.value = null; }, 5000);
}

function onJsonValid() {
  jsonError.value = null;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    try {
      parsedConfig.value = JSON.parse(editorContent.value);
      renderKey.value++;
    } catch {
      // Ignore — error handler will catch it
    }
  }, 300);
}

function checkMobile() {
  isMobile.value = window.innerWidth < 768;
}

onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
  if (debounceTimer) clearTimeout(debounceTimer);
});
</script>

<style scoped>
.playground {
  margin: 32px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
}

.playground-toolbar {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
  flex-wrap: wrap;
}

.playground-select {
  padding: 6px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 14px;
}

.playground-reset {
  padding: 6px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
  font-size: 14px;
}
.playground-reset:hover {
  background: var(--vp-c-bg-soft);
}

.playground-panels {
  display: flex;
  height: 500px;
}

.playground-editor {
  flex: 0 0 45%;
  border-right: 1px solid var(--vp-c-divider);
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
  border-bottom: 1px solid var(--vp-c-divider);
}

.playground-tabs button {
  flex: 1;
  padding: 8px;
  border: none;
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.playground-tabs button.active {
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-weight: 600;
}

.playground-mobile .playground-editor,
.playground-mobile .playground-form {
  flex: 1;
  overflow: auto;
}
</style>
