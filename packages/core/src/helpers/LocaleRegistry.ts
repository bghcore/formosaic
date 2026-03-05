import { ICoreLocaleStrings } from "../types/ILocaleStrings";

/** Default English strings */
const defaultStrings: ICoreLocaleStrings = {
  // Form status
  autoSavePending: "AutoSave Pending, please check for errors...",
  savePending: "Save Pending, please check for errors...",
  saving: "Saving...",
  saveError: "Error saving form",

  // Actions
  save: "Save",
  cancel: "Cancel",
  create: "Create",
  update: "Update",
  confirm: "Confirm",
  add: "Add",
  edit: "Edit",
  deleteLabel: "Delete",
  remove: "Remove",
  close: "Close",
  clear: "Clear",

  // Field labels
  required: "Required",
  remaining: "remaining",
  na: "N/A",
  unknown: "Unknown",
  loading: "Loading",
  noResultsFound: "No results found",
  clickToClear: "Click here to Clear",

  // Document links
  linkTitleLabel: "Link Title",
  linkUrlLabel: "Link URL",
  urlRequired: "Invalid Url (http/https required)",

  // Expand/collapse
  seeLess: "See less",
  expand: "Expand",

  // Rich text editor
  openExpandedTextEditor: "Open Expanded Editor",
  closeExpandedTextEditor: "Close Expanded Editor",

  // Unsaved changes
  unsavedChanges: "Unsaved Changes",
  returnToEditing: "Return to Editing",
  dontSave: "Don't save",
  overview: "Overview",
  by: "by",

  // Accessibility
  filterFields: "Filter form fields",
  saved: "Saved successfully",
  saveFailed: "Save failed",
  validating: "Validating...",
  stepOf: (current: number, total: number) => `Step ${current} of ${total}`,
  formWizard: "Form wizard",
  itemOfTotal: (index: number, total: number, label: string) => `${label} item ${index} of ${total}`,

  // Dynamic functions
  saveChangesTo: (title: string) => `Do you want to save your changes to ${title}?`,

  // Validation error messages
  invalidUrl: "Invalid URL",
  invalidEmail: "Invalid email address",
  invalidPhoneNumber: "Invalid phone number",
  invalidYear: "Invalid year",
  contentExceedsMaxSize: (maxKb: number) => `Content exceeds maximum size of ${maxKb}KB`,
  noSpecialCharacters: "Special characters are not allowed",
  invalidCurrencyFormat: "Invalid currency format",
  duplicateValue: (value: string) => `Duplicate value: ${value}`,
  mustBeAtLeastChars: (min: number) => `Must be at least ${min} characters`,
  mustBeAtMostChars: (max: number) => `Must be at most ${max} characters`,
  mustBeANumber: "Must be a number",
  mustBeBetween: (min: number, max: number) => `Must be between ${min} and ${max}`,
  thisFieldIsRequired: "This field is required",

  // Reliability / save status
  saveRetrying: "Retrying save...",
  saveTimeout: "Save timed out",

  // Draft persistence
  draftRecovered: "Draft recovered",
  discardDraft: "Discard draft",
  unsavedChangesWarning: "You have unsaved changes. Are you sure you want to leave?",
};

let currentLocale: ICoreLocaleStrings = { ...defaultStrings };

/**
 * Register a partial or full locale override. Unspecified keys fall back to English defaults.
 * Can be called multiple times; each call merges into the current locale.
 */
export function registerLocale(partial: Partial<ICoreLocaleStrings>): void {
  currentLocale = { ...currentLocale, ...partial };
}

/**
 * Get a locale string by key. Returns the registered locale value or the English default.
 */
export function getLocaleString<K extends keyof ICoreLocaleStrings>(key: K): ICoreLocaleStrings[K] {
  return currentLocale[key];
}

/**
 * Reset the locale to English defaults. Useful for testing.
 */
export function resetLocale(): void {
  currentLocale = { ...defaultStrings };
}

/**
 * Get the full current locale object. Useful for debugging or bulk operations.
 */
export function getCurrentLocale(): ICoreLocaleStrings {
  return { ...currentLocale };
}
