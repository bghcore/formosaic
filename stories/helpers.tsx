import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import {
  UseInjectedFieldContext,
  IFieldProps,
} from "@formosaic/core";
import { createFluentFieldRegistry } from "@formosaic/fluent";

/**
 * Wraps a story in react-hook-form's FormProvider and registers the
 * Fluent UI field registry so field components that call useFormContext() work.
 */
export function FormDecorator(props: {
  defaultValues?: Record<string, unknown>;
  children: React.ReactNode;
}) {
  const methods = useForm({
    mode: "onChange",
    defaultValues: props.defaultValues ?? {},
  });
  const { setInjectedFields } = UseInjectedFieldContext();

  useEffect(() => {
    setInjectedFields(createFluentFieldRegistry());
  }, [setInjectedFields]);

  return <FormProvider {...methods}>{props.children}</FormProvider>;
}

/** Default IFieldProps for stories -- provides a no-op setFieldValue */
export function createFieldProps(
  overrides: Partial<IFieldProps> = {}
): IFieldProps {
  return {
    fieldName: "storyField",
    label: "Story Field",
    value: "",
    readOnly: false,
    required: false,
    error: undefined,
    options: [],
    config: {},
    setFieldValue: (_name: string, _value: unknown) => {},
    ...overrides,
  };
}

/**
 * Wraps a field component with a label and optional error message,
 * mirroring the FieldWrapper chrome used by Formosaic at runtime.
 */
export function FieldStoryWrapper(props: {
  label?: string;
  required?: boolean;
  error?: { message?: string };
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {props.label && (
        <label style={{ fontWeight: 600, fontSize: 14 }}>
          {props.label}
          {props.required && <span style={{ color: "#c50f1f" }}> *</span>}
        </label>
      )}
      {props.children}
      {props.error?.message && (
        <span style={{ color: "#c50f1f", fontSize: 12 }}>
          {props.error.message}
        </span>
      )}
    </div>
  );
}
