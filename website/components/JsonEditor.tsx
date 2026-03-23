"use client";

import { useRef, useEffect, useCallback } from "react";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { json } from "@codemirror/lang-json";

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  onError: (message: string) => void;
  onValid: () => void;
}

export default function JsonEditor({ value, onChange, onError, onValid }: JsonEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const isInternalUpdate = useRef(false);

  // Keep callbacks in refs to avoid recreating the editor
  const onChangeRef = useRef(onChange);
  const onErrorRef = useRef(onError);
  const onValidRef = useRef(onValid);
  onChangeRef.current = onChange;
  onErrorRef.current = onError;
  onValidRef.current = onValid;

  useEffect(() => {
    if (!containerRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged && !isInternalUpdate.current) {
        const val = update.state.doc.toString();
        try {
          JSON.parse(val);
          onValidRef.current();
        } catch {
          onErrorRef.current("Invalid JSON");
        }
        onChangeRef.current(val);
      }
    });

    const state = EditorState.create({
      doc: value,
      extensions: [basicSetup, json(), updateListener],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Only mount once — value updates handled via the watch effect below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external value changes into CodeMirror
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const currentValue = view.state.doc.toString();
    if (currentValue !== value) {
      isInternalUpdate.current = true;
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: value },
      });
      isInternalUpdate.current = false;
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      style={{ height: "100%", overflow: "auto" }}
      className="json-editor"
    />
  );
}
