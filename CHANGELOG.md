# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-03-02

First buildable release. Restructured from a single broken package (extracted from
the `@cxpui` internal monorepo) into two independent, publishable packages.

### Added

- **Monorepo structure** with npm workspaces (`packages/core`, `packages/fluent`)
- **`@brhanso/dynamic-forms-core`** -- Framework-agnostic business rules engine
  - `BusinessRulesProvider` and `InjectedHookFieldProvider` React context providers
  - `ProcessAllBusinessRules`, `ProcessFieldBusinessRule`, and full rule evaluation pipeline
  - `HookInlineForm` component with auto-save, expand/collapse, and confirm-input modal
  - `HookRenderField` with component injection via `React.cloneElement`
  - `HookFieldWrapper` with plain HTML status indicators (no UI library dependency)
  - `HookConfirmInputsModal` using native `<dialog>` with optional `renderDialog` prop
  - Pluggable `ValidationRegistry` with built-in validators (email, phone, year, URL, max KB)
  - Pluggable `ValueFunctionRegistry` with built-in functions (setDate, setDateIfNull, setLoggedInUser, inheritFromParent)
  - `CombineSchemaConfig` for merging field configs with schema definitions
  - All TypeScript interfaces exported (`IFieldConfig`, `IBusinessRule`, `IHookFieldSharedProps`, etc.)
  - Local utility types replacing external dependencies (`Dictionary<T>`, `IEntityData`, `SubEntityType`)
  - Local utility functions (`isEmpty`, `isNull`, `deepCopy`, `sortDropdownOptions`, etc.)
- **`@brhanso/dynamic-forms-fluent`** -- Fluent UI v8 field components
  - 13 editable field components: Textbox, Number, Toggle, Dropdown, MultiSelect, DateControl, Slider, Fragment, SimpleDropdown, MultiSelectSearch, PopOutEditor, DocumentLinks, StatusDropdown
  - 6 read-only field components: ReadOnly, ReadOnlyArray, ReadOnlyDateTime, ReadOnlyCumulativeNumber, ReadOnlyRichText, ReadOnlyWithButton
  - Supporting components: ReadOnlyText, StatusMessage, HookFormLoading (Shimmer), StatusColor, StatusDropdown, DocumentLink, DocumentLinks
  - `createFluentFieldRegistry()` for one-line setup with `InjectedHookFieldProvider`
  - Shared helpers: `FieldClassName`, `GetFieldDataTestId`, `onRenderDropdownItemWithIcon`, `formatDateTime`
- **tsup build system** producing CJS, ESM, and `.d.ts` for both packages
- `tsconfig.base.json` shared TypeScript configuration

### Changed

- **`HookInlineForm`** now accepts `currentUserUpn` prop instead of reading from `CxpAuthContext`
- **`HookInlineForm`** now accepts `onSaveError` callback instead of using `UseElxToastNotificationDispatch`
- **`HookInlineForm`** now accepts `renderExpandButton`, `renderFilterInput`, and `renderDialog` render props instead of depending on Fluent UI `DefaultButton` and `@elixir/components` `ElxSearchBox`
- **`HookRenderField`** no longer uses `UseEntitiesState` or `UseEntityDisabled` -- external entity sync is now the consumer's responsibility
- **`HookFieldWrapper`** uses plain HTML elements for error/warning/saving icons instead of Fluent UI `Icon` and `Spinner`
- **`HookConfirmInputsModal`** uses native `<dialog>` instead of `@elixir/components` `ElxDialog`
- **`HookPopOutEditor`** simplified to Textarea-only mode (removed `ElxRichTextEditor` dependency)
- **`HookMultiSelectSearch`** uses Fluent UI `ComboBox` instead of `@elixir/components` `ElxHierarchicalDropdown`
- **`DocumentLinks`** uses Fluent UI `Dialog` instead of `@elixir/components` `ElxDialog`
- **`DocumentLink`** uses `<a>` tag instead of `@cxpui/commoncontrols` `AnchorTag`
- **`BusinessRulesReducer`** uses `structuredClone` instead of `@cxpui/common` `DeepCopy`
- **`OrderDependencies`** recursive type uses `interface OrderDependencyMap` to avoid circular reference
- Validation functions are now pluggable via `registerValidations()` instead of hardcoded switch/case
- Value functions are now pluggable via `registerValueFunctions()` instead of hardcoded switch/case
- `IHookFieldSharedProps.setFieldValue` generic parameter simplified to `unknown`

### Removed

- All `@cxpui/common` imports (replaced with local `utils/`)
- All `@cxpui/commoncontrols` imports (replaced with local implementations or props)
- All `@cxpui/service` imports (ADO-specific)
- All `@cxpui/generalapi` imports (Azure-specific)
- All `@cxpui/dux` imports
- All `@elixir/components` imports
- All `@elixir/fx` imports
- All `lodash` imports
- `react-error-boundary` dependency
- **14 domain-specific field components**: HookADOWorkItem, HookADOTemplates, HookChildEntitySearch, HookDataCenterRegion, HookPeoplePicker, HookPeoplePickerList, HookProductTaxonomy, HookStatusReasonDescription, HookSubscriptionsTextArea, HookReadOnlyACRImpactFields, HookCustomerNameField, HookMSXViewLink, HookReadOnlyListTable, HookReadOnlyPerson
- **Host-app coupled components**: HookInlineFormWrapper (data fetching), HookFormPanel (slide-out panel), HookFormBoundary (error boundary with hardcoded ICM link)
- **Panel system**: HookInlineFormPanelProvider, IHookFormPanelActionProps, IHookPanelConfig
- **Domain-specific helpers**: People picker rendering, Product taxonomy API, ADO work item creation, block status change processing, customer resolution
- `InjectComponents.tsx` (replaced by `@brhanso/dynamic-forms-fluent` `createFluentFieldRegistry()`)
- `HookInlineForm.scss` (broken -- used undefined SCSS variables)
- `rollup.config.js` (replaced by tsup)
- Domain-specific strings (ICM, MSX, ADO, playbook, data center regions)
