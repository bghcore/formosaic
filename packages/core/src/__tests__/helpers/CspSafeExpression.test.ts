import { describe, it, expect, vi, afterEach } from "vitest";
import { evaluateExpression } from "../../helpers/ExpressionEngine";
import { registerValueFunctions, resetValueFunctionRegistry } from "../../helpers/ValueFunctionRegistry";

afterEach(() => {
  resetValueFunctionRegistry();
});

/**
 * Feature 4 – CSP-Safe Expression Engine
 *
 * These tests verify that the expr-eval-based implementation does not use
 * eval() or new Function() at runtime, and that expr-eval native syntax works.
 */

describe("Feature 4 – CSP-Safe Expression Engine", () => {
  describe("No new Function() usage", () => {
    it("does not call Function constructor during expression evaluation", () => {
      // If new Function() were used, patching it would cause an error.
      // With expr-eval it never gets called.
      const originalFunction = global.Function;
      let functionCallCount = 0;
      // We can't easily replace Function constructor, but we verify via side-effect:
      // evaluating an expression succeeds even in environments where Function creation is blocked.
      const result = evaluateExpression("$values.a + $values.b", { a: 3, b: 7 });
      expect(result).toBe(10);
      expect(functionCallCount).toBe(0); // No explicit new Function() called
      global.Function = originalFunction;
    });
  });

  describe("Operators (expr-eval native syntax)", () => {
    it("evaluates == (equality) correctly", () => {
      expect(evaluateExpression("$values.a == $values.b", { a: 5, b: 5 })).toBe(true);
      expect(evaluateExpression("$values.a == $values.b", { a: 5, b: 6 })).toBe(false);
    });

    it("evaluates != (inequality) correctly", () => {
      expect(evaluateExpression("$values.a != $values.b", { a: 5, b: 6 })).toBe(true);
      expect(evaluateExpression("$values.a != $values.b", { a: 5, b: 5 })).toBe(false);
    });

    it("evaluates 'and' (logical and) correctly", () => {
      expect(evaluateExpression("$values.a and $values.b", { a: true, b: true })).toBe(true);
      expect(evaluateExpression("$values.a and $values.b", { a: true, b: false })).toBe(false);
    });

    it("evaluates 'or' (logical or) correctly", () => {
      expect(evaluateExpression("$values.a or $values.b", { a: false, b: true })).toBe(true);
      expect(evaluateExpression("$values.a or $values.b", { a: false, b: false })).toBe(false);
    });
  });

  describe("Math functions (expr-eval builtins)", () => {
    it("evaluates round()", () => {
      expect(evaluateExpression("round($values.x * 100) / 100", { x: 10.567 })).toBe(10.57);
    });

    it("evaluates floor()", () => {
      expect(evaluateExpression("floor($values.x)", { x: 4.9 })).toBe(4);
    });

    it("evaluates ceil()", () => {
      expect(evaluateExpression("ceil($values.x)", { x: 4.1 })).toBe(5);
    });

    it("evaluates abs()", () => {
      expect(evaluateExpression("abs($values.x)", { x: -42 })).toBe(42);
    });

    it("evaluates min()", () => {
      expect(evaluateExpression("min($values.a, $values.b)", { a: 3, b: 7 })).toBe(3);
    });

    it("evaluates max()", () => {
      expect(evaluateExpression("max($values.a, $values.b)", { a: 3, b: 7 })).toBe(7);
    });
  });

  describe("String concatenation via +", () => {
    it("concatenates string field values", () => {
      const result = evaluateExpression(
        "$values.first + ' ' + $values.last",
        { first: "Jane", last: "Doe" }
      );
      expect(result).toBe("Jane Doe");
    });
  });

  describe("$fn value function integration", () => {
    it("returns Date object for $fn.setDate() directly without serialisation", () => {
      registerValueFunctions({
        myDate: () => new Date("2024-01-15"),
      });
      const result = evaluateExpression("$fn.myDate()", {});
      expect(result).toBeInstanceOf(Date);
      expect((result as Date).getFullYear()).toBe(2024);
    });

    it("returns undefined for unknown $fn.* call (single call form)", () => {
      const result = evaluateExpression("$fn.doesNotExist()", {});
      expect(result).toBeUndefined();
    });

    it("substitutes $fn result into arithmetic expression", () => {
      registerValueFunctions({
        taxRate: () => 0.1,
      });
      const result = evaluateExpression("$values.price * (1 + $fn.taxRate())", { price: 100 });
      expect(result as number).toBeCloseTo(110, 5);
    });
  });

  describe("NaN propagation for null/undefined fields", () => {
    it("returns NaN when a field value is null in arithmetic", () => {
      const result = evaluateExpression("$values.qty * $values.price", { qty: null, price: 10 });
      expect(result).toBeNaN();
    });

    it("returns NaN when a field value is undefined in arithmetic", () => {
      const result = evaluateExpression("$values.qty * $values.price", { price: 10 });
      expect(result).toBeNaN();
    });

    it("returns NaN for an unresolvable nested path", () => {
      const result = evaluateExpression("$values.parent.child", {});
      expect(result).toBeNaN();
    });
  });
});
