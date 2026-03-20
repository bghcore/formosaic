---
title: Accessibility
---

# Accessibility (WCAG 2.1 AA) -- @formosaic

This document covers the WCAG 2.1 Level AA compliance status of the Formosaic library, including what is supported, known gaps, and guidance for consumers.

## Compliance Summary

The core library provides a strong accessibility foundation. Adapter packages (Fluent UI, MUI) inherit accessible patterns through the component injection system. Both Fluent UI v9 and MUI v5/v6 are built with accessibility in mind, so the adapter fields benefit from the underlying library support.

### Perceivable (WCAG 1.x)

| Requirement | Status | Details |
|---|---|---|
| Labels associated with fields | Supported | `<label>` elements have `htmlFor` pointing to the field `id`. Fields also receive `aria-labelledby` pointing to `{id}_label`. |
| Error messages associated | Supported | Fields receive `aria-describedby="{id}_error"`, and the error message element has `id="{id}_error"`. |
| Required field announcement | Supported | Fields have `aria-required="true/false"`. Visual `*` indicator has `aria-hidden="true"` with a screen-reader-only "(required)" text. |
| Status announcements | Supported | Form-level `aria-live="polite"` region announces save status (validating, saving, saved, failed). |
| Error severity | Supported | Validation errors use `role="alert"` (assertive). Save status / pending warnings use `role="status"` (polite). |
| Color contrast | Partial | CSS custom properties use WCAG-compliant default colors (`#d13438` error, `#0078d4` info on white). Consumers can override via CSS variables. Contrast depends on the consumer's background. |
| Wizard step announcements | Supported | Step changes are announced via `aria-live="polite"` region with "Step X of Y: Title". |

### Operable (WCAG 2.x)

| Requirement | Status | Details |
|---|---|---|
| Keyboard navigation | Supported | All interactive elements (inputs, buttons, selects) are natively focusable. Adapter fields use standard HTML controls or accessible UI library components. |
| Modal focus trap | Supported | `ConfirmInputsModal` uses native `<dialog>` with `showModal()`, plus a manual Tab/Shift+Tab focus trap. Focus returns to the previously focused element on close. |
| Escape closes modals | Supported | Native `<dialog>` fires a `cancel` event on Escape, which is handled to close the modal. |
| No keyboard traps | Supported | Focus trap is limited to the modal dialog. All other form elements allow free Tab navigation. |
| Expand/collapse | Supported | Expand button has `aria-expanded` attribute that toggles between `true` and `false`. |
| Focus on error | Supported | On validation failure, focus moves to the first field with an error via `requestAnimationFrame(() => focusFirstError())`. |
| Focus-visible styles | Supported | CSS includes `:focus-visible` outline styles (`2px solid` in theme color with `2px` offset). Consumers should import `styles.css` or provide their own focus styles. |
| Reduced motion | Supported | Field animations respect `prefers-reduced-motion: reduce` by setting `--formosaic-animation-duration: 0ms`, disabling all transitions and keyframe animations. See [Animations](/guide/animations). |

### Understandable (WCAG 3.x)

| Requirement | Status | Details |
|---|---|---|
| Error message clarity | Supported | Validation rules produce clear, localized error messages (e.g., "Must be at least 5 characters", "Invalid email address"). |
| Required field indicators | Supported | Visual asterisk (`*`) plus programmatic `aria-required` plus screen-reader "(required)" text. |
| Internationalization | Supported | All user-facing strings resolve through `LocaleRegistry`. Consumers can call `registerLocale()` to override any string for their language. |
| Consistent navigation | Consumer | Navigation patterns are controlled by the consumer via render props (`renderStepNavigation`, `renderSaveButton`, etc.). |

### Robust (WCAG 4.x)

| Requirement | Status | Details |
|---|---|---|
| Valid ARIA roles | Supported | `role="alert"` for errors, `role="status"` for save/pending states, `role="dialog"` + `aria-modal="true"` on confirm modal, `role="group"` on wizard and field arrays. |
| `aria-invalid` | Supported | Fields receive `aria-invalid="true"` when an error exists, `"false"` otherwise. As of v3.0.4, all Fluent and MUI adapter fields also set `aria-invalid` and `aria-required` directly on their inner controls. |
| `aria-busy` | Supported | Form field container receives `aria-busy="true"` while saving. |
| `aria-current` | Supported | Wizard step content marked with `aria-current="step"`. |
| DevTools tabs | Supported | DevTools panel uses `role="tablist"`, `role="tab"` with `aria-selected`, and `role="tabpanel"`. |

## Component Details

### FieldWrapper

The `FieldWrapper` component is the accessibility hub for every form field. It:
- Renders a `<label>` with `htmlFor={id}` and `id="{id}_label"`
- Clones ARIA attributes onto all child elements: `id`, `aria-labelledby`, `aria-required`, `aria-invalid`, `aria-describedby`
- Renders error/status messages with the correct `id="{id}_error"` matching `aria-describedby`
- Uses `role="alert"` for error messages and `role="status"` for save/pending states
- Adds `aria-busy="true"` to the container during save operations

### ConfirmInputsModal

- Uses native `<dialog>` element with `showModal()` for modal semantics
- Explicit `role="dialog"` and `aria-modal="true"` for cross-browser compatibility
- `aria-label` set to the localized "Confirm" string
- Manual focus trap (Tab/Shift+Tab cycling)
- Focus returns to previously focused element on close
- Escape key handled via `cancel` event

### WizardForm

- Container has `role="group"` with `aria-label="Form wizard"` (localizable)
- `aria-live="polite"` region announces step changes: "Step X of Y: Title"
- Step content marked with `aria-current="step"`

### FieldArray

- Container has `role="group"` with `aria-label` set to the field label
- Each item has `role="group"` with `aria-label` including index and total: "Addresses item 1 of 3"

### FormErrorBoundary

- Fallback UI has `role="alert"` to announce component crashes to assistive technology
- Retry button is keyboard accessible

### Formosaic

- `aria-live="polite"` region announces form-level status (validating, saving, saved, failed)
- Filter input has `aria-label` for screen readers
- Form errors section has `role="alert"`
- Expand/collapse button has `aria-expanded`

## Adapter Field Guidelines

Adapter fields (Fluent, MUI, and Headless) receive ARIA attributes from `FieldWrapper` via `React.cloneElement`. The following attributes are automatically applied to **all** child elements (not just the first child):

- `id` -- matches the field name, enables `<label htmlFor>` association
- `aria-labelledby` -- points to the label element (unless `ariaLabel` is set)
- `aria-required` -- reflects the field's required state
- `aria-invalid` -- reflects whether the field has a validation error
- `aria-describedby` -- points to the error/status message element

> **v3.0.4 improvement:** In previous versions, only the first child element received ARIA attributes from `FieldWrapper`. As of v3.0.4, all sibling children receive `aria-labelledby`, `aria-required`, `aria-invalid`, and `aria-describedby`. Additionally, all 8 Fluent and 8 MUI field components (Textbox, Number, Dropdown, MultiSelect, MultiSelectSearch, DateControl, Slider, Toggle) now explicitly set `aria-invalid` and `aria-required` on their inner controls, ensuring screen readers announce validation state even when the underlying UI library component does not propagate cloned ARIA props.

### When creating custom field components

1. **Accept standard ARIA props** -- Your component should spread or pass through `aria-*` props that `FieldWrapper` injects via `cloneElement`.
2. **Use semantic HTML** -- Prefer native `<input>`, `<select>`, `<textarea>` elements which have built-in accessibility.
3. **Announce dynamic changes** -- If your component updates content dynamically (e.g., live search results), use `aria-live` regions.
4. **Test with a screen reader** -- Verify that field labels, errors, and required states are announced correctly.

## Known Gaps

1. **Color contrast is consumer-dependent** -- The library provides CSS custom properties with WCAG-compliant defaults, but actual contrast depends on the consumer's theme and background colors. Consumers should verify contrast ratios in their specific implementation.

2. **Custom render props bypass accessibility** -- When consumers provide custom `renderLabel`, `renderError`, `renderStatus`, `renderDialog`, or `renderStepNavigation` functions, they are responsible for maintaining accessibility attributes in their custom implementations.

3. **Field ordering** -- When field order changes dynamically via rules, the DOM reflow is not explicitly announced. Screen reader users may not notice fields moving positions.

4. **Complex field types** -- Rich text editors (HookPopOutEditor) and document link fields (HookDocumentLinks) have more complex interaction patterns that may need additional ARIA attributes depending on the specific UI library implementation.

## Testing

Accessibility tests are located at:
```
packages/core/src/__tests__/components/Accessibility.test.tsx
```

The test suite covers:
- `aria-busy` behavior during save
- Error messages with `role="alert"`
- Status messages with `role="status"`
- `aria-required`, `aria-invalid`, `aria-labelledby`, `aria-describedby` on fields
- `<label htmlFor>` association
- Required indicator with `aria-hidden` and screen-reader text
- `aria-label` vs `aria-labelledby` behavior
- Error message ID matching
- Wizard `aria-live` region, `aria-current`, and `role="group"`
- ARIA attribute ID conventions
- Locale strings for all accessibility-related text

Run accessibility tests:
```bash
npx vitest run packages/core/src/__tests__/components/Accessibility.test.tsx
```
