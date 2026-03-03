import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  registerValidations,
  registerAsyncValidations,
  AsyncValidationFunction,
  ValidationFunction,
} from "../../helpers/ValidationRegistry";
import {
  CheckFieldValidationRules,
  CheckAsyncFieldValidationRules,
} from "../../helpers/HookInlineFormHelper";

describe("AsyncValidationIntegration", () => {
  beforeEach(() => {
    // Register fresh validators for each test
    const syncFail: ValidationFunction = (value) =>
      value === "sync-bad" ? "Sync validation failed" : undefined;
    const syncPass: ValidationFunction = () => undefined;

    const asyncFail: AsyncValidationFunction = async (value) =>
      value === "async-bad" ? "Async validation failed" : undefined;
    const asyncPass: AsyncValidationFunction = async () => undefined;

    registerValidations({
      IntegSyncFail: syncFail,
      IntegSyncPass: syncPass,
    });

    registerAsyncValidations({
      IntegAsyncFail: asyncFail,
      IntegAsyncPass: asyncPass,
    });
  });

  it("sync validation fails -> async not called", async () => {
    const asyncSpy = vi.fn<AsyncValidationFunction>().mockResolvedValue(undefined);
    registerAsyncValidations({ IntegAsyncSpy: asyncSpy });

    const syncValidations = ["IntegSyncFail"];
    const asyncValidations = ["IntegAsyncSpy"];
    const entityData = { field1: "test" };
    const value = "sync-bad";

    // Simulate the validate logic from HookRenderField
    let result: string | undefined;
    const syncError = CheckFieldValidationRules(value, entityData, syncValidations);
    if (syncError) {
      result = syncError;
    } else {
      result = await CheckAsyncFieldValidationRules(value, entityData, asyncValidations);
    }

    expect(result).toBe("Sync validation failed");
    expect(asyncSpy).not.toHaveBeenCalled();
  });

  it("sync passes -> async runs and returns error", async () => {
    const syncValidations = ["IntegSyncPass"];
    const asyncValidations = ["IntegAsyncFail"];
    const entityData = { field1: "test" };
    const value = "async-bad";

    // Simulate the validate logic from HookRenderField
    let result: string | undefined;
    const syncError = CheckFieldValidationRules(value, entityData, syncValidations);
    if (syncError) {
      result = syncError;
    } else {
      result = await CheckAsyncFieldValidationRules(value, entityData, asyncValidations);
    }

    expect(result).toBe("Async validation failed");
  });

  it("both pass -> returns undefined", async () => {
    const syncValidations = ["IntegSyncPass"];
    const asyncValidations = ["IntegAsyncPass"];
    const entityData = { field1: "test" };
    const value = "good-value";

    // Simulate the validate logic from HookRenderField
    let result: string | undefined;
    const syncError = CheckFieldValidationRules(value, entityData, syncValidations);
    if (syncError) {
      result = syncError;
    } else {
      result = await CheckAsyncFieldValidationRules(value, entityData, asyncValidations);
    }

    expect(result).toBeUndefined();
  });
});
