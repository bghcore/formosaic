import { FieldError } from "react-hook-form";

/**
 * Generates a consistent data-testid for field components.
 * Used by all adapter packages for test attribute generation.
 */
export const GetFieldDataTestId = (
  fieldName: string,
  testId?: string
): string => {
  return testId ? `${testId}-${fieldName}` : fieldName;
};

/**
 * Appends "error" to a className when a field has a validation error.
 * Used by Fluent and MUI adapters for error styling.
 */
export const FieldClassName = (className: string, error?: FieldError): string => {
  return error ? `${className} error` : className;
};

/**
 * Returns a field state string based on the current field props.
 * Used by headless adapter for data-state attributes.
 */
export function getFieldState(props: {
  error?: FieldError;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
}): string | undefined {
  if (props.error) return "error";
  if (props.required) return "required";
  if (props.readOnly) return "readonly";
  if (props.disabled) return "disabled";
  return undefined;
}

/**
 * Formats an ISO date string for display.
 * Returns short date (e.g. "Jan 15, 2024") or date+time (e.g. "Jan 15, 2024, 02:30 PM").
 */
export function formatDateTime(dateStr: string, options?: { hideTimestamp?: boolean }): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  if (options?.hideTimestamp) {
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }
  return date.toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

/**
 * Safely formats a value as a date+time string, falling back to String() on error.
 */
export function formatDateTimeValue(value: unknown): string {
  if (!value) return "";
  try {
    return formatDateTime(value as string);
  } catch {
    return String(value);
  }
}

/**
 * Formats a date range value for read-only display.
 * Returns "start – end", or just the one that exists.
 */
export function formatDateRange(value: unknown): string {
  if (!value) return "";
  const v = value as { start: string; end: string };
  if (!v.start && !v.end) return "";
  if (v.start && v.end) return `${v.start} – ${v.end}`;
  return v.start || v.end;
}

/**
 * Extracts display names from File or File[] values.
 */
export function getFileNames(value: unknown): string {
  if (!value) return "";
  if (Array.isArray(value)) return (value as File[]).map(f => f.name).join(", ");
  return (value as File).name ?? "";
}

/**
 * Strips all non-digit characters from a string.
 */
export function extractDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Formats a digit string as a phone number.
 * Supports US "(XXX) XXX-XXXX", international "+X XXX XXX XXXX", and raw digits.
 */
export function formatPhone(digits: string, format: "us" | "international" | "raw"): string {
  if (format === "raw") return digits;

  if (format === "international") {
    // +X XXX XXX XXXX
    const d = digits.slice(0, 12);
    if (d.length === 0) return "";
    if (d.length <= 1) return `+${d}`;
    if (d.length <= 4) return `+${d[0]} ${d.slice(1)}`;
    if (d.length <= 7) return `+${d[0]} ${d.slice(1, 4)} ${d.slice(4)}`;
    return `+${d[0]} ${d.slice(1, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
  }

  // US: (XXX) XXX-XXXX
  const d = digits.slice(0, 10);
  if (d.length === 0) return "";
  if (d.length <= 3) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

/**
 * Truncates text with "..." if it exceeds maxChars.
 */
export function ellipsifyText(value: string, maxChars: number): string {
  if (!value || value.length <= maxChars) return value ?? "";
  const cutoff = maxChars - 3;
  return `${value.substring(0, cutoff)}...`;
}

/** Default max file size in MB for FileUpload fields */
export const MAX_FILE_SIZE_MB_DEFAULT = 10;

/** Shared strings for DocumentLinks component */
export const DocumentLinksStrings = {
  link: "Link",
  addLink: "Add Link",
  addAnotherLink: "Add Another Link",
  deleteLink: "Delete Link",
  confirmDeleteLink: "Are you sure you want to delete",
  delete: "Delete",
  cancel: "Cancel",
  saveChanges: "Save Changes",
  save: "Save",
};
