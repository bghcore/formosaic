---
title: Choosing an Adapter
---

# Choosing an Adapter

Formosaic supports 11 UI-library adapters. Each adapter maps the same `IFormConfig` to a different component library, so your form definitions stay portable.

## Quick Decision Table

| If you're building with... | Use |
|---|---|
| Fluent UI v9 | `@formosaic/fluent` |
| Material UI (MUI) | `@formosaic/mui` |
| Ant Design v5 | `@formosaic/antd` |
| Chakra UI v3 | `@formosaic/chakra` |
| Mantine v7 | `@formosaic/mantine` |
| Atlassian Design System | `@formosaic/atlaskit` |
| Uber Base Web | `@formosaic/base-web` |
| HeroUI (NextUI) | `@formosaic/heroui` |
| Radix UI / shadcn/ui / Tailwind | `@formosaic/radix` |
| React Aria / Adobe Spectrum | `@formosaic/react-aria` |
| No UI library / custom styling | `@formosaic/headless` |

## Adapter Classification Grid

| Adapter | Category | Native Components | HTML Fallbacks | Wrapper Required | Bundle Impact |
|---|---|---|---|---|---|
| fluent | Framework-native | 28 | 0 | FluentProvider | Medium |
| mui | Framework-native | 28 | 0 | ThemeProvider (optional) | Medium |
| headless | Reference | 0 | 28 | None | Minimal |
| antd | Framework-native | 19 | 9 | None | Medium |
| chakra | Hybrid | 7 | 21 | ChakraProvider | Medium |
| mantine | Framework-native | 18 | 10 | MantineProvider | Medium |
| atlaskit | Compatibility | 0 | 28 | None | Minimal |
| base-web | Framework-native | 10 | 18 | BaseProvider + StyletronProvider | Medium |
| heroui | Compatibility | 0 | 28 | None | Minimal |
| radix | Primitives-first | 6 | 22 | None | Small |
| react-aria | Primitives-first | 11 | 17 | None | Small |

### Category Definitions

- **Framework-native**: Uses the UI library's native components for the majority of fields.
- **Primitives-first**: Uses unstyled primitives -- bring your own styling (Tailwind, CSS modules, etc.).
- **Hybrid**: Mix of native components and semantic HTML fallbacks.
- **Compatibility**: Uses semantic HTML with data attributes matching the UI library's patterns.
- **Reference**: Pure semantic HTML, ideal for testing and custom styling.

## Per-Adapter Details

### @formosaic/fluent

**Best for:** Microsoft-stack applications, Teams apps, SharePoint extensions.

Full native component coverage. Rich theming via FluentProvider tokens. The most battle-tested adapter in the project.

### @formosaic/mui

**Best for:** Material Design projects, Google-style applications.

Full native component coverage. Extensive theming via MUI's `createTheme` system. ThemeProvider wrapper is optional.

### @formosaic/headless

**Best for:** Projects with fully custom styling, testing environments, or applications without a UI framework.

Zero UI-library dependencies, minimal bundle size. Full ARIA support. Ships an optional `styles.css` with CSS custom properties.

### @formosaic/antd

**Best for:** Ant Design v5 projects, enterprise admin panels, and internal tools.

Full native component coverage. dayjs-based DatePicker integration. No wrapper required.

### @formosaic/chakra

**Best for:** Chakra UI v3 projects.

7 fields use native Chakra components. 6 fields use semantic HTML fallbacks due to Ark UI DTS issues. Requires ChakraProvider wrapper.

### @formosaic/mantine

**Best for:** Mantine v7 projects.

Full native component coverage for Tier 1 fields. Requires MantineProvider wrapper. Tests require `matchMedia` and `ResizeObserver` mocks.

### @formosaic/radix

**Best for:** shadcn/ui projects, Tailwind CSS applications, or projects wanting unstyled Radix primitives.

Radix UI primitives for key fields. Tiny bundle size. Ideal foundation for shadcn/ui integration. See the [shadcn Integration](/adapters/shadcn) guide.

### @formosaic/react-aria

**Best for:** Accessibility-first projects, Adobe Spectrum ecosystem.

10 native React Aria Components out of 13 fields. Excellent accessibility out of the box. No wrapper required.

## Decision Flowchart

```
Start
  |
  v
Already using a UI framework?
  |
  +-- Yes --> Is it one of the 11 supported frameworks? --> Yes --> Use that adapter
  |                                                     --> No  --> Use @formosaic/headless
  |
  +-- No --> Want unstyled primitives?
              |
              +-- Yes --> Need best accessibility? --> @formosaic/react-aria
              |       --> Want shadcn/Radix base?  --> @formosaic/radix
              |
              +-- No  --> @formosaic/headless
```

## Related Documentation

- [Adapter Architecture](/adapters/architecture)
- [Parity Matrix](/adapters/parity-matrix)
- [shadcn Integration](/adapters/shadcn)
- [Creating an Adapter](/adapters/creating)
