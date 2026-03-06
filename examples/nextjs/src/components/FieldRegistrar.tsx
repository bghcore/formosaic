"use client";

import { useEffect } from "react";
import { UseInjectedFieldContext } from "@form-eng/core";
import { createMuiFieldRegistry } from "@form-eng/mui";

export default function FieldRegistrar({ children }: { children: React.ReactNode }) {
  const { setInjectedFields } = UseInjectedFieldContext();
  useEffect(() => {
    setInjectedFields(createMuiFieldRegistry());
  }, [setInjectedFields]);
  return <>{children}</>;
}
