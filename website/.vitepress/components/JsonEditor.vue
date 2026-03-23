<template>
  <div ref="editorContainer" class="json-editor" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { json } from "@codemirror/lang-json";

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
  error: [message: string];
  valid: [];
}>();

const editorContainer = ref<HTMLElement>();
let view: EditorView | null = null;
let isInternalUpdate = false;

onMounted(() => {
  if (!editorContainer.value) return;

  const updateListener = EditorView.updateListener.of((update) => {
    if (update.docChanged && !isInternalUpdate) {
      const value = update.state.doc.toString();
      try {
        JSON.parse(value);
        emit("valid");
      } catch {
        emit("error", "Invalid JSON");
      }
      emit("update:modelValue", value);
    }
  });

  const state = EditorState.create({
    doc: props.modelValue,
    extensions: [basicSetup, json(), updateListener],
  });

  view = new EditorView({
    state,
    parent: editorContainer.value,
  });
});

watch(
  () => props.modelValue,
  (newValue) => {
    if (!view) return;
    const currentValue = view.state.doc.toString();
    if (currentValue !== newValue) {
      isInternalUpdate = true;
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: newValue },
      });
      isInternalUpdate = false;
    }
  }
);

onUnmounted(() => {
  view?.destroy();
  view = null;
});
</script>

<style scoped>
.json-editor {
  height: 100%;
  overflow: auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
}
.json-editor :deep(.cm-editor) {
  height: 100%;
}
.json-editor :deep(.cm-scroller) {
  overflow: auto;
}
</style>
