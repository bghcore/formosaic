# Field Animations for Business Rule State Changes

**Date:** 2026-03-20
**Status:** Draft
**Scope:** `@formosaic/core` only — no adapter changes required

## Problem

When business rules fire and change field state (show/hide, required, errors, read-only, labels, options), the changes are instantaneous. Fields flash in and out of existence, which can be missed by users. Smooth animations would draw attention to changes and improve the form UX.

## Approach

Pure CSS animations using `@starting-style` and `transition-behavior: allow-discrete`. No JS animation libraries, no new dependencies. Minimal JS hooks in core components to manage exit animations and attribute toggling.

- **On by default**, disabled via `settings.animations: false` on `IFormConfig`
- **~150ms duration**, customizable via CSS custom properties
- **Respects `prefers-reduced-motion: reduce`**
- **No adapter changes** — animations are applied at the core wrapper level

## Animation Targets

### 1. Field Show/Hide

When a rule sets `hidden: true/false`, the field animates in or out.

- **Entry:** `opacity: 0 → 1`, `max-height: 0 → auto`, `margin/padding: 0 → normal` via `@starting-style`
- **Exit:** `data-exiting` attribute triggers collapse transition (`opacity → 0`, `max-height → 0`, `margin/padding → 0`), field unmounts on `transitionend`
- `overflow: hidden` during transitions prevents content spill

### 2. Required Indicator

The required asterisk `<span>` fades in/out with an `opacity` transition.

### 3. Error Messages

Errors animate in with `opacity: 0 → 1` and `transform: translateY(-4px) → translateY(0)` — a subtle slide-down as they fade in.

### 4. Read-Only Toggle

When switching editable ↔ read-only, the field container applies a brief dim-and-restore: `opacity: 0.6 → 1` over the animation duration.

### 5. Label Changes

When a rule changes a field's label text, a pulse animation plays: `opacity: 1 → 0.4 → 1` over ~300ms (2x the base duration).

### 6. Dropdown Option Highlight

When a rule changes dropdown options, the field container flashes with a subtle `background-color` highlight (10% opacity of `--formosaic-saving-color`) that fades back to transparent over 300ms.

## CSS Architecture

All animation CSS lives in `packages/core/src/styles.css`.

### New Custom Properties

```css
:root {
  --formosaic-animation-duration: 150ms;
  --formosaic-animation-easing: ease-out;
}
```

### CSS Classes

| Class | Applied To | Purpose |
|---|---|---|
| `.formosaic-field-animate` | Wrapper div around `FieldWrapper` | Field show/hide transitions |
| `.formosaic-required-indicator` | Required asterisk `<span>` | Required indicator fade |
| `.formosaic-error-animate` | Error message container | Error slide-in |
| `.formosaic-field-container` | Field content area | Read-only crossfade, dropdown highlight |

### Data Attributes

| Attribute | Applied To | Purpose |
|---|---|---|
| `data-formosaic-no-animations` | Form root element | Disables all animations |
| `data-exiting` | `.formosaic-field-animate` | Triggers exit collapse |
| `data-label-changing` | Label element | Triggers label pulse |
| `data-options-changed` | `.formosaic-field-container` | Triggers option highlight flash |
| `data-readonly-entering` | `.formosaic-field-container` | Triggers read-only crossfade |

### Reduced Motion & Disabled

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --formosaic-animation-duration: 0ms;
  }
}

[data-formosaic-no-animations] {
  --formosaic-animation-duration: 0ms;
}
```

## Component Changes

### `RenderField.tsx`

- Wrap `FieldWrapper` in a `<div class="formosaic-field-animate">`.
- When `hidden` flips to `true`, set `data-exiting` attribute instead of immediately unmounting.
- `onTransitionEnd` listener unmounts the field after the exit animation completes.
- `useRef` tracks previous `hidden` value to detect transition direction.
- Rapid toggle safety: `onTransitionEnd` checks current `hidden` value — if `false`, cancels unmount.
- First render detection via ref: fields present on initial render do NOT animate in.
- Fallback timeout (~200ms): if `transitionend` never fires (jsdom, CSS not loaded), force unmount.

### `FieldWrapper.tsx`

- Required indicator `<span>` gets class `formosaic-required-indicator`.
- Error message container gets class `formosaic-error-animate`.
- Field container gets class `formosaic-field-container`.
- `useRef` tracking previous `options` array: when options change, apply `data-options-changed` attribute, remove on `transitionend` (or after 300ms fallback).
- `useRef` tracking previous `label` string: when label changes, apply `data-label-changing` attribute, remove after animation completes.
- `useRef` tracking previous `readOnly` boolean: when toggled, apply `data-readonly-entering` attribute briefly.

### `Formosaic.tsx`

- Read `settings.animations` from `IFormConfig`.
- If `false`, add `data-formosaic-no-animations` attribute to the form root element.

### `IFormSettings` (type)

- Add `animations?: boolean` (defaults to `true` when undefined).

## Edge Cases

| Scenario | Handling |
|---|---|
| **Rapid toggle** (hidden → visible → hidden quickly) | `onTransitionEnd` checks current `hidden` value; cancels unmount if field was re-shown. CSS transition reverses naturally. |
| **Multiple fields animating simultaneously** | No coordination needed. Each field's animation is independent via its own wrapper div. |
| **Initial render** | Fields present on first render skip entry animation. Tracked via a `useRef` flag. |
| **Field arrays** | Items added/removed from `FieldArray` get the same show/hide animation (they go through `RenderField`). |
| **Wizard step transitions** | Fields on new wizard steps are not "unhidden" by rules — `hidden` flag is not involved, so no animation fires. |
| **SSR** | No hydration issues — animations are CSS-only with deterministic `data-*` attributes from props. |
| **`transitionend` not firing** | Fallback timeout (~200ms) forces unmount. Prevents stuck "exiting" state in jsdom or when CSS is not loaded. |
| **`styles.css` not imported** | No animations, no change in behavior. The CSS file is already optional. |

## Testing Strategy

### Unit Tests (vitest + testing-library)

- Verify `data-exiting` attribute is applied when `hidden` flips to `true`.
- Verify `data-options-changed` attribute appears when options change.
- Verify `data-formosaic-no-animations` attribute when `settings.animations: false`.
- Verify initial render does not apply entry animation class/attributes.
- Verify fallback timeout unmounts field when `transitionend` doesn't fire.
- Verify rapid toggle does not leave field stuck in exiting state.

### E2E Tests (Playwright)

- Trigger a rule causing a field to show — verify field is visible after animation duration.
- Trigger a rule causing a field to hide — verify field is removed after animation duration.

## Public API Surface

### New Type

```typescript
interface IFormSettings {
  // ... existing properties
  animations?: boolean; // default: true
}
```

### New CSS Custom Properties

```css
--formosaic-animation-duration: 150ms;
--formosaic-animation-easing: ease-out;
```

### No Breaking Changes

- Existing consumers see animations appear automatically on upgrade.
- Consumers who don't import `styles.css` see no change.
- All 11 adapters work without modification.

## Browser Support

- Chrome 117+ (Sep 2023)
- Safari 17.5+ (Jun 2024)
- Firefox 129+ (Jun 2024)
- No IE11 support (not a concern — React 18/19 doesn't support IE11)

## Out of Scope

- **Field reorder animations** (FLIP/View Transitions) — deferred to a future iteration.
- **Per-effect granular settings** (e.g., `animations: { showHide: true, errors: false }`) — not needed now; single boolean suffices.
- **Adapter-specific animation overrides** — adapters inherit core animations; consumers can override via CSS.
