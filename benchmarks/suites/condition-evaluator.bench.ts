import { describe, bench } from "vitest";
import { evaluateCondition } from "../../packages/core/src/helpers/ConditionEvaluator";
import type { IFieldCondition } from "../../packages/core/src/types/ICondition";
import {
  generateConditionTree,
  generateFlatCondition,
  generateConditionValues,
} from "../generators/generateConditionTree";

// --- Individual operator benchmarks ---

describe("evaluateCondition - individual operators", () => {
  const values = { status: "active", count: 42, name: "John Doe", tags: ["a", "b"], empty: "" };

  const operators: Array<{ label: string; condition: IFieldCondition; vals?: Record<string, unknown> }> = [
    { label: "equals (string)", condition: { field: "status", operator: "equals", value: "active" } },
    { label: "equals (number)", condition: { field: "count", operator: "equals", value: 42 } },
    { label: "notEquals", condition: { field: "status", operator: "notEquals", value: "inactive" } },
    { label: "greaterThan", condition: { field: "count", operator: "greaterThan", value: 10 } },
    { label: "lessThan", condition: { field: "count", operator: "lessThan", value: 100 } },
    { label: "greaterThanOrEqual", condition: { field: "count", operator: "greaterThanOrEqual", value: 42 } },
    { label: "lessThanOrEqual", condition: { field: "count", operator: "lessThanOrEqual", value: 42 } },
    { label: "contains", condition: { field: "name", operator: "contains", value: "John" } },
    { label: "notContains", condition: { field: "name", operator: "notContains", value: "Jane" } },
    { label: "startsWith", condition: { field: "name", operator: "startsWith", value: "John" } },
    { label: "endsWith", condition: { field: "name", operator: "endsWith", value: "Doe" } },
    { label: "in", condition: { field: "status", operator: "in", value: ["active", "pending"] } },
    { label: "notIn", condition: { field: "status", operator: "notIn", value: ["closed", "deleted"] } },
    { label: "isEmpty", condition: { field: "empty", operator: "isEmpty" } },
    { label: "isNotEmpty", condition: { field: "status", operator: "isNotEmpty" } },
    { label: "matches (regex)", condition: { field: "name", operator: "matches", value: "^John.*" } },
  ];

  for (const { label, condition } of operators) {
    bench(label, () => {
      evaluateCondition(condition, values);
    });
  }
});

// --- Nested condition trees ---

describe("evaluateCondition - nested depth", () => {
  const depths = [2, 5, 10];

  for (const depth of depths) {
    // breadth=2 means 2^depth leaf conditions
    const leafCount = Math.pow(2, depth);
    const tree = generateConditionTree(depth, 2);
    const values = generateConditionValues(leafCount);

    bench(`depth ${depth} (${leafCount} leaves, breadth 2)`, () => {
      evaluateCondition(tree, values);
    });
  }
});

describe("evaluateCondition - nested depth with breadth 3", () => {
  const depths = [2, 4, 6];

  for (const depth of depths) {
    const leafCount = Math.pow(3, depth);
    const tree = generateConditionTree(depth, 3);
    const values = generateConditionValues(leafCount);

    bench(`depth ${depth} (${leafCount} leaves, breadth 3)`, () => {
      evaluateCondition(tree, values);
    });
  }
});

// --- Flat AND/OR with many conditions ---

describe("evaluateCondition - flat AND", () => {
  const counts = [2, 5, 10, 20, 50];

  for (const count of counts) {
    const tree = generateFlatCondition(count, "and");
    const values = generateConditionValues(count);

    bench(`AND with ${count} conditions`, () => {
      evaluateCondition(tree, values);
    });
  }
});

describe("evaluateCondition - flat OR", () => {
  const counts = [2, 5, 10, 20, 50];

  for (const count of counts) {
    const tree = generateFlatCondition(count, "or");
    const values = generateConditionValues(count);

    bench(`OR with ${count} conditions`, () => {
      evaluateCondition(tree, values);
    });
  }
});

// --- Short-circuit performance ---

describe("evaluateCondition - short-circuit", () => {
  // AND where first condition is false (should bail early)
  bench("AND short-circuit (first false, 20 conditions)", () => {
    const tree = generateFlatCondition(20, "and");
    // field_0 is missing from values -> isEmpty operator on field_0 won't match "equals"
    const values: Record<string, unknown> = {};
    for (let i = 1; i < 20; i++) {
      values[`field_${i}`] = `value_${i}`;
    }
    evaluateCondition(tree, values);
  });

  // OR where first condition is true (should bail early)
  bench("OR short-circuit (first true, 20 conditions)", () => {
    const tree = generateFlatCondition(20, "or");
    const values = generateConditionValues(20);
    evaluateCondition(tree, values);
  });
});

// --- NOT operator ---

describe("evaluateCondition - NOT operator", () => {
  bench("NOT wrapping simple condition", () => {
    evaluateCondition(
      { operator: "not", conditions: [{ field: "status", operator: "equals", value: "inactive" }] },
      { status: "active" }
    );
  });

  bench("NOT wrapping nested AND (5 conditions)", () => {
    const inner = generateFlatCondition(5, "and");
    const values = generateConditionValues(5);
    evaluateCondition({ operator: "not", conditions: [inner] }, values);
  });
});
