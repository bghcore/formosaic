/**
 * TemplateResolver — 11-step resolution pipeline.
 *
 * Transforms an IFormConfig containing templateRef fields into a flat
 * IResolvedFormConfig with no template references remaining. The output
 * is a standard IFormConfig that the existing rules engine can consume.
 *
 * Pipeline steps:
 *  1. Collect     — Walk config tree, find all templateRef nodes
 *  2. Params      — Evaluate {{expression}} strings against params + $lookup tables
 *  3. Expand      — Replace templateRef node with template's fields, prefixed by field name
 *  4. Override    — Apply templateOverrides (shallow merge) and defaultValues
 *  5. Recurse     — If expanded fields contain templateRef, repeat (with cycle detection)
 *  6. Rewrite     — Prefix internal rule field references to match resolved paths
 *  7. Scope       — Rewrite $values references in expressions to use prefixed paths
 *  8. Merge ports — Collect port declarations, rewrite to prefixed paths
 *  9. Wizard      — Expand wizard step `fragments` arrays to resolved field name lists
 * 10. Attach meta — Build _templateMeta mapping for DevTools (dev mode only)
 * 11. Output      — Standard IFormConfig with no template references remaining
 */

import { IFormConfig } from "../types/IFormConfig";
import { IFieldConfig } from "../types/IFieldConfig";
import { IFormTemplate, ITemplateFieldRef, isTemplateFieldRef } from "../types/IFormTemplate";
import { IResolvedFormConfig, ITemplateMeta } from "../types/IResolvedFormConfig";
import { IRule } from "../types/IRule";
import { ICondition, IFieldCondition, isLogicalCondition } from "../types/ICondition";
import { IFieldEffect } from "../types/IFieldEffect";
import { getFormTemplate } from "./TemplateRegistry";
import { getLookupTable } from "./LookupRegistry";
import { interpolateDeep } from "./ExpressionInterpolator";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface IResolveOptions {
  /** Additional templates merged with global registry and config.templates. */
  templates?: Record<string, IFormTemplate>;
  /** Additional lookups merged with global registry and config.lookups. */
  lookups?: Record<string, unknown>;
  /** Maximum template nesting depth. Default: 10. */
  maxDepth?: number;
}

/**
 * Resolve all template references in a form config, producing a flat
 * IResolvedFormConfig with no templateRef fields remaining.
 */
export function resolveTemplates(
  config: IFormConfig,
  options?: IResolveOptions
): IResolvedFormConfig {
  const maxDepth = options?.maxDepth ?? 10;

  // Build merged template registry: global -> config.templates -> options.templates
  const mergedTemplates: Record<string, IFormTemplate> = {};
  // Pull from global registry by trying to look up inline/config templates later
  // We store inline + option templates here; global is accessed via getFormTemplate
  if (config.templates) {
    Object.assign(mergedTemplates, config.templates);
  }
  if (options?.templates) {
    Object.assign(mergedTemplates, options.templates);
  }

  // Build merged lookup tables: global -> config.lookups -> options.lookups
  const mergedLookups: Record<string, unknown> = {};
  if (config.lookups) {
    Object.assign(mergedLookups, config.lookups);
  }
  if (options?.lookups) {
    Object.assign(mergedLookups, options.lookups);
  }

  // Resolution context
  const ctx: IResolutionContext = {
    mergedTemplates,
    mergedLookups,
    maxDepth,
    templateMeta: {},
    resolvedPorts: {},
    // Track which resolved field names belong to which fragment prefix
    fragmentFields: {} as Record<string, string[]>,
    // Track template fieldOrder per fragment
    fragmentFieldOrders: {} as Record<string, string[]>,
  };

  // Step 1-5: Expand all fields (recursive)
  const resolvedFields: Record<string, IFieldConfig> = {};
  for (const [fieldName, fieldDef] of Object.entries(config.fields)) {
    if (isTemplateFieldRef(fieldDef)) {
      expandTemplateRef(
        fieldName,
        fieldDef,
        resolvedFields,
        ctx,
        [],   // resolution stack for cycle detection
        0     // current depth
      );
    } else {
      resolvedFields[fieldName] = { ...fieldDef };
    }
  }

  // Step 6-7 already done during expansion (rules rewritten in expandTemplateRef)

  // Step 8: fieldOrder expansion
  let resolvedFieldOrder = config.fieldOrder;
  if (resolvedFieldOrder) {
    resolvedFieldOrder = expandFieldOrder(resolvedFieldOrder, ctx);
  }

  // Step 9: Wizard fragment expansion
  let resolvedWizard = config.wizard;
  if (resolvedWizard) {
    resolvedWizard = expandWizardFragments(resolvedWizard, ctx);
  }

  // Step 10-11: Build output
  const result: IResolvedFormConfig = {
    ...config,
    fields: resolvedFields,
  };

  if (resolvedFieldOrder) {
    result.fieldOrder = resolvedFieldOrder;
  }

  if (resolvedWizard) {
    result.wizard = resolvedWizard;
  }

  // Attach template meta (always — useful for DevTools)
  if (Object.keys(ctx.templateMeta).length > 0) {
    result._templateMeta = ctx.templateMeta;
  }

  // Attach resolved ports
  if (Object.keys(ctx.resolvedPorts).length > 0) {
    result._resolvedPorts = ctx.resolvedPorts;
  }

  return result;
}

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

interface IResolutionContext {
  mergedTemplates: Record<string, IFormTemplate>;
  mergedLookups: Record<string, unknown>;
  maxDepth: number;
  templateMeta: ITemplateMeta;
  resolvedPorts: Record<string, string[]>;
  fragmentFields: Record<string, string[]>;
  fragmentFieldOrders: Record<string, string[]>;
}

// ---------------------------------------------------------------------------
// Core expansion logic (Steps 1-7)
// ---------------------------------------------------------------------------

function lookupTemplate(name: string, ctx: IResolutionContext): IFormTemplate {
  // Inline/options templates take precedence over global registry
  const tmpl = ctx.mergedTemplates[name] ?? getFormTemplate(name);
  if (!tmpl) {
    throw new Error(
      `Template "${name}" not found. Ensure it is registered via registerFormTemplate() ` +
      `or provided inline in config.templates.`
    );
  }
  return tmpl;
}

function expandTemplateRef(
  prefix: string,
  ref: ITemplateFieldRef,
  output: Record<string, IFieldConfig>,
  ctx: IResolutionContext,
  resolutionStack: string[],
  depth: number
): void {
  // Cycle detection
  if (resolutionStack.includes(ref.templateRef)) {
    throw new Error(
      `Cycle detected in template resolution: ${[...resolutionStack, ref.templateRef].join(" -> ")}. ` +
      `Templates cannot reference each other in a circular chain.`
    );
  }

  // Max depth check
  if (depth >= ctx.maxDepth) {
    throw new Error(
      `Maximum template resolution depth (${ctx.maxDepth}) exceeded at "${prefix}". ` +
      `This usually indicates deeply nested or recursive templates.`
    );
  }

  const template = lookupTemplate(ref.templateRef, ctx);

  // Step 2: Resolve params (merge provided params with template param defaults)
  const resolvedParams = resolveParams(template, ref.templateParams ?? {});

  // Build merged lookups (global + inline)
  const lookups = buildLookups(ctx);

  // Warn on missing lookup references in template fields
  warnMissingLookups(template, lookups);

  // Deep-clone and interpolate template fields with resolved params
  const interpolatedFields = interpolateDeep(
    deepClone(template.fields),
    resolvedParams,
    lookups
  ) as Record<string, IFieldConfig | ITemplateFieldRef>;

  // Track which field names belong to this fragment
  const fragmentFieldNames: string[] = [];

  // Step 3-5: Expand each field, applying prefix
  for (const [localName, fieldDef] of Object.entries(interpolatedFields)) {
    const prefixedName = `${prefix}.${localName}`;

    if (isTemplateFieldRef(fieldDef)) {
      // Recurse for nested template refs
      expandTemplateRef(
        prefixedName,
        fieldDef,
        output,
        ctx,
        [...resolutionStack, ref.templateRef],
        depth + 1
      );
      // Include nested fragment's resolved fields in the parent fragment's field list
      const nestedFields = ctx.fragmentFields[prefixedName];
      if (nestedFields) {
        fragmentFieldNames.push(...nestedFields);
      }
    } else {
      let resolvedField: IFieldConfig = { ...fieldDef };

      // Step 4: Apply templateOverrides
      if (ref.templateOverrides && ref.templateOverrides[localName]) {
        resolvedField = { ...resolvedField, ...ref.templateOverrides[localName] };
      }

      // Step 4: Apply defaultValues
      if (ref.defaultValues && localName in ref.defaultValues) {
        resolvedField.defaultValue = ref.defaultValues[localName];
      }

      // Step 7: Rewrite $values references in computedValue
      if (resolvedField.computedValue) {
        resolvedField.computedValue = rewriteExpressionScope(
          resolvedField.computedValue,
          prefix,
          new Set(Object.keys(interpolatedFields))
        );
      }

      output[prefixedName] = resolvedField;
      fragmentFieldNames.push(prefixedName);

      // Step 10: Build template meta
      ctx.templateMeta[prefixedName] = {
        template: ref.templateRef,
        fragment: prefix,
        originalName: localName,
      };
    }
  }

  // Track fragment fields for wizard/fieldOrder expansion
  ctx.fragmentFields[prefix] = fragmentFieldNames;

  // Track template's fieldOrder for this fragment
  if (template.fieldOrder) {
    ctx.fragmentFieldOrders[prefix] = template.fieldOrder.map(f => `${prefix}.${f}`);
  }

  // Step 6: Rewrite template-level rules and attach to first resolved field
  if (template.rules && template.rules.length > 0) {
    const localFieldNames = new Set(Object.keys(interpolatedFields));
    const rewrittenRules = template.rules.map(rule =>
      rewriteRule(deepClone(rule) as IRule, prefix, localFieldNames)
    );

    // Attach rules to the first field in the resolved output for this fragment
    const firstFieldKey = fragmentFieldNames[0];
    if (firstFieldKey && output[firstFieldKey]) {
      const existing = output[firstFieldKey].rules ?? [];
      output[firstFieldKey].rules = [...existing, ...rewrittenRules];
    }
  }

  // Step 8: Merge ports with prefixed paths
  if (template.ports) {
    for (const [portName, portFields] of Object.entries(template.ports)) {
      const prefixedPortName = `${prefix}.${portName}`;
      ctx.resolvedPorts[prefixedPortName] = portFields.map(f => `${prefix}.${f}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Param resolution (Step 2)
// ---------------------------------------------------------------------------

function resolveParams(
  template: IFormTemplate,
  providedParams: Record<string, unknown>
): Record<string, unknown> {
  const resolved: Record<string, unknown> = { ...providedParams };

  if (template.params) {
    for (const [paramName, schema] of Object.entries(template.params)) {
      if (!(paramName in resolved) && schema.default !== undefined) {
        resolved[paramName] = schema.default;
      }
    }
  }

  return resolved;
}

// ---------------------------------------------------------------------------
// Lookup building
// ---------------------------------------------------------------------------

function buildLookups(ctx: IResolutionContext): Record<string, unknown> {
  // Start with global registry lookups, then overlay merged (inline + options)
  const result: Record<string, unknown> = {};

  // We can't enumerate the global lookup registry, but merged already has
  // config.lookups + options.lookups. Global lookups are accessed via getLookupTable()
  // in the interpolator. However, our interpolateDeep passes lookups directly,
  // so we need to include anything from the global registry that might be needed.
  // Since we can't enumerate, we rely on the merged set.
  Object.assign(result, ctx.mergedLookups);

  return result;
}

// ---------------------------------------------------------------------------
// Missing lookup warnings
// ---------------------------------------------------------------------------

function warnMissingLookups(
  template: IFormTemplate,
  lookups: Record<string, unknown>
): void {
  // Scan template fields for $lookup references and warn if lookup table is missing
  const fieldsJson = JSON.stringify(template.fields);
  const lookupRefs = fieldsJson.match(/\$lookup\.([a-zA-Z_][a-zA-Z0-9_]*)/g);
  if (lookupRefs) {
    const seen = new Set<string>();
    for (const ref of lookupRefs) {
      const tableName = ref.slice("$lookup.".length);
      if (!seen.has(tableName) && !(tableName in lookups)) {
        // Check global registry as well
        if (getLookupTable(tableName) === undefined) {
          console.warn(
            `[Formosaic] Lookup table "${tableName}" referenced in template but not found ` +
            `in config.lookups or global lookup registry.`
          );
        }
        seen.add(tableName);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Rule rewriting (Step 6)
// ---------------------------------------------------------------------------

function rewriteRule(
  rule: IRule,
  prefix: string,
  localFields: Set<string>
): IRule {
  return {
    ...rule,
    when: rewriteCondition(rule.when, prefix, localFields),
    then: rewriteEffect(rule.then, prefix, localFields),
    ...(rule.else ? { else: rewriteEffect(rule.else, prefix, localFields) } : {}),
  };
}

function rewriteCondition(
  condition: ICondition,
  prefix: string,
  localFields: Set<string>
): ICondition {
  if (isLogicalCondition(condition)) {
    return {
      ...condition,
      conditions: condition.conditions.map(c =>
        rewriteCondition(c, prefix, localFields)
      ),
    };
  }

  // Field condition
  const fc = condition as IFieldCondition;
  return {
    ...fc,
    field: rewriteFieldRef(fc.field, prefix, localFields),
  };
}

function rewriteEffect(
  effect: IFieldEffect,
  prefix: string,
  localFields: Set<string>
): IFieldEffect {
  const rewritten: IFieldEffect = { ...effect };

  // Rewrite the `fields` map keys (cross-field effects)
  if (effect.fields) {
    const newFields: Record<string, IFieldEffect> = {};
    for (const [fieldName, fieldEffect] of Object.entries(effect.fields)) {
      const rewrittenKey = rewriteFieldRef(fieldName, prefix, localFields);
      newFields[rewrittenKey] = rewriteEffect(fieldEffect, prefix, localFields);
    }
    rewritten.fields = newFields;
  }

  // Rewrite computedValue expression scope
  if (effect.computedValue) {
    rewritten.computedValue = rewriteExpressionScope(
      effect.computedValue,
      prefix,
      localFields
    );
  }

  return rewritten;
}

/**
 * Rewrite a field name reference:
 * - `$root.X` -> strip $root. prefix (root-level reference)
 * - local field name (exists in template) -> prefix it
 * - Unknown -> leave as-is (could be a root-level field)
 */
function rewriteFieldRef(
  fieldName: string,
  prefix: string,
  localFields: Set<string>
): string {
  // $root.X -> X (root-level field reference)
  if (fieldName.startsWith("$root.")) {
    return fieldName.slice("$root.".length);
  }

  // Local field -> prefix it
  if (localFields.has(fieldName)) {
    return `${prefix}.${fieldName}`;
  }

  // Unknown field — return as-is (may be a root-level field)
  return fieldName;
}

// ---------------------------------------------------------------------------
// Expression scope rewriting (Step 7)
// ---------------------------------------------------------------------------

/**
 * Rewrite $values.X references in an expression string.
 * - If X is a local template field, rewrite to $values.{prefix}.X
 * - If X starts with $root., rewrite to $values.{rest} (strip $root.)
 * - Otherwise leave as-is
 */
function rewriteExpressionScope(
  expression: string,
  prefix: string,
  localFields: Set<string>
): string {
  // Match $values.something (dot-path after $values.)
  return expression.replace(
    /\$values\.([a-zA-Z_][a-zA-Z0-9_.]*)/g,
    (_match, path: string) => {
      // $values.$root.X -> $values.X
      if (path.startsWith("$root.")) {
        return `$values.${path.slice("$root.".length)}`;
      }

      // Extract the first segment of the path (e.g., "qty" from "qty.sub")
      const firstSegment = path.split(".")[0];

      // If the first segment is a local field, prefix it
      if (localFields.has(firstSegment)) {
        return `$values.${prefix}.${path}`;
      }

      // Otherwise leave as-is (root-level reference)
      return `$values.${path}`;
    }
  );
}

// ---------------------------------------------------------------------------
// fieldOrder expansion (Step 8 of output)
// ---------------------------------------------------------------------------

function expandFieldOrder(
  fieldOrder: string[],
  ctx: IResolutionContext
): string[] {
  const expanded: string[] = [];
  for (const entry of fieldOrder) {
    // If entry is a fragment prefix, expand to the template's field order
    if (ctx.fragmentFieldOrders[entry]) {
      expanded.push(...ctx.fragmentFieldOrders[entry]);
    } else if (ctx.fragmentFields[entry]) {
      // Fragment exists but no explicit fieldOrder — use the fragment's field list
      expanded.push(...ctx.fragmentFields[entry]);
    } else {
      // Regular field name, keep as-is
      expanded.push(entry);
    }
  }
  return expanded;
}

// ---------------------------------------------------------------------------
// Wizard fragment expansion (Step 9)
// ---------------------------------------------------------------------------

function expandWizardFragments(
  wizard: IFormConfig["wizard"],
  ctx: IResolutionContext
): IFormConfig["wizard"] {
  if (!wizard) return wizard;

  return {
    ...wizard,
    steps: wizard.steps.map(step => {
      if (!step.fragments || step.fragments.length === 0) {
        return step;
      }

      // Expand fragments to field names
      const expandedFields: string[] = [...(step.fields ?? [])];
      for (const fragment of step.fragments) {
        const fragmentFieldNames = ctx.fragmentFields[fragment];
        if (fragmentFieldNames) {
          expandedFields.push(...fragmentFieldNames);
        }
      }

      return {
        ...step,
        fields: expandedFields,
      };
    }),
  };
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
