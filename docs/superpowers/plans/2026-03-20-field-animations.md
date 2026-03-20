# Field Animations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add CSS-based animations to form fields when business rules change state (show/hide, required, errors, read-only, labels, dropdown options).

**Architecture:** Pure CSS animations using `@starting-style` and `grid-template-rows` for height collapse, with a two-phase state machine in `RenderField.tsx` to delay unmount during exit animations. All animation CSS lives in `styles.css`, toggled by data attributes set in core components. On by default, disabled via `settings.animations: false`.

**Tech Stack:** CSS (`@starting-style`, `transition-behavior: allow-discrete`, `grid-template-rows`), React state/refs, vitest + @testing-library/react, Playwright.

**Spec:** `docs/superpowers/specs/2026-03-20-field-animations-design.md`

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `packages/core/src/types/IFormConfig.ts` | Add `animations?: boolean` to `IFormSettings` |
| Modify | `packages/core/src/styles.css` | All animation CSS (custom properties, transitions, keyframes, reduced motion) |
| Modify | `packages/core/src/components/RenderField.tsx` | Two-phase show/hide state machine, animation wrapper, change detection for options/label/readOnly |
| Modify | `packages/core/src/components/FieldWrapper.tsx` | Add `formosaic-required-indicator` and `formosaic-error-animate` CSS classes |
| Modify | `packages/core/src/components/Formosaic.tsx` | Wire `data-formosaic-no-animations` attribute on form wrapper |
| Create | `packages/core/src/__tests__/components/FieldAnimations.test.tsx` | Unit tests for all animation behaviors |
| Modify | `e2e/tests/rules.spec.ts` | E2E tests for animated show/hide |

---

### Task 1: Add `animations` to `IFormSettings`

**Files:**
- Modify: `packages/core/src/types/IFormConfig.ts:30-45`

- [ ] **Step 1: Add the property**

In `IFormSettings` (line 30), add after the `analytics` property (line 44):

```typescript
  /** Enable/disable field animations on rule state changes. Default: true. */
  animations?: boolean;
```

- [ ] **Step 2: Verify build**

Run: `npm run build:core`
Expected: Clean build, no errors.

- [ ] **Step 3: Commit**

```bash
git add packages/core/src/types/IFormConfig.ts
git commit -m "feat(core): add animations setting to IFormSettings"
```

---

### Task 2: Add animation CSS to `styles.css`

**Files:**
- Modify: `packages/core/src/styles.css`

- [ ] **Step 1: Add custom properties to `:root`**

Add inside the existing `:root` block (after line 17, before the closing `}`):

```css
  --formosaic-animation-duration: 150ms;
  --formosaic-animation-easing: ease-out;
  --formosaic-highlight-color: rgba(0, 120, 212, 0.1);
```

- [ ] **Step 2: Add field show/hide animation**

After the `.formosaic-form :focus-visible` block (after line 37), add:

```css
/* ─── Field show/hide animation (grid height collapse + opacity) ─── */
.formosaic-field-animate {
  display: grid;
  grid-template-rows: 1fr;
  opacity: 1;
  transition:
    grid-template-rows var(--formosaic-animation-duration) var(--formosaic-animation-easing),
    opacity var(--formosaic-animation-duration) var(--formosaic-animation-easing);
}

@starting-style {
  .formosaic-field-animate {
    grid-template-rows: 0fr;
    opacity: 0;
  }
}

.formosaic-field-animate[data-first-render] {
  transition: none;
}

.formosaic-field-animate[data-exiting] {
  grid-template-rows: 0fr;
  opacity: 0;
}

.formosaic-field-animate-inner {
  overflow: hidden;
  min-height: 0;
}
```

- [ ] **Step 3: Add required indicator animation**

```css
/* ─── Required indicator fade ─── */
.formosaic-required-indicator {
  opacity: 1;
  transition: opacity var(--formosaic-animation-duration) var(--formosaic-animation-easing);
}

@starting-style {
  .formosaic-required-indicator {
    opacity: 0;
  }
}
```

- [ ] **Step 4: Add error message animation**

```css
/* ─── Error message slide-in ─── */
.formosaic-error-animate {
  opacity: 1;
  transform: translateY(0);
  transition:
    opacity var(--formosaic-animation-duration) var(--formosaic-animation-easing),
    transform var(--formosaic-animation-duration) var(--formosaic-animation-easing);
}

@starting-style {
  .formosaic-error-animate {
    opacity: 0;
    transform: translateY(-4px);
  }
}
```

- [ ] **Step 5: Add read-only crossfade animation**

```css
/* ─── Read-only crossfade ─── */
.formosaic-field-container[data-readonly-entering] {
  animation: formosaic-readonly-fade var(--formosaic-animation-duration) var(--formosaic-animation-easing);
}

@keyframes formosaic-readonly-fade {
  from { opacity: 0.6; }
  to { opacity: 1; }
}
```

- [ ] **Step 6: Add label pulse animation**

```css
/* ─── Label change pulse ─── */
.formosaic-field-container[data-label-changing] {
  animation: formosaic-label-pulse calc(var(--formosaic-animation-duration) * 2) var(--formosaic-animation-easing);
}

@keyframes formosaic-label-pulse {
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
}
```

- [ ] **Step 7: Add dropdown option highlight animation**

```css
/* ─── Dropdown option change highlight ─── */
.formosaic-field-container[data-options-changed] {
  animation: formosaic-options-flash calc(var(--formosaic-animation-duration) * 2) var(--formosaic-animation-easing);
}

@keyframes formosaic-options-flash {
  from { background-color: var(--formosaic-highlight-color); }
  to { background-color: transparent; }
}
```

- [ ] **Step 8: Add reduced motion and disabled overrides**

```css
/* ─── Reduced motion ─── */
@media (prefers-reduced-motion: reduce) {
  :root {
    --formosaic-animation-duration: 0ms;
  }
}

/* ─── Animations disabled via settings ─── */
[data-formosaic-no-animations] {
  --formosaic-animation-duration: 0ms;
}
```

- [ ] **Step 9: Verify build**

Run: `npm run build:core`
Expected: Clean build.

- [ ] **Step 10: Commit**

```bash
git add packages/core/src/styles.css
git commit -m "feat(core): add animation CSS for field state changes"
```

---

### Task 3: Add animation wrapper to `RenderField.tsx`

This is the largest task — the two-phase state machine for show/hide, the animation wrapper DOM, and the change detection refs.

**Files:**
- Modify: `packages/core/src/components/RenderField.tsx`

- [ ] **Step 1: Add state and refs for the two-phase state machine**

After the existing `previousValueRef` (line 57), add:

```typescript
  // Animation: two-phase show/hide state machine
  const effectivelyHidden = hidden || (isCreate && hideOnCreate);
  const [shouldRender, setShouldRender] = React.useState(!effectivelyHidden);
  const [isExiting, setIsExiting] = React.useState(false);
  const isFirstRender = React.useRef(true);
  const fallbackTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animation: change detection refs (all initialized to undefined sentinel to skip initial render)
  const prevOptionsRef = React.useRef<IOption[] | undefined>(undefined);
  const prevLabelRef = React.useRef<string | undefined>(undefined);
  const prevReadOnlyRef = React.useRef<boolean | undefined>(undefined);
  const [optionsChanged, setOptionsChanged] = React.useState(false);
  const [labelChanging, setLabelChanging] = React.useState(false);
  const [readOnlyEntering, setReadOnlyEntering] = React.useState(false);
```

- [ ] **Step 2: Add the hidden watcher effect**

After the state/ref declarations, add:

```typescript
  // Effect: watch hidden prop for show/hide transitions
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (effectivelyHidden && shouldRender) {
      // Start exit animation
      setIsExiting(true);
      // Fallback: force unmount if transitionend doesn't fire
      fallbackTimerRef.current = setTimeout(() => {
        setShouldRender(false);
        setIsExiting(false);
      }, 300); // ~2x animation duration
    } else if (!effectivelyHidden && !shouldRender) {
      // Show: mount the field, CSS @starting-style handles entry
      setShouldRender(true);
      setIsExiting(false);
    } else if (!effectivelyHidden && isExiting) {
      // Rapid toggle: cancel exit
      setIsExiting(false);
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
    }
  }, [effectivelyHidden]);

  // Cleanup fallback timer on unmount
  React.useEffect(() => {
    return () => {
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
      }
    };
  }, []);
```

- [ ] **Step 3: Add the transitionend handler**

```typescript
  const handleTransitionEnd = React.useCallback((e: React.TransitionEvent) => {
    // Only respond to our own grid wrapper's transition, not bubbled child events
    if (e.target !== e.currentTarget) return;
    if (isExiting) {
      setShouldRender(false);
      setIsExiting(false);
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
    }
  }, [isExiting]);
```

- [ ] **Step 4: Add change detection effects for options, label, readOnly**

```typescript
  // Effect: detect options changes
  React.useEffect(() => {
    const prev = prevOptionsRef.current;
    prevOptionsRef.current = options;
    if (prev === undefined) return; // skip initial
    const prevValues = prev?.map(o => o.value) ?? [];
    const currValues = options?.map(o => o.value) ?? [];
    if (prevValues.length !== currValues.length || prevValues.some((v, i) => v !== currValues[i])) {
      setOptionsChanged(true);
    }
  }, [options]);

  // Effect: detect label changes
  React.useEffect(() => {
    const prev = prevLabelRef.current;
    prevLabelRef.current = label;
    if (prev === undefined) return; // skip initial
    if (prev !== label) {
      setLabelChanging(true);
    }
  }, [label]);

  // Effect: detect readOnly changes (uses undefined sentinel to skip initial render, same as options/label)
  React.useEffect(() => {
    const isReadOnly = readOnly || (isDisabled && (isNull(skipLayoutReadOnly) || (!isNull(skipLayoutReadOnly) && !skipLayoutReadOnly)));
    const prev = prevReadOnlyRef.current;
    prevReadOnlyRef.current = isReadOnly;
    if (prev === undefined) return; // skip initial render
    if (prev !== isReadOnly) {
      setReadOnlyEntering(true);
    }
  }, [readOnly, isDisabled, skipLayoutReadOnly]);
```

- [ ] **Step 5: Add animation-end handlers for change detection attributes**

```typescript
  // Clear change-detection flags after animation
  const handleContainerAnimationEnd = React.useCallback(() => {
    setOptionsChanged(false);
    setLabelChanging(false);
    setReadOnlyEntering(false);
  }, []);
```

- [ ] **Step 6: Modify the `useMemo` block**

Remove the early return for hidden (line 69: `if ((isCreate && hideOnCreate) || hidden) return <></>;`).

Remove `hidden`, `isCreate`, and `hideOnCreate` from the `useMemo` dependency array (line 157-161). These are now handled by the `shouldRender` state outside the memo.

The `useMemo` dependency array becomes:
```typescript
  }, [type, required, readOnly, disabled, options, optionsLoading, softHidden, renderLabel, renderError, renderStatus,
    fieldName, fieldNameConst, label, validate, config, description, placeholder, helpText,
    isManualSave, skipLayoutReadOnly,
    testId,
    injectedFields, analytics, control, getValues, setFieldValue]);
```

- [ ] **Step 7: Wrap the return in the animation wrapper**

**Note on `data-first-render`:** This attribute is read from `isFirstRender.current` (a ref, not state). Changing the ref to `false` in the effect does NOT trigger a re-render, so the attribute persists on the DOM until the next re-render (e.g., a rule fires). This is intentional — the CSS rule `.formosaic-field-animate[data-first-render] { transition: none; }` suppresses the `@starting-style` entry animation on first paint. After that, the next re-render naturally drops the attribute since `isFirstRender.current` is `false`, and any subsequent show (via rule) correctly animates.

Replace the current return (line 163: `return FieldComponent;`) with:

```typescript
  if (!shouldRender) return <></>;

  return (
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
          onAnimationEnd={handleContainerAnimationEnd}
        >
          {FieldComponent}
        </div>
      </div>
    </div>
  );
```

- [ ] **Step 8: Verify build**

Run: `npm run build:core`
Expected: Clean build.

- [ ] **Step 9: Run existing tests**

Run: `npm run test -- --run`
Expected: All existing tests pass. The animation wrapper adds new DOM nodes around field output, which may cause some snapshot or query tests to need adjustment. If tests fail due to new wrapper divs, fix them before continuing.

- [ ] **Step 10: Commit**

```bash
git add packages/core/src/components/RenderField.tsx
git commit -m "feat(core): add two-phase animation state machine to RenderField"
```

---

### Task 4: Add animation CSS classes to `FieldWrapper.tsx`

**Files:**
- Modify: `packages/core/src/components/FieldWrapper.tsx`

- [ ] **Step 1: Add `formosaic-required-indicator` class to the required asterisk**

On line 47, the required indicator `<span>` has `className="required-indicator"`. Change to:

```tsx
<span className="required-indicator formosaic-required-indicator" aria-hidden="true" style={{ color: "var(--formosaic-required-color, #d13438)" }}> *</span>
```

- [ ] **Step 2: Add `formosaic-error-animate` class to the error/status message container**

On line 57, the message `<div>` has `className="message"`. Change to:

```tsx
<div className="message formosaic-error-animate">
```

- [ ] **Step 3: Verify build**

Run: `npm run build:core`
Expected: Clean build.

- [ ] **Step 4: Commit**

```bash
git add packages/core/src/components/FieldWrapper.tsx
git commit -m "feat(core): add animation CSS classes to FieldWrapper"
```

---

### Task 5: Wire `data-formosaic-no-animations` in `Formosaic.tsx`

**Files:**
- Modify: `packages/core/src/components/Formosaic.tsx:358`

- [ ] **Step 1: Read `animations` from settings and add data attribute**

On line 358, the form wrapper div is:
```tsx
<div className="formosaic-form-wrapper">
```

Change to:
```tsx
<div className="formosaic-form-wrapper" data-formosaic-no-animations={formConfig?.settings?.animations === false || undefined}>
```

This only sets the attribute when `animations` is explicitly `false`. When `undefined` (the default) or `true`, no attribute is set and animations are enabled.

- [ ] **Step 2: Verify build**

Run: `npm run build:core`
Expected: Clean build.

- [ ] **Step 3: Commit**

```bash
git add packages/core/src/components/Formosaic.tsx
git commit -m "feat(core): wire animations disable attribute on form wrapper"
```

---

### Task 6: Write unit tests

**Files:**
- Create: `packages/core/src/__tests__/components/FieldAnimations.test.tsx`

These tests run in jsdom where CSS transitions don't fire, so we test the attribute/state behavior and rely on the fallback timeout for unmount.

- [ ] **Step 1: Write test file with test setup**

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import RenderField from "../../components/RenderField";
import { FieldWrapper } from "../../components/FieldWrapper";
import { InjectedFieldProvider } from "../../providers/InjectedFieldProvider";
import { IOption } from "../../types/IOption";

// Minimal test field component
const TestInput: React.FC<{ value?: string; fieldName?: string }> = ({ value, fieldName }) => (
  <input data-testid={`field-${fieldName}`} defaultValue={value || ""} />
);

// Wrapper providing react-hook-form + injected fields
const TestWrapper: React.FC<React.PropsWithChildren<{ defaultValues?: Record<string, unknown> }>> = ({ children, defaultValues }) => {
  const methods = useForm({ defaultValues: defaultValues || { testField: "" } });
  const fields = { Textbox: <TestInput /> };
  return (
    <InjectedFieldProvider injectedFields={fields}>
      <FormProvider {...methods}>{children}</FormProvider>
    </InjectedFieldProvider>
  );
};

const defaultProps = {
  fieldName: "testField",
  type: "Textbox",
  label: "Test Label",
  setFieldValue: vi.fn(),
};
```

- [ ] **Step 2: Write test — field sets data-exiting when hidden flips to true**

```typescript
describe("Field show/hide animation", () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it("sets data-exiting attribute when hidden changes to true", () => {
    const { rerender, container } = render(
      <TestWrapper>
        <RenderField {...defaultProps} hidden={false} />
      </TestWrapper>
    );

    const wrapper = container.querySelector(".formosaic-field-animate");
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).not.toHaveAttribute("data-exiting");

    rerender(
      <TestWrapper>
        <RenderField {...defaultProps} hidden={true} />
      </TestWrapper>
    );

    const exitingWrapper = container.querySelector(".formosaic-field-animate");
    expect(exitingWrapper).toHaveAttribute("data-exiting");
  });

  it("unmounts field after fallback timeout when transitionend does not fire", async () => {
    const { rerender, container } = render(
      <TestWrapper>
        <RenderField {...defaultProps} hidden={false} />
      </TestWrapper>
    );

    expect(container.querySelector(".formosaic-field-animate")).toBeInTheDocument();

    rerender(
      <TestWrapper>
        <RenderField {...defaultProps} hidden={true} />
      </TestWrapper>
    );

    // Field still in DOM during exit animation
    expect(container.querySelector(".formosaic-field-animate")).toBeInTheDocument();

    // After fallback timeout, field should be unmounted
    act(() => { vi.advanceTimersByTime(350); });

    expect(container.querySelector(".formosaic-field-animate")).not.toBeInTheDocument();
  });

  it("does not animate on initial render (data-first-render present)", () => {
    const { container } = render(
      <TestWrapper>
        <RenderField {...defaultProps} hidden={false} />
      </TestWrapper>
    );

    const wrapper = container.querySelector(".formosaic-field-animate");
    expect(wrapper).toHaveAttribute("data-first-render");
  });

  it("does not render when hidden is true on initial mount", () => {
    const { container } = render(
      <TestWrapper>
        <RenderField {...defaultProps} hidden={true} />
      </TestWrapper>
    );

    expect(container.querySelector(".formosaic-field-animate")).not.toBeInTheDocument();
  });

  it("handles rapid toggle without getting stuck", () => {
    const { rerender, container } = render(
      <TestWrapper>
        <RenderField {...defaultProps} hidden={false} />
      </TestWrapper>
    );

    // Hide
    rerender(
      <TestWrapper>
        <RenderField {...defaultProps} hidden={true} />
      </TestWrapper>
    );
    expect(container.querySelector(".formosaic-field-animate")).toHaveAttribute("data-exiting");

    // Show again before exit completes
    rerender(
      <TestWrapper>
        <RenderField {...defaultProps} hidden={false} />
      </TestWrapper>
    );
    const wrapper = container.querySelector(".formosaic-field-animate");
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).not.toHaveAttribute("data-exiting");
  });
});
```

- [ ] **Step 3: Write test — softHidden does not trigger animation**

```typescript
describe("softHidden does not trigger animation", () => {
  it("does not set data-exiting when softHidden changes, and field content is hidden", () => {
    const { rerender, container } = render(
      <TestWrapper>
        <RenderField {...defaultProps} hidden={false} softHidden={false} />
      </TestWrapper>
    );

    // Field should be visible initially
    expect(container.querySelector(".formosaic-field-animate")).toBeInTheDocument();
    expect(screen.getByTestId("field-testField")).toBeInTheDocument();

    rerender(
      <TestWrapper>
        <RenderField {...defaultProps} hidden={false} softHidden={true} />
      </TestWrapper>
    );

    // Animation wrapper still present (softHidden handled inside useMemo, not by shouldRender)
    const wrapper = container.querySelector(".formosaic-field-animate");
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).not.toHaveAttribute("data-exiting");

    // But the field input should NOT be rendered (softHidden returns <></> inside Controller)
    expect(screen.queryByTestId("field-testField")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Write test — options change sets data-options-changed**

```typescript
describe("Change detection animations", () => {
  it("sets data-options-changed when options change", () => {
    const options1: IOption[] = [{ value: "a", label: "A" }, { value: "b", label: "B" }];
    const options2: IOption[] = [{ value: "a", label: "A" }, { value: "c", label: "C" }];

    const { rerender, container } = render(
      <TestWrapper>
        <RenderField {...defaultProps} options={options1} />
      </TestWrapper>
    );

    rerender(
      <TestWrapper>
        <RenderField {...defaultProps} options={options2} />
      </TestWrapper>
    );

    const fieldContainer = container.querySelector(".formosaic-field-container");
    expect(fieldContainer).toHaveAttribute("data-options-changed");
  });

  it("sets data-label-changing when label changes", () => {
    const { rerender, container } = render(
      <TestWrapper>
        <RenderField {...defaultProps} label="Original" />
      </TestWrapper>
    );

    rerender(
      <TestWrapper>
        <RenderField {...defaultProps} label="Changed" />
      </TestWrapper>
    );

    const fieldContainer = container.querySelector(".formosaic-field-container");
    expect(fieldContainer).toHaveAttribute("data-label-changing");
  });
});
```

- [ ] **Step 5: Write test — FieldWrapper CSS classes present**

```typescript
describe("FieldWrapper animation classes", () => {
  it("required indicator has formosaic-required-indicator class", () => {
    render(
      <FieldWrapper id="testField" label="Test" required={true}>
        <input />
      </FieldWrapper>
    );

    const indicator = document.querySelector(".formosaic-required-indicator");
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveTextContent("*");
  });

  it("error message container has formosaic-error-animate class", () => {
    render(
      <FieldWrapper id="testField" label="Test" error={{ type: "required", message: "Required" }}>
        <input />
      </FieldWrapper>
    );

    const messageContainer = document.querySelector(".formosaic-error-animate");
    expect(messageContainer).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Write test — Formosaic sets data-formosaic-no-animations when animations: false**

```typescript
import { Formosaic } from "../../components/Formosaic";
import { RulesEngineProvider } from "../../providers/RulesEngineProvider";

describe("Formosaic animations setting", () => {
  const minimalConfig = {
    version: 2 as const,
    fields: { name: { type: "Textbox", label: "Name" } },
  };

  it("sets data-formosaic-no-animations when animations is false", () => {
    const { container } = render(
      <RulesEngineProvider>
        <InjectedFieldProvider injectedFields={{ Textbox: <TestInput /> }}>
          <Formosaic formConfig={{ ...minimalConfig, settings: { animations: false } }} configName="test" />
        </InjectedFieldProvider>
      </RulesEngineProvider>
    );

    const wrapper = container.querySelector(".formosaic-form-wrapper");
    expect(wrapper).toHaveAttribute("data-formosaic-no-animations");
  });

  it("does not set data-formosaic-no-animations when animations is undefined (default)", () => {
    const { container } = render(
      <RulesEngineProvider>
        <InjectedFieldProvider injectedFields={{ Textbox: <TestInput /> }}>
          <Formosaic formConfig={minimalConfig} configName="test" />
        </InjectedFieldProvider>
      </RulesEngineProvider>
    );

    const wrapper = container.querySelector(".formosaic-form-wrapper");
    expect(wrapper).not.toHaveAttribute("data-formosaic-no-animations");
  });
});
```

- [ ] **Step 7: Run tests**

Run: `npm run test -- --run packages/core/src/__tests__/components/FieldAnimations.test.tsx`
Expected: All tests pass.

- [ ] **Step 8: Run full test suite to check for regressions**

Run: `npm run test -- --run`
Expected: All tests pass. If existing tests break due to the new wrapper divs in `RenderField`, fix the failing tests — likely DOM queries that expect a specific parent/child structure.

- [ ] **Step 9: Commit**

```bash
git add packages/core/src/__tests__/components/FieldAnimations.test.tsx
git commit -m "test(core): add unit tests for field animation behaviors"
```

---

### Task 7: Fix existing E2E helpers and add animation E2E tests

The animation exit delay means fields stay in the DOM briefly after being hidden. The existing `expectFieldHidden` checks `toBeHidden()` on the input element, which may fail because the input is still in the DOM (just collapsing via opacity/grid transition). We need to update the page object to wait for the animation wrapper to be fully removed.

**Files:**
- Modify: `e2e/page-objects/form.page.ts:133-138`
- Modify: `e2e/tests/rules.spec.ts`

- [ ] **Step 1: Update `expectFieldHidden` to account for exit animation**

In `e2e/page-objects/form.page.ts`, line 133-138, the current implementation is:

```typescript
  async expectFieldHidden(fieldName: string) {
    const locator = this.page.locator(
      `[id="${fieldName}"], [name="${fieldName}"]`
    ).first();
    await expect(locator).toBeHidden();
  }
```

Change to:

```typescript
  async expectFieldHidden(fieldName: string) {
    // Wait for the field to be fully removed from the DOM (accounts for exit animation)
    const locator = this.page.locator(
      `[id="${fieldName}"], [name="${fieldName}"]`
    ).first();
    await expect(locator).toHaveCount(0, { timeout: 1000 });
  }
```

The `toHaveCount(0)` waits for the element to be completely absent from the DOM, which happens after the exit animation completes and the field unmounts. The 1000ms timeout provides ample margin for the ~150ms animation + any rendering delay.

- [ ] **Step 2: Run existing E2E tests to verify the fix**

Run: `npm run test:e2e`
Expected: All existing tests pass with the updated `expectFieldHidden`.

- [ ] **Step 3: Add animation-specific E2E tests**

Add a new `describe` block at the end of `e2e/tests/rules.spec.ts`:

```typescript
test.describe("Field animation behavior", () => {
  test("field animates in when shown by rule", async ({ page }) => {
    const form = new FormPage(page);
    await form.goto("/rules");

    // Priority is hidden by default
    await form.expectFieldHidden("priority");

    // Trigger show rule
    await form.selectDropdown("status", "Active");

    // The field should become visible (animation wrapper present)
    const wrapper = page.locator(".formosaic-field-animate").filter({ has: page.locator('[data-testid*="priority"]') });
    await expect(wrapper).toBeVisible();
    await expect(wrapper).not.toHaveAttribute("data-exiting");
  });

  test("field animates out when hidden by rule", async ({ page }) => {
    const form = new FormPage(page);
    await form.goto("/rules");

    // Show the field first
    await form.selectDropdown("status", "Active");
    await form.expectFieldVisible("priority");

    // Trigger hide rule
    await form.selectDropdown("status", "Inactive");

    // After animation duration, field should be gone
    const wrapper = page.locator(".formosaic-field-animate").filter({ has: page.locator('[data-testid*="priority"]') });
    await expect(wrapper).toHaveCount(0, { timeout: 1000 });
  });
});
```

- [ ] **Step 4: Run E2E tests**

Run: `npm run test:e2e`
Expected: All tests pass including the new animation tests.

- [ ] **Step 5: Commit**

```bash
git add e2e/page-objects/form.page.ts e2e/tests/rules.spec.ts
git commit -m "test(e2e): update expectFieldHidden for animations, add animation tests"
```

---

### Task 8: Final verification

- [ ] **Step 1: Full build**

Run: `npm run build`
Expected: All packages build cleanly.

- [ ] **Step 2: Full test suite**

Run: `npm run test -- --run`
Expected: All tests pass.

- [ ] **Step 3: E2E tests**

Run: `npm run test:e2e`
Expected: All tests pass.

- [ ] **Step 4: Manual verification in Storybook**

Run: `npm run storybook`
Navigate to a story with rules (e.g., show/hide rules). Verify:
- Fields animate in/out smoothly when rules fire
- Required indicator fades in/out
- Error messages slide in
- No animation on initial page load
- Animations are subtle and fast (~150ms)

- [ ] **Step 5: Commit any final fixes**

If there are any remaining modified files from fixes in previous steps, stage them explicitly (avoid `git add -A`):

```bash
git add packages/core/src/ e2e/
git commit -m "feat(core): field animations for business rule state changes

Add CSS-based animations when rules change field visibility, required
status, errors, read-only state, labels, and dropdown options.

- Show/hide: grid-template-rows collapse + opacity fade (~150ms)
- Required indicator: opacity fade
- Error messages: slide-in with translateY
- Read-only toggle: dim-and-restore crossfade
- Label changes: opacity pulse
- Dropdown options: background-color highlight flash

On by default, disabled via settings.animations: false.
Respects prefers-reduced-motion. Customizable via CSS custom properties.
No adapter changes required."
```
