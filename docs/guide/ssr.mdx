---
title: SSR / Next.js Integration Guide
---

# SSR / Next.js Integration Guide

This guide covers server-side rendering (SSR) compatibility for `@formosaic/core` and the UI adapter packages.

## SSR Compatibility Status

The core library is **SSR-safe**. All browser-only API access is guarded behind `typeof` checks or confined to `useEffect` callbacks (which only run on the client).

| Module | SSR-Safe | Notes |
|---|---|---|
| Rules engine | Yes | Pure logic, no DOM access |
| `ExpressionEngine` | Yes | Uses `new Function()` which works in Node.js |
| `Formosaic` | Yes | `document` access is guarded |
| `ConfirmInputsModal` | Yes | `document.activeElement` is inside `useEffect` |
| `WizardForm` | Yes | No browser APIs |
| `useBeforeUnload` | Yes | `window` access guarded with `typeof` check |
| `useDraftPersistence` | Yes | `localStorage` access guarded |
| `formStateSerialization` | Yes | Pure JSON transform |
| `createLazyFieldRegistry` | Partial | Requires `Suspense` boundary for React 18 SSR |

## Next.js App Router Setup

With the App Router (React Server Components), form components must be rendered as **Client Components** since they use hooks and interactivity.

```tsx
// app/components/MyForm.tsx
"use client";

import {
  Formosaic,
  RulesEngineProvider,
  InjectedFieldProvider,
} from "@formosaic/core";
import { createFluentFieldRegistry } from "@formosaic/fluent";

export function MyForm({ defaultValues }: { defaultValues: Record<string, unknown> }) {
  return (
    <RulesEngineProvider>
      <InjectedFieldProvider injectedFields={createFluentFieldRegistry()}>
        <Formosaic
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
  const data = await fetchEntityData();
  return <MyForm defaultValues={data} />;
}
```

### Key Rules for App Router

1. Add `"use client"` to the file containing your form.
2. You can pass server-fetched data as props across the client boundary.
3. Do not import form components in Server Components directly.

## Lazy-Loading the Form

If you want to skip SSR for the form entirely, use `next/dynamic`:

```tsx
"use client";
import dynamic from "next/dynamic";

const MyForm = dynamic(() => import("./MyForm").then(m => ({ default: m.MyForm })), {
  ssr: false,
  loading: () => <div>Loading form...</div>,
});
```

## Common Pitfalls

### Hydration Mismatch with Draft Persistence

`useDraftPersistence` initializes `hasDraft` as `false` and only updates it in `useEffect` (client-only). This avoids hydration mismatches.

### Custom Value Functions Using Browser APIs

Guard browser API access in your custom value functions:

```tsx
registerValueFunctions({
  getScreenWidth: () => {
    if (typeof window === "undefined") return 1024;
    return window.innerWidth;
  },
});
```

### ExpressionEngine and CSP

`ExpressionEngine` uses `new Function()`. This may be blocked by CSP headers that disallow `unsafe-eval`. Use `setValue()` as a workaround.

## Summary

- All core components are SSR-safe. No special configuration is needed.
- Use `"use client"` in Next.js App Router for files containing form components.
- `useDraftPersistence` and `useBeforeUnload` gracefully degrade during SSR.
- Use `next/dynamic` with `ssr: false` if you want to skip SSR entirely.
- Guard browser APIs in custom value functions and validators.
