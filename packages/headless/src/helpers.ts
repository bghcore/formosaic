import { FieldError } from "react-hook-form";

export const GetFieldDataTestId = (
  fieldName: string,
  programName?: string,
  entityType?: string,
  entityId?: string
): string => {
  return `${programName}-${entityType}-${entityId}-${fieldName}`;
};

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

export function formatDateTime(dateStr: string, options?: { hideTimestamp?: boolean }): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  if (options?.hideTimestamp) {
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }
  return date.toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

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
