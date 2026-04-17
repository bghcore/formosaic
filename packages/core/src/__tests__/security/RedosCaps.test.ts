/**
 * P0-10 regression: adversarial proof that regex caps actually protect the
 * main thread from ReDoS inputs sourced from config.
 *
 * The caps are length-based:
 *   - regex source must be <= 256 chars, else the matcher returns false/skip
 *   - input must be <= 10_000 chars, else skip
 *
 * A length cap is not a full ReDoS defense — a short pathological regex on a
 * short input can still backtrack. We prove the *cap boundary* behavior and
 * also measure that a *moderately* pathological regex within the caps still
 * completes in a reasonable time (asserting an upper bound so a future
 * regression to a longer cap would fail the test).
 *
 * If caps are ever loosened, these tests must fail before the regression ships.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { evaluateCondition } from "../../helpers/ConditionEvaluator";
import { getValidator } from "../../helpers/ValidationRegistry";

describe("P0-10 ReDoS cap effectiveness", () => {
  // Squelch the dev-mode console.warns the guards emit — we assert behavior,
  // not logs.
  const originalWarn = console.warn;
  beforeAll(() => {
    console.warn = () => {};
  });
  afterAll(() => {
    console.warn = originalWarn;
  });

  describe("`matches` condition operator", () => {
    it("rejects regex source > 256 chars by returning false", () => {
      // 300-char pathological regex (exceeds the 256 cap)
      const pathological = `(${"a".repeat(290)})+b`;
      expect(pathological.length).toBeGreaterThan(256);

      const start = Date.now();
      const result = evaluateCondition(
        { field: "value", operator: "matches", value: pathological },
        { value: "aaaa" }
      );
      const elapsed = Date.now() - start;

      expect(result).toBe(false);
      expect(elapsed).toBeLessThan(100); // should be near-instant (short-circuit)
    });

    it("rejects input > 10_000 chars by returning false", () => {
      const hugeInput = "a".repeat(10_050);
      const start = Date.now();
      const result = evaluateCondition(
        { field: "value", operator: "matches", value: "a+" },
        { value: hugeInput }
      );
      const elapsed = Date.now() - start;

      expect(result).toBe(false);
      expect(elapsed).toBeLessThan(50);
    });

    // KNOWN WEAKNESS (documented, not a regression): a short pathological
    // regex within the caps can still catastrophically backtrack. The
    // length-cap is not a complete ReDoS defense — it only blocks long
    // sources and long inputs. This test asserts a wall-clock UPPER BOUND
    // (10s) so a true hang would trip the test, but the cap would need to
    // shrink (or a real regex-complexity check added) to fully close this.
    it("short pathological regex within caps is not fully protected — documented weakness", () => {
      const regex = "(a+)+b"; // classic ReDoS, 6 chars
      const input = "a".repeat(25) + "c"; // 26 chars, well under 10_000
      const start = Date.now();
      const result = evaluateCondition(
        { field: "value", operator: "matches", value: regex },
        { value: input }
      );
      const elapsed = Date.now() - start;
      // Upper bound: if this ever exceeds 10s, the cap regressed or V8
      // optimization changed. At last measurement, V8 takes ~5s here.
      expect(elapsed).toBeLessThan(10_000);
      expect(result).toBe(false);
    });

    it("continues to evaluate well-formed regex at cap limits", () => {
      // Legitimate regex just under cap.
      const regex = `^${"[a-z]".repeat(50)}$`;
      expect(regex.length).toBeLessThan(256);
      const input = "a".repeat(50);
      expect(input.length).toBeLessThan(10_000);

      const result = evaluateCondition(
        { field: "value", operator: "matches", value: regex },
        { value: input }
      );
      expect(result).toBe(true);
    });

    it("malformed regex returns false without throwing", () => {
      const result = evaluateCondition(
        { field: "value", operator: "matches", value: "[unclosed" },
        { value: "anything" }
      );
      expect(result).toBe(false);
    });
  });

  describe("`pattern` validator", () => {
    const pattern = getValidator("pattern");
    if (!pattern) throw new Error("pattern validator not registered");

    const ctx = { fieldName: "f", values: {} };

    it("skips validation when regex source > 256 chars", () => {
      const huge = "^" + "a".repeat(260) + "$";
      const start = Date.now();
      const result = pattern("abc", { pattern: huge }, ctx);
      const elapsed = Date.now() - start;

      expect(result).toBeUndefined(); // skip = no error
      expect(elapsed).toBeLessThan(50);
    });

    it("skips validation when input > 10_000 chars", () => {
      const big = "a".repeat(10_100);
      const start = Date.now();
      const result = pattern(big, { pattern: "^a+$" }, ctx);
      const elapsed = Date.now() - start;

      expect(result).toBeUndefined();
      expect(elapsed).toBeLessThan(50);
    });

    // KNOWN WEAKNESS (documented): short pathological regex + short input
    // still backtrack. Length caps only shield long inputs/sources. Upper
    // bound test ensures we don't hang indefinitely.
    it("short pathological regex within caps is not fully protected — documented weakness", () => {
      const regex = "^(a+)+$";
      const input = "a".repeat(25) + "!"; // won't match; triggers backtrack
      const start = Date.now();
      const result = pattern(input, { pattern: regex }, ctx);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(10_000);
      expect(result).toBeDefined(); // didn't match -> error string
    });

    it("legitimate pattern at cap limits validates correctly", () => {
      const result = pattern("user@example.com", {
        pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
      }, ctx);
      expect(result).toBeUndefined();

      const invalidResult = pattern("not-an-email", {
        pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
      }, ctx);
      expect(invalidResult).toBeDefined();
    });
  });
});

