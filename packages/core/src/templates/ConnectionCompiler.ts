import { IFormConnection } from "../types/IFormConnection";
import { IRule } from "../types/IRule";
import { IFieldEffect } from "../types/IFieldEffect";

/**
 * ConnectionCompiler — translates IFormConnection[] into IRule[].
 *
 * Connections are syntactic sugar for cross-fragment rules. Each connection
 * describes a conditional relationship between a source port and a target port,
 * and the desired effect when the connection's condition is met.
 *
 * Port matching is by field suffix (local name after stripping the fragment
 * prefix), not by array index. This allows ports to list fields in different
 * orders and still produce correct pairings.
 */

/**
 * Compile an array of IFormConnection into IRule[].
 *
 * @param connections  The connections to compile.
 * @param resolvedPorts  A map of "{fragment}.{port}" -> string[] of fully-qualified field names.
 *                       Produced by the TemplateResolver (stored in _resolvedPorts).
 */
export function compileConnections(
  connections: IFormConnection[],
  resolvedPorts: Record<string, string[]>
): IRule[] {
  return connections.map(connection => compileConnection(connection, resolvedPorts));
}

// ---------------------------------------------------------------------------
// Per-connection compilation
// ---------------------------------------------------------------------------

function compileConnection(
  connection: IFormConnection,
  resolvedPorts: Record<string, string[]>
): IRule {
  const sourceKey = `${connection.source.fragment}.${connection.source.port}`;
  const targetKey = `${connection.target.fragment}.${connection.target.port}`;

  const sourceFields = resolvedPorts[sourceKey] ?? [];
  const targetFields = resolvedPorts[targetKey] ?? [];

  // Build suffix -> field maps for each side
  const sourceBySuffix = buildSuffixMap(connection.source.fragment, sourceFields);
  const targetBySuffix = buildSuffixMap(connection.target.fragment, targetFields);

  // Warn on mismatched suffixes
  warnOnMismatch(connection.name, sourceBySuffix, targetBySuffix);

  // Build the fields effect map by matching on common suffixes
  const effectFields: Record<string, Partial<IFieldEffect>> = {};

  for (const [suffix, sourceField] of Object.entries(sourceBySuffix)) {
    const targetField = targetBySuffix[suffix];
    if (!targetField) {
      // Already warned above; skip
      continue;
    }

    effectFields[targetField] = buildFieldEffect(connection.effect, sourceField);
  }

  const thenEffect: IFieldEffect = { fields: effectFields };

  return {
    id: connection.name,
    when: connection.when,
    then: thenEffect,
  };
}

// ---------------------------------------------------------------------------
// Suffix map building
// ---------------------------------------------------------------------------

/**
 * Build a map of local suffix -> fully-qualified field name.
 *
 * The suffix is derived by stripping the fragment prefix and the following dot.
 * For example, given fragment "shipping" and field "shipping.name", the suffix
 * is "name". Nested fields like "shipping.address.city" produce suffix "address.city".
 */
function buildSuffixMap(
  fragment: string,
  fields: string[]
): Record<string, string> {
  const prefix = `${fragment}.`;
  const map: Record<string, string> = {};

  for (const field of fields) {
    const suffix = field.startsWith(prefix) ? field.slice(prefix.length) : field;
    map[suffix] = field;
  }

  return map;
}

// ---------------------------------------------------------------------------
// Mismatch warnings
// ---------------------------------------------------------------------------

function warnOnMismatch(
  connectionName: string,
  sourceBySuffix: Record<string, string>,
  targetBySuffix: Record<string, string>
): void {
  const sourceSuffixes = new Set(Object.keys(sourceBySuffix));
  const targetSuffixes = new Set(Object.keys(targetBySuffix));

  const onlyInSource = [...sourceSuffixes].filter(s => !targetSuffixes.has(s));
  const onlyInTarget = [...targetSuffixes].filter(s => !sourceSuffixes.has(s));

  if (onlyInSource.length > 0 || onlyInTarget.length > 0) {
    const parts: string[] = [];
    if (onlyInSource.length > 0) {
      parts.push(`source-only fields: ${onlyInSource.join(", ")}`);
    }
    if (onlyInTarget.length > 0) {
      parts.push(`target-only fields: ${onlyInTarget.join(", ")}`);
    }
    console.warn(
      `[Formosaic] Connection "${connectionName}" has mismatched port fields — ${parts.join("; ")}. ` +
      `Unmatched fields will be skipped.`
    );
  }
}

// ---------------------------------------------------------------------------
// Effect building
// ---------------------------------------------------------------------------

function buildFieldEffect(
  effect: IFormConnection["effect"],
  sourceField: string
): Partial<IFieldEffect> {
  switch (effect) {
    case "copyValues":
    case "computeFrom":
      return { computedValue: `$root.${sourceField}` };

    case "hide":
      return { hidden: true };

    case "readOnly":
      return { readOnly: true };
  }
}
