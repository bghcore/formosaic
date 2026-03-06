# SSR / Next.js Integration Guide

This guide covers server-side rendering (SSR) compatibility for `@form-engine/core` and the UI adapter packages (`@form-engine/fluent`, `@form-engine/mui`).

## SSR Compatibility Status

The core library is **SSR-safe** as of v2.0.x. All browser-only API access is guarded behind `typeof` checks or confined to `useEffect` callbacks (which only run on the client).

| Module | SSR-Safe | Notes |
|---|---|---|
| Rules engine (`RuleEngine`, `ConditionEvaluator`) | Yes | Pure logic, no DOM access |
| `ExpressionEngine` | Yes | Uses `new Function()` which works in Node.js. May fail in CSP-strict environments. |
| `FormEngine` | Yes | `document` access for focus management is guarded |
| `ConfirmInputsModal` | Yes | `document.activeElement` access is inside `useEffect` (client-only) |
| `WizardForm` | Yes | No browser APIs |
| `FormDevTools` | Yes | Renders only when `enabled` prop is true; no browser APIs |
| `FieldWrapper`, `FormFields`, `RenderField` | Yes | No browser APIs |
| `useBeforeUnload` | Yes | `window` access guarded with `typeof window` check |
| `useDraftPersistence` | Yes | `localStorage` access guarded; returns safe defaults during SSR |
| `formStateSerialization` | Yes | Pure JSON transform, no browser APIs |
| `ValidationRegistry` | Yes | Pure logic |
| `ValueFunctionRegistry` | Yes | Pure logic (custom value functions may access browser APIs) |
| `LocaleRegistry` | Yes | Module-scoped state, no browser APIs |
| `createLazyFieldRegistry` | Partial | Uses `React.lazy()` + `Suspense`. Works with React 19 SSR streaming. Requires `Suspense` boundary for React 18 SSR. |
| `jsonSchemaImport` / `zodSchemaImport` | Yes | Pure transforms |

## Next.js App Router Setup

With the App Router (React Server Components), form components must be rendered as **Client Components** since they use hooks and interactivity.

### Basic Setup

```tsx
// app/components/MyForm.tsx
"use client";

import {
  FormEngine,
  RulesEngineProvider,
  InjectedFieldProvider,
} from "@form-engine/core";
import { fluentFieldRegistry } from "@form-engine/fluent";

const formConfig = {
  version: 2 as const,
  fields: {
    name: { type: "Textbox", label: "Name", required: true },
    email: { type: "Textbox", label: "Email", validate: [{ name: "email" }] },
  },
  fieldOrder: ["name", "email"],
};

export function MyForm({ defaultValues }: { defaultValues: Record<string, unknown> }) {
  return (
    <RulesEngineProvider>
      <InjectedFieldProvider fieldComponents={fluentFieldRegistry}>
        <FormEngine
          configName="my-form"
          defaultValues={defaultValues}
          formConfig={formConfig}
        />
      </InjectedFieldProvider>
    </RulesEngineProvider>
  );
}
```

```tsx
// app/page.tsx (Server Component)
import { MyForm } from "./components/MyForm";

export default async function Page() {
  // You can fetch data server-side and pass as props
  const data = await fetchEntityData();

  return (
    <main>
      <h1>Edit Record</h1>
      <MyForm defaultValues={data} />
    </main>
  );
}
```

### Key Rules for App Router

1. **Add `"use client"` to the file containing your form.** The form component tree uses hooks (`useForm`, `useReducer`, `useEffect`, etc.) so it must be a Client Component.

2. **You can pass server-fetched data as props.** The `"use client"` boundary does not prevent receiving props from a Server Component parent -- serializable data crosses the boundary just fine.

3. **Do not import form components in Server Components directly.** Wrap them in a Client Component file with `"use client"`.

### With Draft Persistence

```tsx
"use client";

import { FormEngine, useDraftPersistence, RulesEngineProvider, InjectedFieldProvider } from "@form-engine/core";
import { fluentFieldRegistry } from "@form-engine/fluent";

export function MyFormWithDrafts({ defaultValues }: { defaultValues: Record<string, unknown> }) {
  const { recoverDraft, clearDraft, hasDraft } = useDraftPersistence({
    formId: "my-form",
    data: defaultValues,
    enabled: true, // safe in SSR -- localStorage access is guarded
  });

  const initialData = hasDraft ? (recoverDraft()?.data ?? defaultValues) : defaultValues;

  return (
    <RulesEngineProvider>
      <InjectedFieldProvider fieldComponents={fluentFieldRegistry}>
        {hasDraft && (
          <div>
            <p>You have an unsaved draft.</p>
            <button onClick={clearDraft}>Discard draft</button>
          </div>
        )}
        <FormEngine
          configName="my-form"
          defaultValues={initialData}
          formConfig={formConfig}
        />
      </InjectedFieldProvider>
    </RulesEngineProvider>
  );
}
```

`useDraftPersistence` is SSR-safe: it returns `hasDraft: false` and `recoverDraft()` returns `null` when `localStorage` is not available. No hydration mismatch occurs because the initial state is always `false`, and the `useEffect` on mount updates it client-side.

## Next.js Pages Router Setup

With the Pages Router, all components run on both server and client by default during SSR.

### Basic Setup

```tsx
// pages/edit/[id].tsx
import {
  FormEngine,
  RulesEngineProvider,
  InjectedFieldProvider,
} from "@form-engine/core";
import { fluentFieldRegistry } from "@form-engine/fluent";
import type { GetServerSideProps } from "next";

interface Props {
  entityData: Record<string, unknown>;
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const entityData = await fetchEntityById(ctx.params!.id as string);
  return { props: { entityData } };
};

export default function EditPage({ entityData }: Props) {
  return (
    <RulesEngineProvider>
      <InjectedFieldProvider fieldComponents={fluentFieldRegistry}>
        <FormEngine
          configName="edit-form"
          defaultValues={entityData}
          formConfig={formConfig}
        />
      </InjectedFieldProvider>
    </RulesEngineProvider>
  );
}
```

No special configuration is needed. The library components render correctly during SSR and hydrate on the client.

## Client-Only Components

While all components are SSR-safe, some features only activate on the client:

| Feature | Server Behavior | Client Behavior |
|---|---|---|
| `useBeforeUnload` | No-op (no `window`) | Registers `beforeunload` listener |
| `useDraftPersistence` | Returns `hasDraft: false` | Reads/writes `localStorage` |
| Focus management (`focusFirstError`) | No-op (no `document`) | Focuses first invalid field |
| `ConfirmInputsModal` (`<dialog>`) | Renders `<dialog>` element (closed) | Opens/closes via `showModal()`/`close()` |
| `createLazyFieldRegistry` | Requires `Suspense` SSR support (React 19, or React 18 with streaming) | Lazy-loads field components on demand |

## Lazy-Loading the Form (Skip SSR Entirely)

If you want to avoid SSR for the form entirely (e.g., to reduce server rendering time for complex forms), use `next/dynamic`:

```tsx
// App Router
"use client";

import dynamic from "next/dynamic";

const MyForm = dynamic(() => import("./MyForm").then(m => ({ default: m.MyForm })), {
  ssr: false,
  loading: () => <div>Loading form...</div>,
});

export function FormPage({ data }: { data: Record<string, unknown> }) {
  return <MyForm defaultValues={data} />;
}
```

```tsx
// Pages Router
import dynamic from "next/dynamic";

const MyForm = dynamic(() => import("../components/MyForm"), {
  ssr: false,
  loading: () => <div>Loading form...</div>,
});
```

This approach is useful when:
- The form is below the fold and not needed for initial paint
- The form config is very large and you want to defer evaluation
- You use `createLazyFieldRegistry` with React 18 (which lacks full Suspense SSR support)

## Common Pitfalls and Solutions

### 1. Hydration Mismatch with Draft Persistence

**Problem:** If you conditionally render based on `hasDraft` during SSR, you get a hydration mismatch because `localStorage` is not available on the server.

**Solution:** `useDraftPersistence` initializes `hasDraft` as `false` and only updates it in `useEffect` (client-only). This avoids mismatches. Do not attempt to read `localStorage` during render.

```tsx
// WRONG - will cause hydration mismatch
const hasDraft = typeof localStorage !== "undefined" && localStorage.getItem("draft_form") !== null;

// CORRECT - useDraftPersistence handles this safely
const { hasDraft } = useDraftPersistence({ formId: "form", data: {} });
```

### 2. Custom Value Functions Using Browser APIs

**Problem:** If you register a custom value function (via `registerValueFunctions()`) that accesses `window`, `document`, or other browser APIs, it will throw during SSR when a computed value is evaluated.

**Solution:** Guard browser API access in your custom value functions:

```tsx
registerValueFunctions({
  getScreenWidth: () => {
    if (typeof window === "undefined") return 1024; // sensible default for SSR
    return window.innerWidth;
  },
});
```

### 3. Custom Validators Using Fetch

**Problem:** Async validators that call browser-only `fetch` (e.g., with `credentials: "include"`) may behave differently during SSR.

**Solution:** Async validators only run in response to user interaction (field changes), which only happens on the client. They are not called during SSR rendering. No action needed.

### 4. ExpressionEngine and CSP

**Problem:** `ExpressionEngine` uses `new Function()` to evaluate computed expressions. This works fine in Node.js SSR but may be blocked by Content Security Policy (CSP) headers that disallow `unsafe-eval`.

**Solution:** If your CSP policy blocks `eval`/`new Function()`, compute values outside the expression engine and set them via `setValue()` instead:

```tsx
// Instead of: computedValue: "$values.qty * $values.price"
// Compute manually:
const total = watch("qty") * watch("price");
useEffect(() => { setValue("total", total); }, [total]);
```

### 5. Fluent UI / MUI SSR Setup

Both Fluent UI v9 and MUI v5/v6 have their own SSR requirements:

**Fluent UI v9:**
```tsx
// App Router
"use client";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import { SSRProvider } from "@fluentui/react-components"; // Only needed for React 18

export function FluentFormWrapper({ children }) {
  return (
    <FluentProvider theme={webLightTheme}>
      {children}
    </FluentProvider>
  );
}
```

**MUI v5/v6:**
MUI requires emotion cache setup for SSR. See [MUI SSR docs](https://mui.com/material-ui/integrations/nextjs/) for the full setup with `@emotion/cache` and `CacheProvider`.

### 6. React.lazy and SSR

**Problem:** `createLazyFieldRegistry` uses `React.lazy()`, which does not work with `renderToString` in React 18.

**Solution:**
- **React 19:** Supports `Suspense` during SSR with streaming (`renderToPipeableStream`). No changes needed.
- **React 18 with streaming:** Use `renderToPipeableStream` instead of `renderToString`. The `Suspense` fallback will render on the server.
- **React 18 without streaming:** Either skip SSR for the form (use `next/dynamic` with `ssr: false`), or use the standard (non-lazy) field registry during SSR.

## Testing SSR Compatibility

To verify your form renders without errors during SSR, you can test with `renderToString`:

```tsx
import { renderToString } from "react-dom/server";
import { RulesEngineProvider, InjectedFieldProvider, FormEngine } from "@form-engine/core";
import { fluentFieldRegistry } from "@form-engine/fluent";

test("form renders without errors during SSR", () => {
  const html = renderToString(
    <RulesEngineProvider>
      <InjectedFieldProvider fieldComponents={fluentFieldRegistry}>
        <FormEngine
          configName="test"
          defaultValues={{ name: "" }}
          formConfig={{
            version: 2,
            fields: { name: { type: "Textbox", label: "Name" } },
            fieldOrder: ["name"],
          }}
        />
      </InjectedFieldProvider>
    </RulesEngineProvider>
  );
  expect(html).toContain("Name");
});
```

## Summary

- All core components are SSR-safe. No special configuration is needed.
- Use `"use client"` in Next.js App Router for files containing form components.
- `useDraftPersistence` and `useBeforeUnload` gracefully degrade during SSR.
- Use `next/dynamic` with `ssr: false` if you want to skip SSR entirely for the form.
- Guard browser APIs in custom value functions and validators.
- For `createLazyFieldRegistry`, use React 19 or streaming SSR with React 18.
