import { useEffect, useRef } from "react";

/**
 * Hook that warns the user before navigating away when there are unsaved changes.
 *
 * @param shouldWarn - Whether the beforeunload warning should be active
 * @param message - Custom message (modern browsers ignore custom text but still show a prompt)
 * @param onAbandonment - Optional analytics callback fired when the user leaves with unsaved changes
 */
export function useBeforeUnload(
  shouldWarn: boolean,
  message?: string,
  onAbandonment?: () => void,
): void {
  const onAbandonmentRef = useRef(onAbandonment);
  onAbandonmentRef.current = onAbandonment;

  useEffect(() => {
    if (!shouldWarn || typeof window === "undefined") return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      onAbandonmentRef.current?.();
      // Modern browsers ignore custom messages but still show a prompt
      return (e.returnValue = message ?? "You have unsaved changes.");
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [shouldWarn, message]);
}
