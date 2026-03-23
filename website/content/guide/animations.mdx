---
title: Field Animations
---

# Field Animations

When business rules change field state, Formosaic animates the transitions automatically. Animations are on by default -- no setup required. Import `@formosaic/core`, use the rules engine, and transitions just work. All animations are pure CSS, adapter-agnostic, and respect `prefers-reduced-motion`.

---

## What Animates

| Effect | Trigger | Animation |
|---|---|---|
| Field show/hide | Rule sets `hidden: true/false` | Opacity fade + height collapse (~150ms) |
| Required indicator | Rule toggles `required` | Opacity fade |
| Error messages | Validation error appears/disappears | Slide-in with fade |
| Read-only toggle | Rule toggles `readOnly` | Brief dim-and-restore |
| Label changes | Rule changes `label` | Opacity pulse |
| Dropdown options | Rule changes `options` | Background highlight flash |

---

## Disabling Animations

Set `settings.animations: false` on your `IFormConfig` to disable all field animations globally.

```typescript
const formConfig: IFormConfig = {
  version: 2,
  fields: { /* ... */ },
  settings: {
    animations: false, // disable all field animations
  },
};
```

---

## Customizing

Animations are controlled by CSS custom properties. Override them at the `:root` level or scope them to a specific form container.

```css
:root {
  --formosaic-animation-duration: 150ms; /* default */
  --formosaic-animation-easing: ease-out; /* default */
  --formosaic-highlight-color: rgba(0, 120, 212, 0.1); /* dropdown highlight */
}
```

To slow down animations for a specific form without affecting the rest of the page:

```css
.my-slow-form {
  --formosaic-animation-duration: 300ms;
}
```

---

## Reduced Motion

When the user's operating system has reduced motion enabled, Formosaic automatically sets the animation duration to `0ms` via a `prefers-reduced-motion: reduce` media query in `styles.css`. No consumer action is needed -- fields still show and hide correctly, just without transition.

---

## Browser Support

| Browser | Minimum version |
|---|---|
| Chrome | 117+ |
| Safari | 17.5+ |
| Firefox | 129+ |

In older browsers, animations simply do not play. Fields show and hide instantly with no visual artefacts -- graceful degradation at no extra cost.

---

## Technical Details

- Entry transitions use `@starting-style` to animate elements in from their initial state.
- Height collapse for field show/hide uses `grid-template-rows: 0fr` / `1fr` to avoid fixed pixel heights.
- Rule-driven state changes are reflected via `data-*` attributes on field wrappers, which CSS selectors target for transitions.
- All animation styles live in `@formosaic/core/styles.css`. Import it once in your app entry point: `import "@formosaic/core/styles.css"`.
