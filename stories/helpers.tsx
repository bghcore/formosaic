import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import {
  UseInjectedFieldContext,
  IFieldProps,
} from "@form-eng/core";
import { createFluentFieldRegistry } from "@form-eng/fluent";

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
