"use client";

import { useEffect } from "react";
import { UseInjectedFieldContext } from "@form-engine/core";
import { createMuiFieldRegistry } from "@form-engine/mui";

export default function FieldRegistrar({ children }: { children: React.ReactNode }) {
  const { setInjectedFields } = UseInjectedFieldContext();
  useEffect(() => {
    setInjectedFields(createMuiFieldRegistry());
  }, [setInjectedFields]);
  return <>{children}</>;
}
