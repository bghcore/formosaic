---
layout: home
hero:
  name: Formosaic
  text: Configuration-driven forms with a built-in rules engine
  tagline: Define forms as JSON. Let the engine handle rendering, validation, rules, and auto-save.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/bghcore/formosaic
    - theme: alt
      text: Storybook
      link: https://bghcore.github.io/formosaic/storybook/
features:
  - icon: "\u2699\uFE0F"
    title: Config-Driven
    details: Define forms as a single IFormConfig JSON object. Field types, labels, validation, and rules are all declared as data, not JSX.
  - icon: "\uD83E\uDDE0"
    title: Declarative Rules Engine
    details: 20 condition operators, composable AND/OR/NOT logic, computed values, cross-field effects. Rules are data, not code.
  - icon: "\uD83C\uDFA8"
    title: 11 UI Adapters
    details: Fluent UI, MUI, Ant Design, Mantine, Chakra, Radix, React Aria, Headless, Base Web, HeroUI, Atlaskit. Swap with one import.
  - icon: "\uD83D\uDD12"
    title: TypeScript-First
    details: Strict mode, full type inference, IFieldProps generics, typed form configs with defineFormConfig().
  - icon: "\u2705"
    title: Battle-Tested
    details: 6,296 unit tests, 54 E2E tests, 67+ Storybook stories. Contract tests ensure adapter parity.
  - icon: "\uD83D\uDE80"
    title: Production-Ready
    details: Auto-save with retry, draft persistence, error boundaries, SSR/Next.js support, i18n, analytics hooks.
---

## Try It Live

<ClientOnly>
  <LivePlayground />
</ClientOnly>
