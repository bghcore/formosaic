/** All localizable string keys used by the core package */
export interface ICoreLocaleStrings {
  // Form status
  autoSavePending: string;
  savePending: string;
  saving: string;
  saveError: string;

  // Actions
  save: string;
  cancel: string;
  create: string;
  update: string;
  confirm: string;
  add: string;
  edit: string;
  deleteLabel: string;
  remove: string;
  close: string;
  clear: string;

  // Field labels
  required: string;
  remaining: string;
  na: string;
  unknown: string;
  loading: string;
  noResultsFound: string;
  clickToClear: string;

  // Document links
  linkTitleLabel: string;
  linkUrlLabel: string;
  urlRequired: string;

  // Expand/collapse
  seeLess: string;
  expand: string;

  // Rich text editor
  openExpandedTextEditor: string;
  closeExpandedTextEditor: string;

  // Unsaved changes
  unsavedChanges: string;
  returnToEditing: string;
  dontSave: string;
  overview: string;
  by: string;

  // Accessibility
  filterFields: string;
  saved: string;
  saveFailed: string;
  validating: string;
  stepOf: (current: number, total: number) => string;

  // Dynamic functions
  saveChangesTo: (title: string) => string;

  // Validation error messages
  invalidUrl: string;
  invalidEmail: string;
  invalidPhoneNumber: string;
  invalidYear: string;
  contentExceedsMaxSize: (maxKb: number) => string;
  noSpecialCharacters: string;
  invalidCurrencyFormat: string;
  duplicateValue: (value: string) => string;
  mustBeAtLeastChars: (min: number) => string;
  mustBeAtMostChars: (max: number) => string;
  mustBeANumber: string;
  mustBeBetween: (min: number, max: number) => string;
  thisFieldIsRequired: string;

  // Reliability / save status
  saveRetrying: string;
  saveTimeout: string;

  // Draft persistence
  draftRecovered: string;
  discardDraft: string;
  unsavedChangesWarning: string;
}
