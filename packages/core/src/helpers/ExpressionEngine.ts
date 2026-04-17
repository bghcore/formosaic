import { IEntityData } from "../utils";
import { getValueFunction } from "./ValueFunctionRegistry";
import { Parser } from "expr-eval";

/**
 * CSP-SAFE: This module uses expr-eval (https://www.npmjs.com/package/expr-eval) instead of
 * `new Function()` / `eval()`, making expression evaluation safe in environments with strict
 * Content-Security-Policies (CSP) that forbid `script-src 'unsafe-eval'`.
 *
 * Evaluates an expression string against form values.
 *
 * Supports:
 * - $values.fieldName for field references (including nested paths)
 * - $fn.name() for value function calls
 * - $parent.fieldName for parent entity references
 * - $root.fieldName alias for $values.fieldName
 * - Math functions (expr-eval builtins): round(), floor(), ceil(), abs(), min(), max(), sqrt(), pow(), log()
 * - Arithmetic: +, -, *, /
 * - Comparison: ==, !=, >, <, >=, <=
 * - Logical: and, or, not
 * - String concatenation via +
 *
 * @example
 *   "$values.quantity * $values.unitPrice"
 *   "$fn.setDate()"
 *   "$parent.category"
 *   "round($values.total * 100) / 100"
 */

// Private CSP-safe parser singleton.
// expr-eval 2.x exposes binaryOps/consts as plain objects on each Parser
// instance. We create our own fresh instance in a factory here rather than
// mutating the library's default — see audit P1-20. This keeps overrides
// isolated to our own internal parser.
function createInternalParser(): Parser {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parser: Parser = new Parser() as any;
  // Override + to handle string concatenation (string + number, number + string).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const origAdd = (parser as any).binaryOps["+"];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (parser as any).binaryOps["+"] = (a: unknown, b: unknown): unknown => {
    if (typeof a === "string" || typeof b === "string") return String(a) + String(b);
    return origAdd(a as number, b as number);
  };
  // Register NaN as a named constant so substituted "NaN" tokens evaluate correctly.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (parser as any).consts["NaN"] = NaN;
  return parser;
}

const _parser: Parser = createInternalParser();


export function evaluateExpression(
  expression: string,
  values: IEntityData,
  fieldName?: string,
  parentEntity?: IEntityData,
  currentUserId?: string
): unknown {
  // Optimisation: if the expression is a single $fn.name() call (nothing else),
  // execute the function and return its result directly — preserving complex types
  // such as Date objects that cannot be round-tripped through text substitution.
  const singleFnMatch = /^\s*\$fn\.([a-zA-Z_][a-zA-Z0-9_]*)\(\)\s*$/.exec(expression);
  if (singleFnMatch) {
    const fn = getValueFunction(singleFnMatch[1]);
    if (!fn) return undefined;
    return fn({
      fieldName: fieldName ?? "",
      fieldValue: fieldName ? values[fieldName] as string : undefined,
      values,
      parentEntity,
      currentUserId,
    });
  }

  // Step 1 – resolve $fn.name() calls by executing registered value functions and
  // substituting their results as literal tokens into the expression string.
  let resolved = expression.replace(
    /\$fn\.([a-zA-Z_][a-zA-Z0-9_]*)\(\)/g,
    (_, fnName: string) => {
      const fn = getValueFunction(fnName);
      if (fn) {
        const result = fn({
          fieldName: fieldName ?? "",
          fieldValue: fieldName ? values[fieldName] as string : undefined,
          values,
          parentEntity,
          currentUserId,
        });
        if (result === null || result === undefined) return "NaN";
        if (typeof result === "string") return JSON.stringify(result);
        if (result instanceof Date) return String(result.getTime());
        return String(result);
      }
      // Unknown function: substitute NaN so arithmetic remains well-behaved
      return "NaN";
    }
  );

  // Step 2 – substitute $parent.fieldName, $root.fieldName, $values.fieldName with
  // their literal values inline. null/undefined values are substituted as the token
  // "NaN" so that arithmetic expressions (e.g. qty * price) return NaN rather than
  // throwing, preserving backward-compatible behaviour.

  const serializeValue = (value: unknown): string => {
    if (value === null || value === undefined) return "NaN";
    if (typeof value === "string") return JSON.stringify(value);
    if (typeof value === "boolean") return value ? "true" : "false";
    if (value instanceof Date) return String(value.getTime());
    return String(value);
  };

  // Replace $parent.fieldName
  resolved = resolved.replace(
    /\$parent\.([a-zA-Z_][a-zA-Z0-9_.]*)/g,
    (_, fieldPath: string) => serializeValue(getNestedValue(parentEntity ?? {}, fieldPath))
  );

  // Replace $root.fieldName (alias for $values)
  resolved = resolved.replace(
    /\$root\.([a-zA-Z_][a-zA-Z0-9_.]*)/g,
    (_, fieldPath: string) => serializeValue(getNestedValue(values, fieldPath))
  );

  // Replace $values.fieldName
  resolved = resolved.replace(
    /\$values\.([a-zA-Z_][a-zA-Z0-9_.]*)/g,
    (_, fieldPath: string) => serializeValue(getNestedValue(values, fieldPath))
  );

  // Step 3 – evaluate with the CSP-safe expr-eval parser
  try {
    return _parser.evaluate(resolved, {});
  } catch {
    return undefined;
  }
}

function getNestedValue(obj: IEntityData, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    // Per audit P0-10: refuse to traverse prototype-pollution keys.
    if (part === "__proto__" || part === "constructor" || part === "prototype") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

/**
 * Extracts field names referenced in an expression via $values.fieldName or $root.fieldName.
 */
export function extractExpressionDependencies(expression: string): string[] {
  const deps = new Set<string>();
  const valuesRegex = /\$(?:values|root)\.([a-zA-Z_][a-zA-Z0-9_.]*)/g;
  let match;
  while ((match = valuesRegex.exec(expression)) !== null) {
    deps.add(match[1]);
  }
  return [...deps];
}

/**
 * Extracts value function names referenced via $fn.name() syntax.
 */
export function extractFunctionDependencies(expression: string): string[] {
  const fns = new Set<string>();
  const fnRegex = /\$fn\.([a-zA-Z_][a-zA-Z0-9_]*)\(\)/g;
  let match;
  while ((match = fnRegex.exec(expression)) !== null) {
    fns.add(match[1]);
  }
  return [...fns];
}
