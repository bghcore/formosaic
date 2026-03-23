<template>
  <div ref="formRoot" class="form-renderer" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";

const props = defineProps<{
  config: Record<string, unknown> | null;
  adapter: string;
}>();

const emit = defineEmits<{
  adapterError: [message: string];
}>();

const formRoot = ref<HTMLElement>();
let reactRoot: unknown = null;

async function renderForm() {
  if (!formRoot.value || !props.config) return;

  const { createRoot } = await import("react-dom/client");
  const React = await import("react");
  const {
    Formosaic,
    RulesEngineProvider,
    InjectedFieldProvider,
  } = await import("@formosaic/core");

  let registry: Record<string, JSX.Element>;
  try {
    const adapterModule = await loadAdapter(props.adapter);
    registry = adapterModule.createRegistry();
  } catch (err) {
    console.error(`Failed to load adapter "${props.adapter}":`, err);
    emit("adapterError", `Failed to load ${props.adapter} adapter. Falling back to Headless.`);
    const { createHeadlessFieldRegistry } = await import("@formosaic/headless");
    registry = createHeadlessFieldRegistry();
  }

  if (!reactRoot) {
    reactRoot = createRoot(formRoot.value);
  }

  (reactRoot as { render: (el: unknown) => void }).render(
    React.createElement(
      RulesEngineProvider,
      null,
      React.createElement(
        InjectedFieldProvider,
        { injectedFields: registry },
        React.createElement(Formosaic, {
          configName: "playground",
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
    )
  );
}

async function loadAdapter(name: string) {
  switch (name) {
    case "headless": {
      const m = await import("@formosaic/headless");
      return { createRegistry: m.createHeadlessFieldRegistry };
    }
    case "fluent": {
      const m = await import("@formosaic/fluent");
      return { createRegistry: m.createFluentFieldRegistry };
    }
    case "mui": {
      const m = await import("@formosaic/mui");
      return { createRegistry: m.createMuiFieldRegistry };
    }
    case "antd": {
      const m = await import("@formosaic/antd");
      return { createRegistry: m.createAntdFieldRegistry };
    }
    case "mantine": {
      const m = await import("@formosaic/mantine");
      return { createRegistry: m.createMantineFieldRegistry };
    }
    case "chakra": {
      const m = await import("@formosaic/chakra");
      return { createRegistry: m.createChakraFieldRegistry };
    }
    case "radix": {
      const m = await import("@formosaic/radix");
      return { createRegistry: m.createRadixFieldRegistry };
    }
    case "react-aria": {
      const m = await import("@formosaic/react-aria");
      return { createRegistry: m.createReactAriaFieldRegistry };
    }
    default: {
      const m = await import("@formosaic/headless");
      return { createRegistry: m.createHeadlessFieldRegistry };
    }
  }
  // NOTE: Adapter registry function names (createFluentFieldRegistry, createMuiFieldRegistry, etc.)
  // should be verified against each adapter's index.ts exports. The Vite config in config.ts
  // must add resolve aliases for all adapter packages used here.
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
