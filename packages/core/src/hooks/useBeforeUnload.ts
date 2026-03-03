import { useEffect } from "react";

/**
 * Hook that warns the user before navigating away when there are unsaved changes.
 *
 * @param shouldWarn - Whether the beforeunload warning should be active
 * @param message - Custom message (modern browsers ignore custom text but still show a prompt)
 */
export function useBeforeUnload(shouldWarn: boolean, message?: string): void {
  useEffect(() => {
    if (!shouldWarn) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Modern browsers ignore custom messages but still show a prompt
      return (e.returnValue = message ?? "You have unsaved changes.");
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [shouldWarn, message]);
}
