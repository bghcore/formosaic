import { describe, it, expect } from "vitest";
import { evaluateCondition } from "../../helpers/ConditionEvaluator";
import { IEntityData } from "../../utils";

// Shared test entities
const emptyArrayEntity: IEntityData = { tags: [] };
const singleItemEntity: IEntityData = { tags: ["alpha"] };
const multiItemEntity: IEntityData = { tags: ["alpha", "beta", "gamma"] };
const nonArrayEntity: IEntityData = { tags: "not-an-array" };
const missingFieldEntity: IEntityData = {};

describe("arrayContains operator", () => {
  it("returns true when array contains the value", () => {
    expect(evaluateCondition({ field: "tags", operator: "arrayContains", value: "alpha" }, multiItemEntity)).toBe(true);
  });

  it("returns false when array does not contain the value", () => {
    expect(evaluateCondition({ field: "tags", operator: "arrayContains", value: "delta" }, multiItemEntity)).toBe(false);
  });

  it("returns false for empty array", () => {
    expect(evaluateCondition({ field: "tags", operator: "arrayContains", value: "alpha" }, emptyArrayEntity)).toBe(false);
  });

  it("returns false when field is not an array", () => {
    expect(evaluateCondition({ field: "tags", operator: "arrayContains", value: "not" }, nonArrayEntity)).toBe(false);
  });

  it("returns false when field is missing", () => {
    expect(evaluateCondition({ field: "tags", operator: "arrayContains", value: "alpha" }, missingFieldEntity)).toBe(false);
  });

  it("uses loose equality (number as string)", () => {
    const numEntity: IEntityData = { scores: [1, 2, 3] };
    expect(evaluateCondition({ field: "scores", operator: "arrayContains", value: "2" }, numEntity)).toBe(true);
  });
});

describe("arrayNotContains operator", () => {
  it("returns true when array does not contain the value", () => {
    expect(evaluateCondition({ field: "tags", operator: "arrayNotContains", value: "delta" }, multiItemEntity)).toBe(true);
  });

  it("returns false when array contains the value", () => {
    expect(evaluateCondition({ field: "tags", operator: "arrayNotContains", value: "alpha" }, multiItemEntity)).toBe(false);
  });

  it("returns true for empty array (contains nothing)", () => {
    expect(evaluateCondition({ field: "tags", operator: "arrayNotContains", value: "alpha" }, emptyArrayEntity)).toBe(true);
  });

  it("returns true when field is not an array", () => {
    expect(evaluateCondition({ field: "tags", operator: "arrayNotContains", value: "x" }, nonArrayEntity)).toBe(true);
  });

  it("returns true when field is missing", () => {
    expect(evaluateCondition({ field: "tags", operator: "arrayNotContains", value: "x" }, missingFieldEntity)).toBe(true);
  });
});

describe("arrayLengthEquals operator", () => {
  it("returns true when length matches", () => {
    expect(evaluateCondition({ field: "tags", operator: "arrayLengthEquals", value: 3 }, multiItemEntity)).toBe(true);
  });

  it("returns false when length does not match", () => {
    expect(evaluateCondition({ field: "tags", operator: "arrayLengthEquals", value: 2 }, multiItemEntity)).toBe(false);
  });

  it("returns true for empty array with value 0", () => {
    expect(evaluateCondition({ field: "tags", operator: "arrayLengthEquals", value: 0 }, emptyArrayEntity)).toBe(true);
  });

  it("returns false when field is not an array", () => {
    expect(evaluateCondition({ field: "tags", operator: "arrayLengthEquals", value: 1 }, nonArrayEntity)).toBe(false);
  });

  it("accepts string number value", () => {
    expect(evaluateCondition({ field: "tags", operator: "arrayLengthEquals", value: "3" }, multiItemEntity)).toBe(true);
  });
});

describe("arrayLengthGreaterThan operator", () => {
  it("returns true when array length exceeds value", () => {
    expect(evaluateCondition({ field: "tags", operator: "arrayLengthGreaterThan", value: 2 }, multiItemEntity)).toBe(true);
  });

  it("returns false when array length equals value (not strictly greater)", () => {
    expect(evaluateCondition({ field: "tags", operator: "arrayLengthGreaterThan", value: 3 }, multiItemEntity)).toBe(false);
  });

  it("returns false when array length is less than value", () => {
    expect(evaluateCondition({ field: "tags", operator: "arrayLengthGreaterThan", value: 5 }, multiItemEntity)).toBe(false);
  });

  it("returns false for empty array", () => {
    expect(evaluateCondition({ field: "tags", operator: "arrayLengthGreaterThan", value: 0 }, emptyArrayEntity)).toBe(false);
  });

  it("returns false when field is not an array", () => {
    expect(evaluateCondition({ field: "tags", operator: "arrayLengthGreaterThan", value: 0 }, nonArrayEntity)).toBe(false);
  });
});

describe("arrayLengthLessThan operator", () => {
  it("returns true when array length is below value", () => {
    expect(evaluateCondition({ field: "tags", operator: "arrayLengthLessThan", value: 5 }, multiItemEntity)).toBe(true);
  });

  it("returns false when array length equals value (not strictly less)", () => {
    expect(evaluateCondition({ field: "tags", operator: "arrayLengthLessThan", value: 3 }, multiItemEntity)).toBe(false);
  });

  it("returns false when array length exceeds value", () => {
    expect(evaluateCondition({ field: "tags", operator: "arrayLengthLessThan", value: 2 }, multiItemEntity)).toBe(false);
  });

  it("returns true for empty array with value > 0", () => {
    expect(evaluateCondition({ field: "tags", operator: "arrayLengthLessThan", value: 1 }, emptyArrayEntity)).toBe(true);
  });

  it("returns false when field is not an array", () => {
    expect(evaluateCondition({ field: "tags", operator: "arrayLengthLessThan", value: 999 }, nonArrayEntity)).toBe(false);
  });

  it("returns true for single-item array with value 2", () => {
    expect(evaluateCondition({ field: "tags", operator: "arrayLengthLessThan", value: 2 }, singleItemEntity)).toBe(true);
  });
});
