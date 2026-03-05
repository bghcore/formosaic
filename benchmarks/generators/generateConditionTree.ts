import type { ICondition, IFieldCondition, ILogicalCondition } from "../../packages/core/src/types/ICondition";

const OPERATORS: IFieldCondition["operator"][] = [
  "equals", "notEquals", "greaterThan", "lessThan",
  "greaterThanOrEqual", "lessThanOrEqual", "contains", "notContains",
  "startsWith", "endsWith", "in", "notIn",
  "isEmpty", "isNotEmpty", "matches",
];

/**
 * Generates a leaf field condition using a deterministic operator.
 */
function generateLeafCondition(index: number): IFieldCondition {
  const operator = OPERATORS[index % OPERATORS.length];
  const field = `field_${index}`;

  // Operators that don't require a value
  if (operator === "isEmpty" || operator === "isNotEmpty") {
    return { field, operator };
  }
  // Array-valued operators
  if (operator === "in" || operator === "notIn") {
    return { field, operator, value: [`val_${index}_a`, `val_${index}_b`] };
  }
  // Regex
  if (operator === "matches") {
    return { field, operator, value: `^test_${index}$` };
  }
  // Numeric operators
  if (operator === "greaterThan" || operator === "lessThan" ||
      operator === "greaterThanOrEqual" || operator === "lessThanOrEqual") {
    return { field, operator, value: index * 10 };
  }
  // String/equality operators
  return { field, operator, value: `value_${index}` };
}

/**
 * Generates a nested condition tree of a given depth.
 *
 * At depth 0, returns a leaf condition.
 * At depth > 0, returns a logical condition (AND/OR) containing
 * `breadth` child conditions, each at depth-1.
 *
 * @param depth - Nesting depth (0 = leaf)
 * @param breadth - Number of children per logical node
 * @param startIndex - Starting field index for deterministic naming
 */
export function generateConditionTree(
  depth: number,
  breadth: number = 2,
  startIndex: number = 0
): ICondition {
  if (depth <= 0) {
    return generateLeafCondition(startIndex);
  }

  const logicalOp: ILogicalCondition["operator"] = depth % 2 === 0 ? "and" : "or";
  const conditions: ICondition[] = [];

  for (let i = 0; i < breadth; i++) {
    // Spread field indices across children to avoid reusing the same fields
    const childStartIndex = startIndex + i * Math.pow(breadth, depth - 1);
    conditions.push(generateConditionTree(depth - 1, breadth, childStartIndex));
  }

  return { operator: logicalOp, conditions };
}

/**
 * Generates a flat condition with N siblings under a single AND/OR.
 * Useful for benchmarking wide-but-shallow condition trees.
 */
export function generateFlatCondition(
  count: number,
  logicalOp: "and" | "or" = "and"
): ICondition {
  const conditions: ICondition[] = [];
  for (let i = 0; i < count; i++) {
    conditions.push(generateLeafCondition(i));
  }
  return { operator: logicalOp, conditions };
}

/**
 * Generates entity data that satisfies generated conditions.
 * Populates fields with values that make equals/contains/etc. conditions pass.
 */
export function generateConditionValues(maxFieldIndex: number): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (let i = 0; i <= maxFieldIndex; i++) {
    values[`field_${i}`] = `value_${i}`;
  }
  return values;
}
