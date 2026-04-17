# Security Policy

## Threat Model for Form Configurations

### Trust boundary

Formosaic's core runtime treats `IFormConfig` — including `computedValue`
expressions, rule `when` conditions, template params, `$lookup` tables, RJSF
schemas, and validator `params` — as **trusted input authored by the
application developer or by a first-party system the developer controls.**

"Trusted" here means: the shape and content of every field, rule, expression,
and template are assumed to have been authored (or at minimum reviewed) by
someone inside your trust boundary. The engine is safe against hostile end-user
*field values*. It is not a sandbox for hostile *configs*.

**If your application exposes config authoring to end users** — a no-code
builder, a multi-tenant "form designer", URL-parameter-driven form templates,
or any other path where untrusted actors control `IFormConfig` — you MUST
validate those configs on the server before handing them to Formosaic. The
library's built-in guards raise the cost of several specific attacks but do
not eliminate them.

### Built-in hardening (as of 1.4.2)

| Attack surface | Defense in `@formosaic/core` |
|---|---|
| XSS via `ReadOnlyRichText` | All 11 adapters sanitize HTML by default via `sanitizeHtml` from `@formosaic/core/adapter-utils`. Override with `config.sanitize`. |
| Prototype pollution via `$values.*`, `$root.*`, `$parent.*` traversal | `__proto__` / `constructor` / `prototype` keys return `undefined` in every nested-get path. |
| Prototype pollution via template params / `$lookup` / deep-merge | Same guards in `ExpressionInterpolator`, `TemplateResolver.safeMerge`, and RJSF `refResolver`. |
| ReDoS on `matches` condition + `pattern` validator — long inputs | Input > 10 000 chars → matcher returns false/skip. |
| ReDoS on `matches` / `pattern` — long regex sources | Regex source > 256 chars → matcher returns false/skip. |
| Stack overflow on deeply nested RJSF schemas | `refResolver` `maxDepth` default 64. |
| Expression sandbox | Uses `expr-eval` — no `new Function()` / `eval`. |

Every one of these defenses has adversarial regression tests in
`packages/core/src/__tests__/security/`.

### Bounded-but-not-eliminated caveats

1. **Short pathological regex within the caps can still backtrack.** A regex
   like `(a+)+b` applied to a 30-char input stays under the 256-char source
   cap and the 10 000-char input cap but can take multiple seconds of main-
   thread time due to exponential backtracking. If your application accepts
   regex patterns from untrusted sources (for example in a `matches`
   condition value or a `pattern` validator param), **validate the regex
   complexity on the server** (e.g. a library like `safe-regex`) before
   accepting it. The library's regression tests assert a 10-second upper
   bound so a future regression to an infinite hang would be caught; they
   do not eliminate the underlying V8 regex-engine behavior.

2. **Module-level registries are process-global.** `registerLocale`,
   `registerFormTemplate`, `registerValidators`, `registerValueFunctions`,
   and `registerLookupTables` mutate module-scoped state shared across all
   concurrent SSR requests on the same Node instance. Populate these at app
   startup, not per request. If you need per-request locale or validator
   configuration, manage it at the framework layer (React Context, request
   scope) rather than through these registries.

3. **DevTools / tracing are off by default and must stay off in production.**
   `enableRenderTracker` / `enableEventTimeline` / `enableRuleTracing`, when
   enabled in a server environment, accumulate per-field values in module-
   scoped arrays (bounded) that can echo user input across requests. These
   are development-only helpers.

### Consumer obligations

- Validate configs from untrusted sources before passing to Formosaic.
- Do not enable DevTools/tracing in production.
- Populate module-level registries at app startup only.
- For `ReadOnlyRichText`, consider a stricter `config.sanitize` (for example
  a full DOMPurify integration) if your threat model requires it; the
  default sanitizer strips `<script>`, `<iframe>`/`<object>`/`<embed>`/etc,
  inline event handlers, and `javascript:` URLs, but is not a full DOMPurify.

Consumers must not trust computed-value expressions, rule definitions, or
regex patterns from untrusted sources without validation.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security issues in all `@formosaic/*` packages seriously.

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them using [GitHub Security Advisories](https://github.com/bghcore/formosaic/security/advisories/new). This allows us to assess the issue and work on a fix privately before public disclosure.

### What to Include

- A description of the vulnerability
- Steps to reproduce the issue
- Affected package(s) and version(s)
- Any potential impact you've identified

### Response Timeline

- **Acknowledgment**: Within 48 hours of your report
- **Initial assessment**: Within 5 business days
- **Fix timeline**: Depends on severity; critical issues are prioritized for immediate patching

### Scope

This policy applies to all packages in the Formosaic monorepo:

- `@formosaic/core`
- `@formosaic/fluent`
- `@formosaic/mui`
- `@formosaic/headless`
- `@formosaic/antd`
- `@formosaic/chakra`
- `@formosaic/mantine`
- `@formosaic/atlaskit`
- `@formosaic/base-web`
- `@formosaic/heroui`
- `@formosaic/radix`
- `@formosaic/react-aria`
