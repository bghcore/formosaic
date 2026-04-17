import { IFieldConfig } from "../types/IFieldConfig";
import { IRule } from "../types/IRule";
import { IFieldEffect } from "../types/IFieldEffect";
import { IRuntimeFieldState, IRuntimeFormState } from "../types/IRuntimeFieldState";
import { IEntityData } from "../utils";
import { evaluateCondition, extractConditionDependencies } from "./ConditionEvaluator";
import { extractExpressionDependencies } from "./ExpressionEngine";
import { logEvent } from "./EventTimeline";

/**
 * Builds the dependency graph from field configs.
 * Returns adjacency lists: for each field, which other fields depend on it.
 */
export function buildDependencyGraph(
  fields: Record<string, IFieldConfig>
): Record<string, Set<string>> {
  const graph: Record<string, Set<string>> = {};
  const fieldNames = Object.keys(fields);

  for (const name of fieldNames) {
    graph[name] = new Set();
  }

  // Resolve a dotted dependency reference to the longest-prefix field that
  // actually exists in the fields record. This lets rule conditions like
  // `{ field: "address.city" }` register an edge on the `address` field
  // when only `address` is a top-level key (e.g. an object/template field).
  // Without this, evaluateAffectedFields would skip the rule on changes to
  // the ancestor key. See audit finding P0-5.
  const resolveDepKey = (dep: string): string | undefined => {
    if (dep in graph) return dep;
    let idx = dep.lastIndexOf(".");
    while (idx > 0) {
      const candidate = dep.slice(0, idx);
      if (candidate in graph) return candidate;
      idx = dep.lastIndexOf(".", idx - 1);
    }
    return undefined;
  };

  for (const [fieldName, config] of Object.entries(fields)) {
    if (config.rules) {
      for (const rule of config.rules) {
        // Fields referenced in the when condition
        const condDeps = extractConditionDependencies(rule.when);
        for (const dep of condDeps) {
          const key = resolveDepKey(dep);
          if (key) {
            graph[key].add(fieldName);
          }
        }

        // Fields referenced in cross-field effects
        collectEffectTargets(rule.then, fieldName, graph);
        if (rule.else) {
          collectEffectTargets(rule.else, fieldName, graph);
        }
      }
    }

    // Computed value dependencies
    if (config.computedValue) {
      const exprDeps = extractExpressionDependencies(config.computedValue);
      for (const dep of exprDeps) {
        const key = resolveDepKey(dep);
        if (key) {
          graph[key].add(fieldName);
        }
      }
    }
  }

  return graph;
}

function collectEffectTargets(
  effect: IFieldEffect,
  ownerField: string,
  graph: Record<string, Set<string>>
): void {
  if (effect.fields) {
    for (const targetField of Object.keys(effect.fields)) {
      // Skip self-references: a field targeting itself via cross-field effect
      // syntax is handled as a self-effect during evaluation and must not
      // create a self-loop that would poison the topological sort.
      if (targetField !== ownerField && targetField in graph) {
        graph[ownerField]?.add(targetField);
      }
    }
  }
}

/**
 * Topological sort of field names using Kahn's algorithm.
 * Returns fields in dependency order. Detects cycles.
 */
export function topologicalSort(
  graph: Record<string, Set<string>>
): { sorted: string[]; hasCycle: boolean; cycleFields: string[] } {
  const inDegree: Record<string, number> = {};
  const adjacency: Record<string, string[]> = {};
  const fields = Object.keys(graph);

  for (const f of fields) {
    inDegree[f] = 0;
    adjacency[f] = [...graph[f]];
  }

  for (const f of fields) {
    for (const dep of adjacency[f]) {
      if (dep in inDegree) {
        inDegree[dep]++;
      }
    }
  }

  const queue: string[] = [];
  for (const f of fields) {
    if (inDegree[f] === 0) queue.push(f);
  }

  const sorted: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    sorted.push(current);
    for (const neighbor of adjacency[current]) {
      if (neighbor in inDegree) {
        inDegree[neighbor]--;
        if (inDegree[neighbor] === 0) queue.push(neighbor);
      }
    }
  }

  const hasCycle = sorted.length < fields.length;
  const cycleFields = hasCycle ? fields.filter(f => !sorted.includes(f)) : [];
  return { sorted, hasCycle, cycleFields };
}

/**
 * Builds the default runtime field state from static field configs.
 */
export function buildDefaultFieldStates(
  fields: Record<string, IFieldConfig>,
  areAllFieldsReadonly?: boolean
): Record<string, IRuntimeFieldState> {
  const states: Record<string, IRuntimeFieldState> = {};
  const graph = buildDependencyGraph(fields);

  for (const [fieldName, config] of Object.entries(fields)) {
    states[fieldName] = {
      type: config.type,
      required: config.required,
      hidden: config.hidden || config.type === "DynamicFragment",
      readOnly: areAllFieldsReadonly ? true : config.readOnly,
      validate: config.validate,
      computedValue: config.computedValue,
      confirmInput: config.confirmInput,
      options: config.options,
      label: config.label,
      defaultValue: config.defaultValue,
      computeOnCreateOnly: config.computeOnCreateOnly,
      dependentFields: [...(graph[fieldName] ?? [])],
      dependsOnFields: [],
      activeRuleIds: [],
    };
  }

  // Wire up reverse dependencies
  for (const [fieldName, state] of Object.entries(states)) {
    for (const dep of state.dependentFields ?? []) {
      if (states[dep]) {
        states[dep].dependsOnFields = states[dep].dependsOnFields ?? [];
        states[dep].dependsOnFields!.push(fieldName);
      }
    }
  }

  return states;
}

/**
 * Evaluates all rules for all fields against current values.
 * Returns the full runtime form state.
 */
export function evaluateAllRules(
  fields: Record<string, IFieldConfig>,
  values: IEntityData,
  areAllFieldsReadonly?: boolean
): IRuntimeFormState {
  const fieldStates = buildDefaultFieldStates(fields, areAllFieldsReadonly);
  const fieldOrder = Object.keys(fields);

  // Apply rules in topological order for correct dependency resolution
  const graph = buildDependencyGraph(fields);
  const { sorted } = topologicalSort(graph);
  const evalOrder = sorted.length > 0 ? sorted : fieldOrder;

  let currentOrder = [...fieldOrder];

  for (const fieldName of evalOrder) {
    const config = fields[fieldName];
    if (!config?.rules) continue;

    const ruleResults = evaluateFieldRules(config.rules, values);

    if (fieldStates[fieldName]) {
      fieldStates[fieldName].activeRuleIds = ruleResults.activeRuleIds;
    }

    logEvent("rule_evaluated", fieldName, `${config.rules.length} rule(s) evaluated`);

    // Apply self-effects
    applyEffectToState(fieldStates, fieldName, ruleResults.selfEffect);

    // Apply setValue from then-branch only (stored separately to avoid else contamination)
    if (ruleResults.pendingSetValue !== undefined && fieldStates[fieldName]) {
      fieldStates[fieldName].pendingSetValue = ruleResults.pendingSetValue;
    }

    // Apply cross-field effects
    for (const [targetField, effect] of Object.entries(ruleResults.crossEffects)) {
      if (fieldStates[targetField]) {
        applyEffectToState(fieldStates, targetField, effect);
      }
    }

    // Apply field order changes
    if (ruleResults.fieldOrder) {
      currentOrder = ruleResults.fieldOrder;
    }
  }

  return { fieldStates, fieldOrder: currentOrder };
}

/**
 * Evaluates rules for fields that are transitively affected by a changed field.
 * Returns only the changed field states (incremental update).
 */
export function evaluateAffectedFields(
  changedField: string,
  fields: Record<string, IFieldConfig>,
  values: IEntityData,
  currentState: IRuntimeFormState
): IRuntimeFormState {
  // Find all transitively affected fields via the dependency graph
  const affected = getTransitivelyAffectedFields(changedField, currentState.fieldStates);
  // Always include the changed field itself so its own rules re-evaluate
  affected.add(changedField);

  // First pass: collect cross-field effect targets from rules on affected fields
  // so we can reset and re-evaluate them too
  const crossFieldTargets = new Set<string>();
  for (const fieldName of affected) {
    const config = fields[fieldName];
    if (!config?.rules) continue;
    for (const rule of config.rules) {
      if (rule.then?.fields) {
        for (const target of Object.keys(rule.then.fields)) {
          if (target in fields) crossFieldTargets.add(target);
        }
      }
      if (rule.else?.fields) {
        for (const target of Object.keys(rule.else.fields)) {
          if (target in fields) crossFieldTargets.add(target);
        }
      }
    }
  }

  // Merge cross-field targets into the set of fields to re-evaluate
  for (const target of crossFieldTargets) {
    affected.add(target);
  }

  logEvent("field_change", changedField, `${affected.size} affected field(s)`);

  const updatedStates = { ...currentState.fieldStates };
  let updatedOrder = [...currentState.fieldOrder];

  // Reset affected fields to defaults, preserving dependency graph edges
  for (const fieldName of affected) {
    const config = fields[fieldName];
    if (!config) continue;

    updatedStates[fieldName] = {
      ...updatedStates[fieldName],
      type: config.type,
      required: config.required,
      hidden: config.hidden || config.type === "DynamicFragment",
      readOnly: config.readOnly,
      validate: config.validate,
      computedValue: config.computedValue,
      confirmInput: config.confirmInput,
      options: config.options,
      label: config.label,
      defaultValue: config.defaultValue,
      computeOnCreateOnly: config.computeOnCreateOnly,
      // Preserve dependency graph — these are set at init and must survive updates
      dependentFields: updatedStates[fieldName]?.dependentFields,
      dependsOnFields: updatedStates[fieldName]?.dependsOnFields,
      activeRuleIds: [],
      pendingSetValue: undefined,
    };
  }

  // Re-apply all rules from fields in the affected set
  for (const ownerField of affected) {
    const config = fields[ownerField];
    if (!config?.rules) continue;

    const ruleResults = evaluateFieldRules(config.rules, values);

    // Apply self-effects
    applyEffectToState(updatedStates, ownerField, ruleResults.selfEffect);
    if (ruleResults.pendingSetValue !== undefined && updatedStates[ownerField]) {
      updatedStates[ownerField].pendingSetValue = ruleResults.pendingSetValue;
    }

    if (updatedStates[ownerField]) {
      updatedStates[ownerField].activeRuleIds = ruleResults.activeRuleIds;
    }

    // Apply cross-field effects — targets are guaranteed to be in updatedStates
    // because we added them to the affected set above
    for (const [targetField, effect] of Object.entries(ruleResults.crossEffects)) {
      if (updatedStates[targetField]) {
        applyEffectToState(updatedStates, targetField, effect);
      }
    }

    if (ruleResults.fieldOrder) {
      updatedOrder = ruleResults.fieldOrder;
    }
  }

  return { fieldStates: updatedStates, fieldOrder: updatedOrder };
}

function getTransitivelyAffectedFields(
  changedField: string,
  fieldStates: Record<string, IRuntimeFieldState>
): Set<string> {
  const affected = new Set<string>();
  const queue = [changedField];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const deps = fieldStates[current]?.dependentFields ?? [];
    for (const dep of deps) {
      if (!affected.has(dep)) {
        affected.add(dep);
        queue.push(dep);
      }
    }
  }

  return affected;
}

interface IRuleEvalResult {
  selfEffect: IFieldEffect;
  crossEffects: Record<string, IFieldEffect>;
  fieldOrder?: string[];
  activeRuleIds: string[];
  /** Pending setValue from the winning then-branch rule (undefined if no rule fired setValue) */
  pendingSetValue?: { value: unknown };
}

/**
 * Evaluates an array of rules for a single field.
 * Resolves priority conflicts (higher priority wins).
 */
function evaluateFieldRules(rules: IRule[], values: IEntityData): IRuleEvalResult {
  // Sort by priority (higher first) for conflict resolution
  const sorted = [...rules].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

  const selfEffect: IFieldEffect = {};
  const crossEffects: Record<string, IFieldEffect> = {};
  let fieldOrder: string[] | undefined;
  const activeRuleIds: string[] = [];
  // setValue is tracked separately: only applies from the then-branch (not else)
  let pendingSetValue: { value: unknown } | undefined;

  for (let i = 0; i < sorted.length; i++) {
    const rule = sorted[i];
    const conditionMet = evaluateCondition(rule.when, values);
    if (conditionMet) {
      activeRuleIds.push(rule.id ?? `rule_${i}`);
    }
    const effect = conditionMet ? rule.then : rule.else;

    // setValue: only from the then branch, first-write-wins by priority
    if (conditionMet && rule.then?.setValue !== undefined && pendingSetValue === undefined) {
      pendingSetValue = { value: rule.then.setValue };
    }

    if (!effect) continue;

    // Merge self-effects (first write wins due to priority sort)
    // Note: setValue is intentionally excluded from general merging — handled above
    mergeEffect(selfEffect, effect);

    // Merge cross-field effects
    if (effect.fields) {
      for (const [targetField, targetEffect] of Object.entries(effect.fields)) {
        if (!crossEffects[targetField]) {
          crossEffects[targetField] = {};
        }
        mergeEffect(crossEffects[targetField], targetEffect);
      }
    }

    // Field order (highest priority rule wins)
    if (effect.fieldOrder && !fieldOrder) {
      fieldOrder = effect.fieldOrder;
    }
  }

  return { selfEffect, crossEffects, fieldOrder, activeRuleIds, pendingSetValue };
}

/**
 * Merges an effect into a target effect (first-write-wins for each property).
 */
function mergeEffect(target: IFieldEffect, source: IFieldEffect): void {
  if (source.required !== undefined && target.required === undefined) {
    target.required = source.required;
  }
  if (source.hidden !== undefined && target.hidden === undefined) {
    target.hidden = source.hidden;
  }
  if (source.readOnly !== undefined && target.readOnly === undefined) {
    target.readOnly = source.readOnly;
  }
  if (source.label !== undefined && target.label === undefined) {
    target.label = source.label;
  }
  if (source.type !== undefined && target.type === undefined) {
    target.type = source.type;
  }
  if (source.options !== undefined && target.options === undefined) {
    target.options = source.options;
  }
  if (source.validate !== undefined && target.validate === undefined) {
    target.validate = source.validate;
  }
  if (source.computedValue !== undefined && target.computedValue === undefined) {
    target.computedValue = source.computedValue;
  }
  // Note: setValue is intentionally NOT merged here — it is handled via pendingSetValue
  // in evaluateFieldRules to ensure it only applies from the then branch (not else).
}

function applyEffectToState(
  states: Record<string, IRuntimeFieldState>,
  fieldName: string,
  effect: IFieldEffect
): void {
  const state = states[fieldName];
  if (!state) return;

  if (effect.required !== undefined) state.required = effect.required;
  if (effect.hidden !== undefined) state.hidden = effect.hidden;
  if (effect.readOnly !== undefined) state.readOnly = effect.readOnly;
  if (effect.label !== undefined) state.label = effect.label;
  if (effect.type !== undefined) state.type = effect.type;
  if (effect.options !== undefined) state.options = effect.options;
  if (effect.validate !== undefined) state.validate = effect.validate;
  if (effect.computedValue !== undefined) state.computedValue = effect.computedValue;
  // Note: setValue is applied via ruleResults.pendingSetValue in evaluateAllRules /
  // evaluateAffectedFields, NOT here — to ensure it only fires from the then branch.
}
