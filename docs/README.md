# Documentation Index

## For Users Integrating the Library

| Document | Purpose |
|----------|---------|
| [comparison.md](./comparison.md) | Honest comparison vs RJSF, TanStack Form, Formik, uniforms, SurveyJS, Form.io |
| [choosing-an-adapter.md](./choosing-an-adapter.md) | Pick the right adapter for your UI framework |
| [shadcn-integration.md](./shadcn-integration.md) | shadcn/ui + Tailwind integration guide |
| [ssr-guide.md](./ssr-guide.md) | Server-side rendering / Next.js guide |
| [ACCESSIBILITY.md](./ACCESSIBILITY.md) | WCAG 2.1 AA compliance and ARIA patterns |

## API and Configuration Reference

| Document | Purpose |
|----------|---------|
| [field-config-reference.md](./field-config-reference.md) | IFieldConfig v2 property reference |
| [field-types-reference.md](./field-types-reference.md) | All field types with value types and adapter mappings |
| [condition-operators.md](./condition-operators.md) | 20 condition operators for rules and validation |
| [expression-syntax.md](./expression-syntax.md) | $values, $fn, $parent expression syntax |
| [validators-reference.md](./validators-reference.md) | Built-in and custom validators |
| [value-functions-reference.md](./value-functions-reference.md) | Value function registry |
| [i18n-reference.md](./i18n-reference.md) | Internationalization / locale strings |
| [api-stability.md](./api-stability.md) | Public API stability classifications |

## Architecture and Design

| Document | Purpose |
|----------|---------|
| [rules-engine.md](./rules-engine.md) | Rules engine lifecycle, dependency graph, evaluation |
| [adapter-architecture.md](./adapter-architecture.md) | Adapter package structure, IFieldProps contract, classifications |
| [canonical-field-contracts.md](./canonical-field-contracts.md) | Field value types, empty semantics, readOnly behavior |
| [date-policy.md](./date-policy.md) | ISO 8601 date handling policy across adapters |

## Adapter Support and Parity

| Document | Purpose |
|----------|---------|
| [parity-matrix.md](./parity-matrix.md) | Field implementation status (Y/FB/---) across all 11 adapters |
| [divergence-register.md](./divergence-register.md) | 12 known behavioral differences (DIV-001 through DIV-012) |

## Contributor Guidance

| Document | Purpose |
|----------|---------|
| [creating-an-adapter.md](./creating-an-adapter.md) | Step-by-step guide for building a new adapter |
| [tier1-patterns.md](./tier1-patterns.md) | 12 canonical patterns to follow for new fields |

## Debugging and Operations

| Document | Purpose |
|----------|---------|
| [debugging-rules.md](./debugging-rules.md) | Rule tracing, config validation, DevTools |
| [performance-debugging.md](./performance-debugging.md) | RenderTracker, EventTimeline, DevTools tabs |
| [analytics-telemetry.md](./analytics-telemetry.md) | IAnalyticsCallbacks, useFormAnalytics integration |

## Historical (Tier 2 Planning)

| Document | Purpose |
|----------|---------|
| [tier2-handoff.md](./tier2-handoff.md) | Pre-expansion planning document (completed in v1.6.0) |
| [tier1-baseline-report.md](./tier1-baseline-report.md) | Pre-expansion Tier 1 baseline (completed in v1.6.0) |
| [tier1-patterns.md](./tier1-patterns.md) | Implementation patterns reference (still relevant) |
