# Field Animations for Business Rule State Changes

**Date:** 2026-03-20
**Status:** Draft
**Scope:** `@formosaic/core` only — no adapter changes required

## Problem

When business rules fire and change field state (show/hide, required, errors, read-only, labels, options), the changes are instantaneous. Fields flash in and out of existence, which can be missed by users. Smooth animations would draw attention to changes and improve the form UX.

## Approach

Pure CSS animations using `@starting-style`, `transition-behavior: allow-discrete`, and `grid-template-rows` for height collapse. No JS animation libraries, no new dependencies. Minimal JS hooks in core components to manage exit animations and attribute toggling.

- **On by default**, disabled via `settings.animations: false` on `IFormConfig`
- **~150ms duration**, customizable via CSS custom properties
- **Respects `prefers-reduced-motion: reduce`**
- **No adapter changes** — animations are applied at the core wrapper level

## Animation Targets

### 1. Field Show/Hide

When a rule sets `hidden: true/false`, the field animates in or out.

- **Height collapse/expand:** Uses a CSS grid wrapper with `grid-template-rows: 1fr` (visible) → `0fr` (hidden). The inner content div has `overflow: hidden; min-height: 0`. This is the standard CSS technique for animating height to/from zero without needing explicit pixel values. Widely supported (all browsers that support `@starting-style`).
- **Entry:** `opacity: 0 → 1`, `grid-template-rows: 0fr → 1fr` via `@starting-style`
- **Exit:** `data-exiting` attribute triggers collapse transition (`opacity → 0`, `grid-template-rows → 0fr`), field unmounts on `transitionend`

### 2. Required Indicator

The required asterisk `<span>` fades in/out with an `opacity` transition.

### 3. Error Messages

Errors animate in with `opacity: 0 → 1` and `transform: translateY(-4px) → translateY(0)` — a subtle slide-down as they fade in.

### 4. Read-Only Toggle

When switching editable ↔ read-only, the field container applies a brief dim-and-restore: `opacity: 0.6 → 1` over the animation duration.

### 5. Label Changes

When a rule changes a field's label text, a pulse animation plays: `opacity: 1 → 0.4 → 1` over ~300ms (2x the base duration).

### 6. Dropdown Option Highlight

When a rule changes dropdown options, the field container flashes with a subtle `background-color` highlight using a dedicated `--formosaic-highlight-color` (default: `rgba(0, 120, 212, 0.1)`) that fades back to transparent over 300ms.

## CSS Architecture

All animation CSS lives in `packages/core/src/styles.css`.

### New Custom Properties

```css
:root {
  --formosaic-animation-duration: 150ms;
  --formosaic-animation-easing: ease-out;
  --formosaic-highlight-color: rgba(0, 120, 212, 0.1);
}
```

### CSS Classes

| Class | Applied To | Purpose |
|---|---|---|
| `.formosaic-field-animate` | Grid wrapper div around `FieldWrapper` | Field show/hide height collapse + opacity |
| `.formosaic-field-animate-inner` | Inner div (child of grid wrapper) | `overflow: hidden; min-height: 0` for grid collapse |
| `.formosaic-required-indicator` | Required asterisk `<span>` | Required indicator fade |
| `.formosaic-error-animate` | Error message container | Error slide-in |
| `.formosaic-field-container` | Field content area | Read-only crossfade, dropdown highlight |

### Data Attributes

| Attribute | Applied To | Purpose |
|---|---|---|
| `data-formosaic-no-animations` | `.formosaic-form-wrapper` div in `Formosaic.tsx` | Disables all animations |
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

### `RenderField.tsx` — Exit Animation via Two-Phase State Machine

The current `hidden` early return is inside a `useMemo` (line 66), which means we cannot delay unmount from within the memoized block. The solution is a **two-phase render state** outside the `useMemo`:

1. **New state:** `const [shouldRender, setShouldRender] = useState(!hidden && !(isCreate && hideOnCreate))` and `const [isExiting, setIsExiting] = useState(false)`. The initialization accounts for both `hidden` and `hideOnCreate` so fields that should never appear are never mounted.
2. **New ref:** `const isFirstRender = useRef(true)` — set to `false` after first effect.
3. **Effect watching `hidden`:**
   - When `hidden` changes `false → true`: set `isExiting = true` (keeps field in DOM with `data-exiting`). Do NOT set `shouldRender = false` yet.
   - When `hidden` changes `true → false`: set `shouldRender = true`, `isExiting = false` (field enters DOM, CSS `@starting-style` handles entry animation).
4. **`onTransitionEnd` on the grid wrapper:** When exit animation completes, set `shouldRender = false`, `isExiting = false` → field unmounts. **Important:** Filter by `event.target === event.currentTarget` (or `propertyName === 'grid-template-rows'`) to avoid reacting to bubbled `transitionend` events from child elements (e.g., error animations, required indicator transitions).
5. **Rapid toggle safety:** If `hidden` flips back to `false` while `isExiting` is `true`, cancel the exit by setting `isExiting = false`.
6. **Fallback timeout:** `setTimeout` of `calc(duration * 2)` (default ~300ms) fires if `transitionend` doesn't (jsdom, CSS not loaded). Clears on unmount or if transition completes normally.
7. **First render skip:** `isFirstRender.current` flag prevents entry animation on initial mount. CSS suppression: `.formosaic-field-animate[data-first-render] { transition: none; }` ensures no `@starting-style` entry animation plays on first paint.
8. **The `useMemo` block changes:** Remove the `if (hidden) return <></>` early return from the `useMemo`. Remove `hidden` from the `useMemo` dependency array. The memoized block always returns the full `FieldWrapper` + field content — during exit animation (`isExiting = true`), the content must remain visible while the grid wrapper collapses. The `shouldRender` flag outside the `useMemo` controls whether the wrapper (and thus the memoized content) is in the DOM.
9. **`disabled` → readOnly animation:** The `isReadOnly` computed value in `RenderField` includes `disabled`. Changes to `disabled` that cause `isReadOnly` to flip trigger the same read-only crossfade animation — no separate handling needed.

**Wrapper DOM structure:**
```tsx
{shouldRender && (
  <div
    className="formosaic-field-animate"
    data-exiting={isExiting || undefined}
    data-first-render={isFirstRender.current || undefined}
    onTransitionEnd={handleTransitionEnd}
  >
    <div className="formosaic-field-animate-inner">
      <div
        className="formosaic-field-container"
        data-options-changed={optionsChanged || undefined}
        data-label-changing={labelChanging || undefined}
        data-readonly-entering={readOnlyEntering || undefined}
      >
        {/* existing FieldWrapper + field content from useMemo */}
      </div>
    </div>
  </div>
)}
```

The `.formosaic-field-container` div lives inside `RenderField`'s animation wrapper (not inside `FieldWrapper`). This gives `RenderField` control over the `data-*` attributes for options/label/readOnly change detection, while `FieldWrapper` owns its own chrome classes (`formosaic-required-indicator`, `formosaic-error-animate`).

### `FieldWrapper.tsx` — Chrome Animations

- Required indicator `<span>` gets class `formosaic-required-indicator`.
- Error message container gets class `formosaic-error-animate`.
- No new props added to `FieldWrapper` — it only needs the CSS classes for its own chrome animations.

### `RenderField.tsx` — Change Detection for Options, Label, ReadOnly

`RenderField` already receives `options`, `label`, and `readOnly` from the runtime field state. It applies `data-*` attributes to the `.formosaic-field-container` div it owns:

- `useRef` tracking previous `options` array (shallow comparison of option `value` properties): when options change, apply `data-options-changed`, remove on `transitionend` or 300ms fallback. Shallow value comparison catches content changes even when array length is the same.
- `useRef` tracking previous `label` string: when label changes, apply `data-label-changing`, remove after animation.
- `useRef` tracking previous `readOnly` boolean (derived from computed `isReadOnly` which includes `disabled`): when toggled, apply `data-readonly-entering`, remove after animation.

### `Formosaic.tsx`

- Read `settings.animations` from `IFormConfig`.
- If `false`, add `data-formosaic-no-animations` attribute to the existing `.formosaic-form-wrapper` div.

### `IFormSettings` (type)

- Add `animations?: boolean` (defaults to `true` when undefined).

## Scope Boundaries

### What Animates

- **Rule-driven `hidden` changes** — fields shown/hidden by business rules.
- **Rule-driven chrome changes** — required, errors, readOnly, label, options changes from rule evaluation.

### What Does NOT Animate

- **`softHidden` fields** — these are hidden by the field filter/expand mechanism, not by business rules. They use a separate code path (`ShowField()` check at line 107 of `RenderField.tsx`) and should appear/disappear instantly as the user filters. The animation wrapper only responds to the `hidden` prop, not `softHidden`.
- **`hideOnCreate` fields** — hidden on initial render, no animation needed (field was never visible).
- **FieldArray item removal** — `react-hook-form`'s `useFieldArray.remove()` immediately removes the item from the form array, triggering a React re-render that unmounts the item. This is driven by array index changes, not the `hidden` flag. Exit animation does not apply. FieldArray item *addition* also does not animate (items appear because the array grows, not because `hidden` flipped).
- **Wizard step transitions** — fields on new steps are not being "unhidden" by rules.
- **Custom render props** — consumers who provide `renderLabel`, `renderError`, or `renderStatus` callbacks bypass default `FieldWrapper` markup. Animation CSS classes will not be present on their custom markup. Consumers who want animations on custom chrome must apply the animation classes themselves.

### Composition Components

`ComposedForm`, `FormFragment`, and `FormField` all ultimately render through `RenderField`. They inherit animations automatically — no special-casing needed.

## Edge Cases

| Scenario | Handling |
|---|---|
| **Rapid toggle** (hidden → visible → hidden quickly) | Effect cancels exit if `hidden` flips back to `false` while `isExiting` is `true`. CSS transition reverses naturally. |
| **Multiple fields animating simultaneously** | No coordination needed. Each field's animation is independent via its own grid wrapper. |
| **Initial render** | Fields present on first render skip entry animation via `isFirstRender` ref. |
| **Wizard step transitions** | Not driven by `hidden` flag — no animation fires. |
| **SSR** | No hydration issues — animations are CSS-only with deterministic `data-*` attributes from props. |
| **`transitionend` not firing** | Fallback timeout (2x animation duration, ~300ms) forces unmount. Prevents stuck "exiting" state in jsdom or when CSS is not loaded. |
| **`styles.css` not imported** | No animations, no change in behavior. The CSS file is already optional. Fallback timeout ensures unmount still happens. |

## Testing Strategy

### Unit Tests (vitest + testing-library)

- Verify `data-exiting` attribute is applied when `hidden` flips to `true`.
- Verify field unmounts after fallback timeout when `transitionend` doesn't fire.
- Verify `data-options-changed` attribute appears when options change.
- Verify `data-formosaic-no-animations` attribute when `settings.animations: false`.
- Verify initial render does not apply entry animation (`data-first-render` attribute present).
- Verify rapid toggle does not leave field stuck in exiting state.
- Verify `softHidden` changes do not trigger animation.

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
--formosaic-highlight-color: rgba(0, 120, 212, 0.1);
```

### No Breaking Changes

- Existing consumers see animations appear automatically on upgrade.
- Consumers who don't import `styles.css` see no change.
- All 11 adapters work without modification.

## Browser Support

Both `@starting-style` and `transition-behavior: allow-discrete` are required. The limiting factor is `@starting-style` in Safari:

- Chrome 117+ (Sep 2023)
- Safari 17.5+ (Jun 2024) — `@starting-style`; `transition-behavior` landed in 17.4
- Firefox 129+ (Jun 2024)
- No IE11 support (not a concern — React 18/19 doesn't support IE11)

Browsers without support: no animation plays, fields show/hide instantly (current behavior). The fallback timeout ensures unmount always occurs.

## Out of Scope

- **Field reorder animations** (FLIP/View Transitions) — deferred to a future iteration.
- **FieldArray add/remove animations** — driven by array index, not `hidden` flag.
- **Per-effect granular settings** (e.g., `animations: { showHide: true, errors: false }`) — not needed now; single boolean suffices.
- **Adapter-specific animation overrides** — adapters inherit core animations; consumers can override via CSS.
