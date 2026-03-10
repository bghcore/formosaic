# Choosing an Adapter

form-engine supports 11 UI-library adapters. Each adapter maps the same `IFormConfig` to a different component library, so your form definitions stay portable. This guide helps you pick the right one for your project.

## Quick Decision Table

| If you're building with... | Use |
|---|---|
| Fluent UI v9 | `@form-eng/fluent` |
| Material UI (MUI) | `@form-eng/mui` |
| Ant Design v5 | `@form-eng/antd` |
| Chakra UI v3 | `@form-eng/chakra` |
| Mantine v7 | `@form-eng/mantine` |
| Atlassian Design System | `@form-eng/atlaskit` |
| Uber Base Web | `@form-eng/base-web` |
| HeroUI (NextUI) | `@form-eng/heroui` |
| Radix UI / shadcn/ui / Tailwind | `@form-eng/radix` |
| React Aria / Adobe Spectrum | `@form-eng/react-aria` |
| No UI library / custom styling | `@form-eng/headless` |

## Adapter Classification Grid

| Adapter | Category | Native Components | Semantic HTML Fallbacks | Tier 1 Fields | Wrapper Required | Bundle Impact |
|---|---|---|---|---|---|---|
| fluent | Framework-native | 13 | 0 | 13 | FluentProvider | Medium |
| mui | Framework-native | 13 | 0 | 13 | ThemeProvider (optional) | Medium |
| headless | Reference | 0 | 13 | 13 | None | Minimal |
| antd | Framework-native | 13 | 0 | 13 | None | Medium |
| chakra | Hybrid | 7 | 6 | 13 | ChakraProvider | Medium |
| mantine | Framework-native | 13 | 0 | 13 | MantineProvider | Medium |
| atlaskit | Compatibility | 0 | 13 | 13 | None | Minimal |
| base-web | Framework-native | 10 | 3 | 13 | BaseProvider + StyletronProvider | Medium |
| heroui | Compatibility | 0 | 13 | 13 | None | Minimal |
| radix | Primitives-first | 6 | 7 | 13 | None | Small |
| react-aria | Primitives-first | 10 | 3 | 13 | None | Small |

### Category Definitions

- **Framework-native**: All 13 Tier 1 fields use the UI library's native components.
- **Primitives-first**: Uses unstyled primitives -- bring your own styling (Tailwind, CSS modules, etc.).
- **Hybrid**: Mix of native components and semantic HTML fallbacks (due to upstream library issues).
- **Compatibility**: Uses semantic HTML with data attributes matching the UI library's patterns.
- **Reference**: Pure semantic HTML, ideal for testing and custom styling.

## Per-Adapter Details

### @form-eng/fluent

**Best for:** Microsoft-stack applications, Teams apps, SharePoint extensions, and any project already using Fluent UI v9.

**Strengths:**
- Full native component coverage across all 13 Tier 1 fields
- Rich theming via FluentProvider tokens
- Strong built-in accessibility from Fluent UI
- StatusDropdown and DocumentLinks specialized components

**Limitations:**
- Requires FluentProvider wrapper around the form tree
- Multiselect needs FormProvider context for standalone rendering
- PopOutEditor Textarea shows required indicator only in modal (DIV-003)

**Notes:** The most battle-tested adapter in the project.

---

### @form-eng/mui

**Best for:** Material Design projects, Google-style applications, and teams already invested in the MUI ecosystem.

**Strengths:**
- Full native component coverage across all 13 Tier 1 fields
- Extensive theming via MUI's `createTheme` system
- Large community and ecosystem
- ThemeProvider wrapper is optional (sensible defaults without it)

**Limitations:**
- CheckboxGroup required detection does not work in standalone render (DIV-004)
- PopOutEditor Textarea shows required indicator only in modal (DIV-003)

---

### @form-eng/headless

**Best for:** Projects with fully custom styling, testing environments, or applications that do not use a UI framework.

**Strengths:**
- Zero UI-library dependencies, minimal bundle size
- Full ARIA support for accessibility
- `data-*` attributes on every element for straightforward CSS targeting
- Reference implementation for building custom adapters

**Limitations:**
- No visual styling included -- you must provide your own CSS

**Notes:** Ships an optional `styles.css` with CSS custom properties as a starting point.

---

### @form-eng/antd

**Best for:** Ant Design v5 projects, enterprise admin panels, and internal tools.

**Strengths:**
- Full native component coverage across all 13 Tier 1 fields
- dayjs-based DatePicker integration
- No wrapper component required

**Limitations:**
- Relatively large bundle due to Ant Design's footprint

---

### @form-eng/chakra

**Best for:** Chakra UI v3 projects that want form-engine integration.

**Strengths:**
- ChakraProvider integration with Chakra CSS variables
- 7 fields use native Chakra components

**Limitations:**
- 6 of 13 fields use semantic HTML fallbacks due to an Ark UI compound-component DTS issue (DIV-008)
- Requires ChakraProvider wrapper with `defaultSystem`

**Notes:** Semantic HTML fallbacks are functionally equivalent and pass all parity tests.

---

### @form-eng/mantine

**Best for:** Mantine v7 projects.

**Strengths:**
- Full native component coverage across all 13 Tier 1 fields
- Rich built-in components (DatePicker, MultiSelect, NumberInput, etc.)

**Limitations:**
- Requires MantineProvider wrapper
- jsdom tests require `matchMedia` and `ResizeObserver` mocks
- NumberInput treats empty input as `null` rather than `undefined` (DIV-002)

---

### @form-eng/atlaskit

**Best for:** Projects targeting Atlassian ecosystem compatibility.

**Strengths:**
- Drop-in replacement pattern for Atlassian Design System projects
- Familiar API surface for teams coming from Atlaskit
- Lightweight, no heavy dependencies

**Limitations:**
- Uses semantic HTML, not actual Atlaskit components (DIV-007)

---

### @form-eng/base-web

**Best for:** Uber Base Web projects.

**Strengths:**
- 10 of 13 Tier 1 fields use native baseui components (Input, Select, Checkbox, Radio, Slider, Textarea)
- Native component quality matches other framework-native adapters

**Limitations:**
- Requires BaseProvider + StyletronProvider wrapper
- DateControl uses native `<input type="date">` fallback (Base Web DatePicker requires react-input-mask, incompatible with React 19)

---

### @form-eng/heroui

**Best for:** HeroUI (formerly NextUI) ecosystem compatibility.

**Strengths:**
- Lightweight semantic HTML implementation
- No wrapper required

**Limitations:**
- Uses semantic HTML, not actual HeroUI components (DIV-007)

---

### @form-eng/radix

**Best for:** shadcn/ui projects, Tailwind CSS applications, or any project wanting unstyled Radix primitives as a base.

**Strengths:**
- Radix UI primitives for key fields (Select, Switch, Checkbox, Slider, RadioGroup)
- No wrapper required
- Tiny bundle size
- Ideal foundation for shadcn/ui integration

**Limitations:**
- 7 fields use semantic HTML (Textbox, Number, MultiSelect, DateControl, Textarea, DynamicFragment, ReadOnly)
- Select uses `undefined` (not `""`) for empty value (DIV-010)
- Slider uses array boundary conversion (DIV-011)

**Notes:** See the [shadcn Integration](./shadcn-integration.md) guide for a detailed walkthrough.

---

### @form-eng/react-aria

**Best for:** Accessibility-first projects, Adobe Spectrum ecosystem, and applications built on React Aria Components.

**Strengths:**
- 10 native React Aria Components out of 13 fields
- Excellent accessibility out of the box (WAI-ARIA patterns built in)
- No wrapper required
- Small bundle footprint

**Limitations:**
- 3 fields use semantic HTML (Textarea, DynamicFragment, ReadOnly)
- Key type cast required for Select component (DIV-012)

## Decision Flowchart

```
Start
  |
  v
Already using a UI framework?
  |
  +-- Yes --> Is it one of the 11 supported frameworks? --> Yes --> Use that adapter
  |                                                     --> No  --> Use @form-eng/headless
  |
  +-- No --> Want unstyled primitives?
              |
              +-- Yes --> Need best accessibility? --> @form-eng/react-aria
              |       --> Want shadcn/Radix base?  --> @form-eng/radix
              |
              +-- No  --> @form-eng/headless
```

## Related Documentation

- [Adapter Architecture](./adapter-architecture.md) -- internal adapter implementation patterns
- [Divergence Register](./divergence-register.md) -- complete list of known behavioral differences
- [Parity Matrix](./parity-matrix.md) -- cross-adapter field coverage comparison
- [shadcn Integration](./shadcn-integration.md) -- detailed guide for shadcn/ui projects
- [Tier 2 Feasibility Matrix](./tier2-feasibility-matrix.md) -- upcoming field expansion plans
