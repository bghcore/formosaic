/**
 * ExpressionInterpolator — lightweight template expression evaluator.
 *
 * Resolves `{{expression}}` strings at template resolution time.
 * Returns any JSON type (string, boolean, number, array, object).
 *
 * Supported syntax:
 * - `params.key`                          — param property access
 * - `$lookup.table.key`                   — lookup table dot access
 * - `$lookup.table[params.key]`           — lookup table bracket access with dynamic key
 * - `'string literal'`                    — single-quoted string literals
 * - `true` / `false`                      — boolean literals
 * - numeric literals                      — number literals
 * - `==` / `!=`                           — equality / inequality
 * - `condition ? trueExpr : falseExpr`   — ternary (right-associative, nestable)
 *
 * This is intentionally separate from ExpressionEngine.ts (which uses expr-eval
 * for runtime $values/$fn expressions). This module is CSP-safe and uses no eval.
 */

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Interpolate a single value.
 * - If `value` is a string matching `^{{...}}$`, evaluate the inner expression.
 * - Otherwise return `value` as-is (including non-strings).
 */
export function interpolate(
  value: string,
  params: Record<string, unknown>,
  lookups: Record<string, unknown>
): unknown {
  if (typeof value !== "string") return value;

  const trimmed = value.trim();
  if (trimmed.startsWith("{{") && trimmed.endsWith("}}")) {
    const expr = trimmed.slice(2, -2).trim();
    return evaluateExpr(expr, params, lookups);
  }

  return value;
}

/**
 * Recursively walk an object or array, calling `interpolate` on every string
 * leaf value. Non-string leaves are left untouched.
 */
export function interpolateDeep(
  obj: unknown,
  params: Record<string, unknown>,
  lookups: Record<string, unknown>
): unknown {
  if (Array.isArray(obj)) {
    return obj.map((item) => interpolateDeep(item, params, lookups));
  }
  if (obj !== null && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
      result[key] = interpolateDeep(val, params, lookups);
    }
    return result;
  }
  if (typeof obj === "string") {
    return interpolate(obj, params, lookups);
  }
  return obj;
}

// ---------------------------------------------------------------------------
// Expression evaluator (private)
// ---------------------------------------------------------------------------

/**
 * Evaluate a single expression string (no `{{ }}` wrappers).
 */
function evaluateExpr(
  expr: string,
  params: Record<string, unknown>,
  lookups: Record<string, unknown>
): unknown {
  expr = expr.trim();

  // 1. Ternary: find the first `?` that is not inside single quotes
  const qPos = findTernary(expr);
  if (qPos !== -1) {
    const condition = expr.slice(0, qPos).trim();
    const rest = expr.slice(qPos + 1).trim();
    // Find matching `:` (right-associative: skip nested ternaries)
    const cPos = findColon(rest);
    if (cPos !== -1) {
      const trueBranch = rest.slice(0, cPos).trim();
      const falseBranch = rest.slice(cPos + 1).trim();
      const condResult = evaluateExpr(condition, params, lookups);
      return condResult
        ? evaluateExpr(trueBranch, params, lookups)
        : evaluateExpr(falseBranch, params, lookups);
    }
  }

  // 2. Equality / inequality: `left == right` or `left != right`
  //    We scan right-to-left to catch the last occurrence (avoids false matches
  //    inside string literals handled below, but simple scan is fine here since
  //    we've already stripped ternary branches above).
  const eqResult = tryParseEquality(expr, params, lookups);
  if (eqResult !== undefined) return eqResult;

  // 3. String literal: 'value'
  if (expr.startsWith("'") && expr.endsWith("'")) {
    return expr.slice(1, -1);
  }

  // 4. Boolean literals
  if (expr === "true") return true;
  if (expr === "false") return false;

  // 5. Numeric literal
  if (/^-?\d+(\.\d+)?$/.test(expr)) return Number(expr);

  // Per audit P0-7: the $lookup table-name segment comes from authored
  // config and can be arbitrary. Refuse to traverse prototype-pollution
  // keys, plus reject any bracket-derived subKey that hits them. Keys
  // traversed by `getNestedValue` are already guarded.
  const isPollutionKey = (k: string): boolean =>
    k === "__proto__" || k === "constructor" || k === "prototype";

  // 6. $lookup.table[params.key] — bracket access
  const bracketMatch = /^\$lookup\.([a-zA-Z_][a-zA-Z0-9_]*)\.([a-zA-Z_][a-zA-Z0-9_]*)\[(.+)\]$/.exec(expr);
  if (bracketMatch) {
    const [, tableName, subKey, bracketExpr] = bracketMatch;
    if (isPollutionKey(tableName) || isPollutionKey(subKey)) return undefined;
    const table = lookups[tableName] as Record<string, unknown> | undefined;
    if (!table) return undefined;
    const subTable = table[subKey] as Record<string, unknown> | undefined;
    if (!subTable) return undefined;
    const keyValue = evaluateExpr(bracketExpr.trim(), params, lookups);
    const bracketKey = String(keyValue);
    if (isPollutionKey(bracketKey)) return undefined;
    return subTable[bracketKey];
  }

  // Also handle $lookup.table[params.key] without an intermediate subkey
  const bracketTopMatch = /^\$lookup\.([a-zA-Z_][a-zA-Z0-9_]*)\[(.+)\]$/.exec(expr);
  if (bracketTopMatch) {
    const [, tableName, bracketExpr] = bracketTopMatch;
    if (isPollutionKey(tableName)) return undefined;
    const table = lookups[tableName] as Record<string, unknown> | undefined;
    if (!table) return undefined;
    const keyValue = evaluateExpr(bracketExpr.trim(), params, lookups);
    const bracketKey = String(keyValue);
    if (isPollutionKey(bracketKey)) return undefined;
    return (table as Record<string, unknown>)[bracketKey];
  }

  // 7. $lookup.table.key — dot access (may have multiple segments)
  if (expr.startsWith("$lookup.")) {
    const path = expr.slice("$lookup.".length); // e.g. "stateOptions.US"
    const parts = path.split(".");
    const [tableName, ...rest] = parts;
    if (isPollutionKey(tableName)) return undefined;
    const table = lookups[tableName];
    if (table === undefined) return undefined;
    return getNestedValue(table as Record<string, unknown>, rest.join("."));
  }

  // 8. params.key — dot access on params
  if (expr.startsWith("params.")) {
    const path = expr.slice("params.".length);
    return getNestedValue(params, path);
  }

  // Unknown expression — return undefined
  return undefined;
}

// ---------------------------------------------------------------------------
// Equality / inequality parsing
// ---------------------------------------------------------------------------

/**
 * Attempt to parse `left == right` or `left != right` at the top level.
 * Returns the boolean result, or `undefined` if the expression does not
 * contain a top-level equality operator.
 */
function tryParseEquality(
  expr: string,
  params: Record<string, unknown>,
  lookups: Record<string, unknown>
): boolean | undefined {
  // Scan for `==` or `!=` outside single-quoted strings
  let inString = false;
  for (let i = 0; i < expr.length - 1; i++) {
    const ch = expr[i];
    if (ch === "'" && !inString) { inString = true; continue; }
    if (ch === "'" && inString) { inString = false; continue; }
    if (inString) continue;

    if (expr[i] === "!" && expr[i + 1] === "=") {
      const left = evaluateExpr(expr.slice(0, i).trim(), params, lookups);
      const right = evaluateExpr(expr.slice(i + 2).trim(), params, lookups);
      return left !== right;
    }
    if (expr[i] === "=" && expr[i + 1] === "=") {
      const left = evaluateExpr(expr.slice(0, i).trim(), params, lookups);
      const right = evaluateExpr(expr.slice(i + 2).trim(), params, lookups);
      return left === right;
    }
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Ternary helpers
// ---------------------------------------------------------------------------

/**
 * Find the index of the first `?` in `expr` that is not inside single quotes.
 * Returns -1 if not found.
 */
function findTernary(expr: string): number {
  let inString = false;
  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (ch === "'" && !inString) { inString = true; continue; }
    if (ch === "'" && inString) { inString = false; continue; }
    if (!inString && ch === "?") return i;
  }
  return -1;
}

/**
 * Find the index of the `:` that separates the true-branch from the
 * false-branch of a ternary, in the string `rest` (the part after `?`).
 *
 * We must handle right-associative nesting: the `:` we want is the one
 * matching the outermost ternary, not a nested one. We track nesting depth
 * by counting unquoted `?` characters (each one requires one `:` to close).
 */
function findColon(rest: string): number {
  let inString = false;
  let depth = 0; // number of unmatched `?` characters seen so far
  for (let i = 0; i < rest.length; i++) {
    const ch = rest[i];
    if (ch === "'" && !inString) { inString = true; continue; }
    if (ch === "'" && inString) { inString = false; continue; }
    if (inString) continue;
    if (ch === "?") { depth++; continue; }
    if (ch === ":") {
      if (depth === 0) return i;
      depth--;
    }
  }
  return -1;
}

// ---------------------------------------------------------------------------
// Property access helper
// ---------------------------------------------------------------------------

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  if (!path) return obj;
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    // Per audit P0-10: refuse to traverse prototype-pollution keys. Without
    // this, a malicious params object could reach Object.prototype or the
    // constructor function via e.g. `{{params.__proto__.polluted}}`.
    if (part === "__proto__" || part === "constructor" || part === "prototype") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}
