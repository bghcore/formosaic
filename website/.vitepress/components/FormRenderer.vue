<template>
  <div ref="formRoot" class="form-renderer" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";

const props = defineProps<{
  config: Record<string, unknown> | null;
  adapter: string;
  configName: string;
}>();

const emit = defineEmits<{
  adapterError: [message: string];
}>();

const formRoot = ref<HTMLElement>();
let reactRoot: unknown = null;
const loadedStylesheets = new Set<string>();

interface AdapterResult {
  createRegistry: () => Record<string, unknown>;
  wrapWithProvider?: (React: typeof import("react"), children: unknown) => unknown;
  stylesheets?: string[];
}

/**
 * Dynamically inject a CSS stylesheet into the document head.
 * Uses a data attribute to track which sheets are already loaded.
 */
function loadStylesheet(href: string): void {
  if (loadedStylesheets.has(href)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.dataset.playgroundAdapter = "true";
  document.head.appendChild(link);
  loadedStylesheets.add(href);
}

/**
 * Dynamically inject a CSS module's content (from a JS import that resolves CSS).
 * For bundled CSS-in-JS that exports a string or side-effect import.
 */
async function loadCssModule(importFn: () => Promise<unknown>): Promise<void> {
  try {
    await importFn();
  } catch (err) {
    console.warn("Failed to load adapter CSS module:", err);
  }
}

async function renderForm() {
  if (!formRoot.value || !props.config) return;

  const { createRoot } = await import("react-dom/client");
  const React = await import("react");
  const {
    Formosaic,
    RulesEngineProvider,
    InjectedFieldProvider,
  } = await import("@formosaic/core");

  let adapterResult: AdapterResult;
  try {
    adapterResult = await loadAdapter(props.adapter);
  } catch (err) {
    console.error(`Failed to load adapter "${props.adapter}":`, err);
    emit("adapterError", `Failed to load ${props.adapter} adapter. Falling back to Headless.`);
    const { createHeadlessFieldRegistry } = await import("@formosaic/headless");
    adapterResult = { createRegistry: createHeadlessFieldRegistry };
  }

  const registry = adapterResult.createRegistry();

  // Unmount and recreate the React root on each render to force a clean
  // RulesEngineProvider + Formosaic re-initialization with the new config.
  if (reactRoot) {
    (reactRoot as { unmount: () => void }).unmount();
  }
  reactRoot = createRoot(formRoot.value);

  // Build the core form tree: RulesEngineProvider > InjectedFieldProvider > Formosaic
  const formTree = React.createElement(
    RulesEngineProvider,
    null,
    React.createElement(
      InjectedFieldProvider,
      { injectedFields: registry },
      React.createElement(Formosaic, {
        configName: props.configName,
        formConfig: props.config,
        defaultValues: {},
        isManualSave: true,
        isCreate: true,
        saveData: async (data: unknown) => {
          console.log("Playground form data:", data);
          return data;
        },
      })
    )
  );

  // Wrap with adapter-specific provider if needed (e.g., FluentProvider, MantineProvider)
  const finalTree = adapterResult.wrapWithProvider
    ? adapterResult.wrapWithProvider(React, formTree)
    : formTree;

  (reactRoot as { render: (el: unknown) => void }).render(finalTree);
}

async function loadAdapter(name: string): Promise<AdapterResult> {
  switch (name) {
    case "headless": {
      const m = await import("@formosaic/headless");
      return { createRegistry: m.createHeadlessFieldRegistry };
    }
    case "fluent": {
      const m = await import("@formosaic/fluent");
      const fluentUI = await import("@fluentui/react-components");
      return {
        createRegistry: m.createFluentFieldRegistry,
        wrapWithProvider: (React, children) =>
          React.createElement(fluentUI.FluentProvider, { theme: fluentUI.webLightTheme }, children),
      };
    }
    case "mui": {
      const m = await import("@formosaic/mui");
      const mui = await import("@mui/material");
      const muiStyles = await import("@mui/material/styles");
      const theme = muiStyles.createTheme({ palette: { mode: "light" } });
      return {
        createRegistry: m.createMuiFieldRegistry,
        wrapWithProvider: (React, children) =>
          React.createElement(muiStyles.ThemeProvider, { theme }, children),
      };
    }
    case "antd": {
      const m = await import("@formosaic/antd");
      return { createRegistry: m.createAntdFieldRegistry };
    }
    case "mantine": {
      const m = await import("@formosaic/mantine");
      const mantineCore = await import("@mantine/core");
      // Mantine requires its static CSS — load it dynamically
      await loadCssModule(() => import("@mantine/core/styles.css"));
      return {
        createRegistry: m.createMantineFieldRegistry,
        wrapWithProvider: (React, children) =>
          React.createElement(mantineCore.MantineProvider, { forceColorScheme: "light" as const }, children),
      };
    }
    case "chakra": {
      const m = await import("@formosaic/chakra");
      const chakraUI = await import("@chakra-ui/react");
      return {
        createRegistry: m.createChakraFieldRegistry,
        wrapWithProvider: (React, children) =>
          React.createElement(chakraUI.ChakraProvider, { value: chakraUI.defaultSystem }, children),
      };
    }
    case "radix": {
      const m = await import("@formosaic/radix");
      return { createRegistry: m.createRadixFieldRegistry };
    }
    case "react-aria": {
      const m = await import("@formosaic/react-aria");
      return { createRegistry: m.createReactAriaFieldRegistry };
    }
    case "base-web": {
      const m = await import("@formosaic/base-web");
      return { createRegistry: m.createBaseWebFieldRegistry };
    }
    case "heroui": {
      const m = await import("@formosaic/heroui");
      return { createRegistry: m.createHeroUIFieldRegistry };
    }
    case "atlaskit": {
      const m = await import("@formosaic/atlaskit");
      return { createRegistry: m.createAtlaskitFieldRegistry };
    }
    default: {
      const m = await import("@formosaic/headless");
      return { createRegistry: m.createHeadlessFieldRegistry };
    }
  }
}

onMounted(() => {
  renderForm();
});

watch([() => props.config, () => props.adapter], () => {
  renderForm();
});

onUnmounted(() => {
  if (reactRoot) {
    (reactRoot as { unmount: () => void }).unmount();
    reactRoot = null;
  }
});
</script>

<style scoped>
.form-renderer {
  height: 100%;
  overflow: auto;
  padding: 16px;
}
</style>
