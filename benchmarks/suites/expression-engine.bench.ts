import { describe, bench } from "vitest";
import { evaluateExpression, extractExpressionDependencies } from "../../packages/core/src/helpers/ExpressionEngine";
import { registerValueFunctions, resetValueFunctionRegistry } from "../../packages/core/src/helpers/ValueFunctionRegistry";

// Set up test value functions before benchmarks
registerValueFunctions({
  setDate: () => new Date(),
  getCurrentYear: () => new Date().getFullYear(),
  uppercase: ({ fieldValue }) => typeof fieldValue === "string" ? fieldValue.toUpperCase() : fieldValue,
});

const baseValues: Record<string, unknown> = {
  quantity: 10,
  unitPrice: 25.5,
  discount: 0.1,
  tax: 0.08,
  name: "John Doe",
  status: "active",
  total: 255,
  subtotal: 200,
  shipping: 15,
  weight: 3.5,
};

const parentEntity: Record<string, unknown> = {
  category: "electronics",
  region: "US",
  tier: "premium",
};

// --- Simple field references ---

describe("evaluateExpression - simple field references", () => {
  bench("single field ($values.quantity)", () => {
    evaluateExpression("$values.quantity", baseValues);
  });

  bench("two fields ($values.quantity + $values.unitPrice)", () => {
    evaluateExpression("$values.quantity + $values.unitPrice", baseValues);
  });

  bench("three fields ($values.quantity * $values.unitPrice - $values.discount)", () => {
    evaluateExpression("$values.quantity * $values.unitPrice - $values.discount", baseValues);
  });
});

// --- Arithmetic expressions ---

describe("evaluateExpression - arithmetic", () => {
  bench("multiplication ($values.quantity * $values.unitPrice)", () => {
    evaluateExpression("$values.quantity * $values.unitPrice", baseValues);
  });

  bench("compound ($values.subtotal + $values.shipping - ($values.subtotal * $values.discount))", () => {
    evaluateExpression(
      "$values.subtotal + $values.shipping - ($values.subtotal * $values.discount)",
      baseValues
    );
  });

  bench("Math.round($values.total * $values.tax * 100) / 100", () => {
    evaluateExpression(
      "Math.round($values.total * $values.tax * 100) / 100",
      baseValues
    );
  });

  bench("Math.max($values.quantity, $values.weight) * $values.unitPrice", () => {
    evaluateExpression(
      "Math.max($values.quantity, $values.weight) * $values.unitPrice",
      baseValues
    );
  });
});

// --- Function calls ---

describe("evaluateExpression - $fn calls", () => {
  bench("$fn.setDate()", () => {
    evaluateExpression("$fn.setDate()", baseValues);
  });

  bench("$fn.getCurrentYear()", () => {
    evaluateExpression("$fn.getCurrentYear()", baseValues);
  });

  bench("expression with function: $fn.getCurrentYear() + 1", () => {
    evaluateExpression("$fn.getCurrentYear() + 1", baseValues);
  });
});

// --- Parent entity references ---

describe("evaluateExpression - $parent references", () => {
  bench("$parent.category", () => {
    evaluateExpression("$parent.category", baseValues, "field_0", parentEntity);
  });

  bench("$parent.tier", () => {
    evaluateExpression("$parent.tier", baseValues, "field_0", parentEntity);
  });
});

// --- $root alias ---

describe("evaluateExpression - $root alias", () => {
  bench("$root.quantity", () => {
    evaluateExpression("$root.quantity", baseValues);
  });

  bench("$root.quantity * $root.unitPrice", () => {
    evaluateExpression("$root.quantity * $root.unitPrice", baseValues);
  });
});

// --- String expressions ---

describe("evaluateExpression - string concatenation", () => {
  bench("string concat ($values.name + ' - ' + $values.status)", () => {
    evaluateExpression('$values.name + " - " + $values.status', baseValues);
  });
});

// --- Comparison expressions ---

describe("evaluateExpression - comparisons", () => {
  bench("$values.quantity > 5", () => {
    evaluateExpression("$values.quantity > 5", baseValues);
  });

  bench("$values.total >= 200 && $values.discount < 0.5", () => {
    evaluateExpression("$values.total >= 200 && $values.discount < 0.5", baseValues);
  });
});

// --- extractExpressionDependencies ---

describe("extractExpressionDependencies", () => {
  bench("single reference", () => {
    extractExpressionDependencies("$values.quantity");
  });

  bench("3 references", () => {
    extractExpressionDependencies("$values.quantity * $values.unitPrice - $values.discount");
  });

  bench("5 references with $root", () => {
    extractExpressionDependencies(
      "$values.a + $values.b * $root.c - $values.d + $root.e"
    );
  });

  bench("expression with $fn (no field deps)", () => {
    extractExpressionDependencies("$fn.setDate()");
  });

  bench("mixed $fn + $values", () => {
    extractExpressionDependencies("$fn.getCurrentYear() + $values.quantity");
  });
});

// --- Edge cases ---

describe("evaluateExpression - edge cases", () => {
  bench("undefined field reference", () => {
    evaluateExpression("$values.nonexistent", baseValues);
  });

  bench("unknown function", () => {
    evaluateExpression("$fn.unknownFn()", baseValues);
  });

  bench("pure literal (no references)", () => {
    evaluateExpression("42", baseValues);
  });

  bench("empty string expression", () => {
    evaluateExpression('""', baseValues);
  });
});
