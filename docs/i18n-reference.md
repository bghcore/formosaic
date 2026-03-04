# i18n / Localization Reference

The dynamic-forms-core package uses a locale registry to manage all user-facing strings. All strings default to English and can be partially or fully overridden for other languages.

---

## Usage

```typescript
import {
  registerLocale,
  getLocaleString,
  resetLocale,
  getCurrentLocale,
} from "@bghcore/dynamic-forms-core";

// Register a partial locale override (unset keys fall back to English defaults)
registerLocale({
  required: "Obligatoire",
  save: "Sauvegarder",
  cancel: "Annuler",
  saving: "Enregistrement...",
  thisFieldIsRequired: "Ce champ est obligatoire",
});

// Get a specific string
const label = getLocaleString("required"); // "Obligatoire"

// Get a dynamic string function
const fn = getLocaleString("saveChangesTo");
const msg = fn("Mon Formulaire"); // "Do you want to save your changes to Mon Formulaire?"
// (unless saveChangesTo was also overridden)

// Get the full current locale object
const allStrings = getCurrentLocale();

// Reset to English defaults
resetLocale();
```

### Multiple registerLocale Calls

`registerLocale()` merges into the current locale. Calling it multiple times accumulates overrides:

```typescript
registerLocale({ save: "Guardar" });
registerLocale({ cancel: "Cancelar" });
// Both "save" and "cancel" are now overridden; everything else is English.
```

---

## All Locale String Keys

### Form Status

| Key | Type | Default (English) | Used In |
|-----|------|-------------------|---------|
| `autoSavePending` | `string` | `"AutoSave Pending, please check for errors..."` | FieldWrapper status display |
| `savePending` | `string` | `"Save Pending, please check for errors..."` | FieldWrapper status display |
| `saving` | `string` | `"Saving..."` | FieldWrapper, DynamicForm save indicator |
| `saveError` | `string` | `"Error saving form"` | FieldWrapper, error display |

### Actions

| Key | Type | Default (English) | Used In |
|-----|------|-------------------|---------|
| `save` | `string` | `"Save"` | Form action buttons |
| `cancel` | `string` | `"Cancel"` | Form action buttons, dialogs |
| `create` | `string` | `"Create"` | Form action buttons (create mode) |
| `update` | `string` | `"Update"` | Form action buttons (edit mode) |
| `confirm` | `string` | `"Confirm"` | Confirm input modal |
| `add` | `string` | `"Add"` | Field arrays, document links |
| `edit` | `string` | `"Edit"` | Document links |
| `deleteLabel` | `string` | `"Delete"` | Document links, field arrays |
| `remove` | `string` | `"Remove"` | Field arrays |
| `close` | `string` | `"Close"` | Dialogs, panels |
| `clear` | `string` | `"Clear"` | Dropdown clear action |

### Field Labels

| Key | Type | Default (English) | Used In |
|-----|------|-------------------|---------|
| `required` | `string` | `"Required"` | FieldWrapper required indicator |
| `remaining` | `string` | `"remaining"` | Character count display |
| `na` | `string` | `"N/A"` | Empty value display |
| `unknown` | `string` | `"Unknown"` | Unknown value fallback |
| `loading` | `string` | `"Loading"` | Loading states |
| `noResultsFound` | `string` | `"No results found"` | Search dropdowns (MultiSelectSearch) |
| `clickToClear` | `string` | `"Click here to Clear"` | Dropdown clear hint |

### Document Links

| Key | Type | Default (English) | Used In |
|-----|------|-------------------|---------|
| `linkTitleLabel` | `string` | `"Link Title"` | DocumentLinks field label |
| `linkUrlLabel` | `string` | `"Link URL"` | DocumentLinks field label |
| `urlRequired` | `string` | `"Invalid Url (http/https required)"` | DocumentLinks URL validation |

### Expand / Collapse

| Key | Type | Default (English) | Used In |
|-----|------|-------------------|---------|
| `seeLess` | `string` | `"See less"` | Expand/collapse toggle |
| `expand` | `string` | `"Expand"` | Expand/collapse toggle |

### Rich Text Editor

| Key | Type | Default (English) | Used In |
|-----|------|-------------------|---------|
| `openExpandedTextEditor` | `string` | `"Open Expanded Editor"` | PopOutEditor button label |
| `closeExpandedTextEditor` | `string` | `"Close Expanded Editor"` | PopOutEditor close button |

### Unsaved Changes

| Key | Type | Default (English) | Used In |
|-----|------|-------------------|---------|
| `unsavedChanges` | `string` | `"Unsaved Changes"` | Unsaved changes dialog title |
| `returnToEditing` | `string` | `"Return to Editing"` | Unsaved changes dialog action |
| `dontSave` | `string` | `"Don't save"` | Unsaved changes dialog action |
| `overview` | `string` | `"Overview"` | Form overview label |
| `by` | `string` | `"by"` | Attribution text (e.g., "Modified by John") |

### Accessibility

| Key | Type | Default (English) | Used In |
|-----|------|-------------------|---------|
| `filterFields` | `string` | `"Filter form fields"` | Filter input aria label |
| `saved` | `string` | `"Saved successfully"` | Save success announcement |
| `saveFailed` | `string` | `"Save failed"` | Save failure announcement |
| `validating` | `string` | `"Validating..."` | Async validation status |

### Validation Error Messages

| Key | Type | Default (English) | Used In |
|-----|------|-------------------|---------|
| `invalidUrl` | `string` | `"Invalid URL"` | URL validation |
| `invalidEmail` | `string` | `"Invalid email address"` | Email validation |
| `invalidPhoneNumber` | `string` | `"Invalid phone number"` | Phone number validation |
| `invalidYear` | `string` | `"Invalid year"` | Year validation |
| `noSpecialCharacters` | `string` | `"Special characters are not allowed"` | Special character validation |
| `invalidCurrencyFormat` | `string` | `"Invalid currency format"` | Currency format validation |
| `mustBeANumber` | `string` | `"Must be a number"` | Numeric validation |
| `thisFieldIsRequired` | `string` | `"This field is required"` | Required field validation |

### Reliability / Save Status

| Key | Type | Default (English) | Used In |
|-----|------|-------------------|---------|
| `saveRetrying` | `string` | `"Retrying save..."` | Save retry status display |
| `saveTimeout` | `string` | `"Save timed out"` | Save timeout status display |

### Draft Persistence

| Key | Type | Default (English) | Used In |
|-----|------|-------------------|---------|
| `draftRecovered` | `string` | `"Draft recovered"` | Draft recovery notification |
| `discardDraft` | `string` | `"Discard draft"` | Draft discard action |
| `unsavedChangesWarning` | `string` | `"You have unsaved changes. Are you sure you want to leave?"` | Before-unload warning (useBeforeUnload hook) |

---

## Dynamic String Functions

Some locale entries are functions that accept parameters and return a formatted string. These must be overridden with functions (not plain strings) in your locale registration.

| Key | Signature | Default Output | Example |
|-----|-----------|----------------|---------|
| `stepOf` | `(current: number, total: number) => string` | `"Step {current} of {total}"` | `stepOf(2, 5)` returns `"Step 2 of 5"` |
| `saveChangesTo` | `(title: string) => string` | `"Do you want to save your changes to {title}?"` | `saveChangesTo("My Form")` returns `"Do you want to save your changes to My Form?"` |
| `contentExceedsMaxSize` | `(maxKb: number) => string` | `"Content exceeds maximum size of {maxKb}KB"` | `contentExceedsMaxSize(150)` returns `"Content exceeds maximum size of 150KB"` |
| `duplicateValue` | `(value: string) => string` | `"Duplicate value: {value}"` | `duplicateValue("Active")` returns `"Duplicate value: Active"` |
| `mustBeAtLeastChars` | `(min: number) => string` | `"Must be at least {min} characters"` | `mustBeAtLeastChars(3)` returns `"Must be at least 3 characters"` |
| `mustBeAtMostChars` | `(max: number) => string` | `"Must be at most {max} characters"` | `mustBeAtMostChars(255)` returns `"Must be at most 255 characters"` |
| `mustBeBetween` | `(min: number, max: number) => string` | `"Must be between {min} and {max}"` | `mustBeBetween(1, 100)` returns `"Must be between 1 and 100"` |

### Overriding Dynamic Functions

```typescript
registerLocale({
  stepOf: (current: number, total: number) => `Etape ${current} sur ${total}`,
  saveChangesTo: (title: string) => `Voulez-vous enregistrer vos modifications de ${title} ?`,
  contentExceedsMaxSize: (maxKb: number) => `Le contenu depasse la taille maximale de ${maxKb} Ko`,
  duplicateValue: (value: string) => `Valeur en double : ${value}`,
  mustBeAtLeastChars: (min: number) => `Doit contenir au moins ${min} caracteres`,
  mustBeAtMostChars: (max: number) => `Doit contenir au plus ${max} caracteres`,
  mustBeBetween: (min: number, max: number) => `Doit etre entre ${min} et ${max}`,
});
```

---

## How Strings Flow Through the System

The localization system uses a layered architecture:

```
registerLocale(partial)           <-- Consumer registers overrides
        |
        v
LocaleRegistry (currentLocale)   <-- Merges overrides with English defaults
        |
        v
getLocaleString(key)              <-- Returns current locale value for a key
        |
        v
FormStrings                       <-- ES getter properties that call getLocaleString()
        |                             (e.g., FormStrings.required)
        v
Form Components                   <-- Read strings from FormStrings
  - FieldWrapper                  <-- required label, error messages, save status
  - DynamicForm                   <-- saving status, action buttons
  - ConfirmInputsModal            <-- confirm/cancel labels
  - Field components (via props)  <-- validation error messages
```

### Step-by-step:

1. **Validators** in the `ValidationRegistry` return error messages. Built-in validators use `getLocaleString()` to get the current locale's error text.
2. **FieldWrapper** displays field chrome (labels, error messages, save status) using `FormStrings`.
3. **FormStrings** is an object with ES `get` accessors. Each property calls `getLocaleString(key)` on access, so it always reflects the latest registered locale.
4. **`registerLocale()`** merges the provided partial locale into the current locale object. Unspecified keys retain their English default values.

### Backward Compatibility

`FormStrings` maintains backward compatibility with code that reads string properties directly:

```typescript
import { FormStrings } from "@bghcore/dynamic-forms-core";

// This still works and automatically reflects locale overrides:
const label = FormStrings.required; // "Obligatoire" if French locale registered
```

---

## Full Locale Override Example

```typescript
import { registerLocale } from "@bghcore/dynamic-forms-core";

// Spanish locale (complete override)
registerLocale({
  // Form status
  autoSavePending: "Guardado automatico pendiente, verifique errores...",
  savePending: "Guardado pendiente, verifique errores...",
  saving: "Guardando...",
  saveError: "Error al guardar el formulario",

  // Actions
  save: "Guardar",
  cancel: "Cancelar",
  create: "Crear",
  update: "Actualizar",
  confirm: "Confirmar",
  add: "Agregar",
  edit: "Editar",
  deleteLabel: "Eliminar",
  remove: "Quitar",
  close: "Cerrar",
  clear: "Limpiar",

  // Field labels
  required: "Obligatorio",
  remaining: "restantes",
  na: "N/D",
  unknown: "Desconocido",
  loading: "Cargando",
  noResultsFound: "No se encontraron resultados",
  clickToClear: "Haga clic para limpiar",

  // Document links
  linkTitleLabel: "Titulo del enlace",
  linkUrlLabel: "URL del enlace",
  urlRequired: "URL invalida (se requiere http/https)",

  // Expand/collapse
  seeLess: "Ver menos",
  expand: "Expandir",

  // Rich text
  openExpandedTextEditor: "Abrir editor expandido",
  closeExpandedTextEditor: "Cerrar editor expandido",

  // Unsaved changes
  unsavedChanges: "Cambios sin guardar",
  returnToEditing: "Volver a editar",
  dontSave: "No guardar",
  overview: "Vista general",
  by: "por",

  // Accessibility
  filterFields: "Filtrar campos del formulario",
  saved: "Guardado exitosamente",
  saveFailed: "Error al guardar",
  validating: "Validando...",
  stepOf: (current: number, total: number) => `Paso ${current} de ${total}`,

  // Dynamic
  saveChangesTo: (title: string) => `Desea guardar los cambios en ${title}?`,

  // Validation errors
  invalidUrl: "URL invalida",
  invalidEmail: "Direccion de correo invalida",
  invalidPhoneNumber: "Numero de telefono invalido",
  invalidYear: "Ano invalido",
  contentExceedsMaxSize: (maxKb: number) => `El contenido excede el tamano maximo de ${maxKb}KB`,
  noSpecialCharacters: "No se permiten caracteres especiales",
  invalidCurrencyFormat: "Formato de moneda invalido",
  duplicateValue: (value: string) => `Valor duplicado: ${value}`,
  mustBeAtLeastChars: (min: number) => `Debe tener al menos ${min} caracteres`,
  mustBeAtMostChars: (max: number) => `Debe tener como maximo ${max} caracteres`,
  mustBeANumber: "Debe ser un numero",
  mustBeBetween: (min: number, max: number) => `Debe estar entre ${min} y ${max}`,
  thisFieldIsRequired: "Este campo es obligatorio",

  // Reliability
  saveRetrying: "Reintentando guardado...",
  saveTimeout: "Tiempo de guardado agotado",

  // Draft
  draftRecovered: "Borrador recuperado",
  discardDraft: "Descartar borrador",
  unsavedChangesWarning: "Tiene cambios sin guardar. Esta seguro de que desea salir?",
});
```

---

## Testing with Locale

Use `resetLocale()` in test setup/teardown to ensure clean state:

```typescript
import { registerLocale, resetLocale, getLocaleString } from "@bghcore/dynamic-forms-core";

beforeEach(() => {
  resetLocale();
});

test("should use registered locale strings", () => {
  registerLocale({ required: "Pflichtfeld" });
  expect(getLocaleString("required")).toBe("Pflichtfeld");
});

test("should fall back to English for unset keys", () => {
  registerLocale({ save: "Speichern" });
  expect(getLocaleString("required")).toBe("Required"); // Not overridden
  expect(getLocaleString("save")).toBe("Speichern");    // Overridden
});
```
