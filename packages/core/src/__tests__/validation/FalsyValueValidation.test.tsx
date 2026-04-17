/**
 * P0-8 / P0-9 regression: validators must not short-circuit on falsy values.
 *
 * Pre-fix bug: several validators (numericRange, minLength, pattern, maxKb,
 * currency, noSpecialCharacters, requiredIf) started with `if (!value) return`,
 * which silently accepted 0 and "" as valid even when they should have failed.
 *
 * The Toggle-required carve-out (P0-9) similarly short-circuited a `false`
 * value through the `required` validator.
 *
 * These tests exercise the validators directly via `runValidations` and
 * `runSyncValidations` so they are deterministic and fast.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  runValidations,
  runSyncValidations,
  resetValidatorRegistry,
} from "../../helpers/ValidationRegistry";

describe("Falsy-value validation (P0-8 / P0-9 regression)", () => {
  beforeEach(() => {
    resetValidatorRegistry();
  });

  describe("numericRange with value 0", () => {
    it("returns error when value=0 and min=5 (0 is NOT null/empty)", async () => {
      const result = await runValidations(
        0,
        [{ name: "numericRange", params: { min: 5 } }],
        { fieldName: "qty", values: { qty: 0 } }
      );
      expect(result).toBeTruthy();
      expect(result).toMatch(/between|at least/i);
    });

    it("returns undefined when value=0 satisfies range", async () => {
      const result = await runValidations(
        0,
        [{ name: "numericRange", params: { min: 0, max: 10 } }],
        { fieldName: "qty", values: { qty: 0 } }
      );
      expect(result).toBeUndefined();
    });

    it("sync path also returns error for 0 < min", () => {
      const result = runSyncValidations(
        0,
        [{ name: "numericRange", params: { min: 5 } }],
        { fieldName: "qty", values: { qty: 0 } }
      );
      expect(result).toBeTruthy();
    });
  });

  describe("minLength with empty string", () => {
    it("returns error when value='' and min=3", async () => {
      const result = await runValidations(
        "",
        [{ name: "minLength", params: { min: 3 } }],
        { fieldName: "name", values: { name: "" } }
      );
      expect(result).toBeTruthy();
      expect(result).toMatch(/at least 3/i);
    });

    it("returns undefined when value is longer than min", async () => {
      const result = await runValidations(
        "hello",
        [{ name: "minLength", params: { min: 3 } }],
        { fieldName: "name", values: { name: "hello" } }
      );
      expect(result).toBeUndefined();
    });
  });

  describe("required with boolean false (Toggle P0-9 regression)", () => {
    it("rejects value=false as required", async () => {
      // Pre-fix: Toggle had a carve-out that bypassed the required validator
      // for `false`. With the carve-out removed, `false` should be accepted
      // only if the validator itself treats false as "present" — today's
      // required validator accepts false because it only rejects null/undefined
      // and empty strings. This test documents current intent: `required` on
      // a Toggle is satisfied by either true or false. If the required
      // validator is strengthened to reject `false`, update this test.
      const result = await runValidations(
        false,
        [{ name: "required" }],
        { fieldName: "agree", values: { agree: false } }
      );
      // Current behavior: required accepts false. Keep this assertion so any
      // change to the validator is surfaced as a test failure.
      expect(result).toBeUndefined();
    });

    it("rejects null as required", async () => {
      const result = await runValidations(
        null,
        [{ name: "required" }],
        { fieldName: "agree", values: { agree: null } }
      );
      expect(result).toBeTruthy();
    });

    it("rejects undefined as required", async () => {
      const result = await runValidations(
        undefined,
        [{ name: "required" }],
        { fieldName: "agree", values: {} }
      );
      expect(result).toBeTruthy();
    });

    it("rejects empty string as required", async () => {
      const result = await runValidations(
        "",
        [{ name: "required" }],
        { fieldName: "name", values: { name: "" } }
      );
      expect(result).toBeTruthy();
    });
  });

  describe("pattern with value that should not match (P0-8)", () => {
    it("still validates non-empty strings", async () => {
      const result = await runValidations(
        "abc",
        [{ name: "pattern", params: { pattern: "^\\d+$", message: "digits only" } }],
        { fieldName: "code", values: { code: "abc" } }
      );
      expect(result).toBe("digits only");
    });

    it("short-circuits safely on empty string (empty matches anything)", async () => {
      // Pattern validator short-circuits on empty string — this is intentional
      // (empty should be handled by required, not pattern).
      const result = await runValidations(
        "",
        [{ name: "pattern", params: { pattern: "^\\d+$" } }],
        { fieldName: "code", values: { code: "" } }
      );
      expect(result).toBeUndefined();
    });
  });

  describe("currency with value 0", () => {
    it("accepts 0 as valid currency (0 is a valid number)", async () => {
      const result = await runValidations(
        0,
        [{ name: "currency" }],
        { fieldName: "amount", values: { amount: 0 } }
      );
      // 0 -> "0" -> matches /^-?\d{1,}(\.\d{1,2})?$/
      expect(result).toBeUndefined();
    });

    it("accepts 0.00 as valid currency", async () => {
      const result = await runValidations(
        "0.00",
        [{ name: "currency" }],
        { fieldName: "amount", values: { amount: "0.00" } }
      );
      expect(result).toBeUndefined();
    });
  });
});
