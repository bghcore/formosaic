---
title: Date Policy
---

# Date Policy

This document defines the canonical date handling contract for all Formosaic adapter packages.

## Core Contract

All adapters MUST store date values as **ISO 8601 strings (UTC)** in react-hook-form state. Adapter-specific date objects are created at render time from the ISO string and converted back to ISO on change. This conversion happens at the UI component boundary, never deeper in the form state layer.

```
Form State (ISO string) --> Adapter boundary --> UI Library Date Object --> Rendered Component
                        <-- Adapter boundary <-- UI Library Date Object <-- User Interaction
```

## Storage Format

- **Format:** ISO 8601 UTC string
- **Example:** `"2024-01-15T00:00:00.000Z"`
- **Empty value:** `null` (not `undefined`, not `""`)
- **Clearing a date:** calls `setFieldValue(fieldName, null)`

## Parsing

| Context | Method |
|---|---|
| ISO string to native Date | `new Date(isoString)` |
| ISO string to dayjs | `dayjs(isoString)` |
| Native Date to ISO string | `date.toISOString()` |
| dayjs to ISO string | `dayjsObj.toISOString()` |

All parsing assumes the input is a valid ISO 8601 string. Invalid strings should be checked with `isNaN(date.getTime())` for native Date or `dayjsObj.isValid()` for dayjs.

## Display Formatting

The shared `formatDateTime()` utility from `@formosaic/core/adapter-utils` handles display formatting using `Intl.DateTimeFormat`:

```typescript
// Date only (e.g., "Jan 15, 2024")
formatDateTime(isoString, { hideTimestamp: true });

// Date + time (e.g., "Jan 15, 2024, 02:30 PM")
formatDateTime(isoString);
```

The function respects the user's locale via `Intl.DateTimeFormat` (no explicit locale parameter -- uses the browser/runtime default).

## Adapter Divergence Table

| Adapter | Date Library | DateControl Component | Conversion Pattern |
|---|---|---|---|
| **fluent** | Native `Date` | Fluent UI DatePicker | `new Date(iso)` at render, `.toISOString()` on change |
| **mui** | Native `Date` | MUI DatePicker | `new Date(iso)` at render, `.toISOString()` on change |
| **headless** | Native `Date` | `<input type="date">` | `new Date(iso).toISOString().split("T")[0]` for input value, `new Date(inputValue).toISOString()` on change |
| **antd** | dayjs | Ant Design `DatePicker` | `dayjs(iso)` at render, `dayjsObj.toISOString()` on change |
| **chakra** | Native `Date` | Chakra `Input` (`type="date"`) | Same as headless: HTML date input with ISO conversion |
| **mantine** | Native `Date` | Mantine `DateInput` | `new Date(iso)` at render, `.toISOString()` on change |
| **atlaskit** (planned) | ISO strings | Atlaskit DatePicker | Native ISO string support -- minimal conversion needed |
| **base-web** (planned) | Native `Date` | Base Web DatePicker | `new Date(iso)` at render, `.toISOString()` on change |
| **heroui** (planned) | `@internationalized/date` | HeroUI DatePicker | `parseDate(iso.split("T")[0])` at render, `.toString()` + `T00:00:00.000Z` on change |

## Date Field Types

### DateControl

- **Value:** ISO 8601 string or `null`
- **Granularity:** Date only (time component is typically `T00:00:00.000Z`)
- **ReadOnly display:** `formatDateTime(value, { hideTimestamp: true })` (e.g., "Jan 15, 2024")

### DateTime (Tier 2)

- **Value:** ISO 8601 string or `null`
- **Granularity:** Date + time
- **Config:** `IDateTimeConfig { minDateTime?: string; maxDateTime?: string }`
- **ReadOnly display:** `formatDateTime(value)` (e.g., "Jan 15, 2024, 02:30 PM")

### DateRange (Tier 2)

- **Value:** `IDateRangeValue { start: string; end: string }` or `null`
- **Granularity:** Date only per endpoint
- **Config:** `IDateRangeConfig { minDate?: string; maxDate?: string }`
- **ReadOnly display:** `formatDateRange(value)` (e.g., "2024-01-15 -- 2024-01-31")

## Adapter Boundary Rules

1. **Store ISO, display native.** Form state always contains ISO strings. Adapters create library-specific date objects only for passing to UI components.

2. **Convert at the boundary.** The conversion from ISO string to library date object (and back) must happen in the field component's render and onChange handler, respectively. Never in helpers, reducers, or form state logic.

3. **Null means empty.** When a date is cleared, store `null` -- not `undefined`, not `""`, not `"Invalid Date"`.

4. **Validate before storing.** Before calling `setFieldValue`, verify the date is valid (`!isNaN(date.getTime())` or `dayjsObj.isValid()`). Invalid dates should not be stored.

5. **dayjs is an adapter dependency, not a core dependency.** Only `@formosaic/antd` depends on dayjs. Core and all other adapters use native `Date`.
