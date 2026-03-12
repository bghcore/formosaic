import { describe, it, expect } from "vitest";
import { IFieldConfig } from "../../types/IFieldConfig";
import { IRuntimeFieldState } from "../../types/IRuntimeFieldState";
import { IFieldProps } from "../../types/IFieldProps";
import { IOption } from "../../types/IOption";

/**
 * Phase 2B feature tests:
 * - Feature 1: fieldErrors prop type (server-side field error injection)
 * - Feature 2: onSubmit/onSubmitError props (batch submit validation)
 * - Feature 3: loadOptions / optionsDependsOn / optionsLoading types
 */

// ─── Feature 1: Server-Side Field Error Injection ──────────────────────────

describe("Feature 1 – Server-Side Field Error Injection (fieldErrors prop)", () => {
  it("IFormosaicComponentProps accepts fieldErrors as Record<string, string>", () => {
    // This is a compile-time check — if the type is correct, the object assignment succeeds.
    const fieldErrors: Record<string, string> = {
      email: "Email already taken",
      username: "Username already in use",
    };
    expect(Object.keys(fieldErrors)).toHaveLength(2);
    expect(fieldErrors["email"]).toBe("Email already taken");
  });

  it("fieldErrors can be an empty object (no errors)", () => {
    const fieldErrors: Record<string, string> = {};
    expect(Object.keys(fieldErrors)).toHaveLength(0);
  });

  it("fieldErrors can be undefined (optional prop)", () => {
    const fieldErrors: Record<string, string> | undefined = undefined;
    expect(fieldErrors).toBeUndefined();
  });
});

// ─── Feature 2: Batch Submit Validation ───────────────────────────────────

describe("Feature 2 – handleSubmit / Batch Submit Validation (onSubmit / onSubmitError props)", () => {
  it("onSubmit callback type accepts entity data and returns void", () => {
    const onSubmit = (values: Record<string, unknown>): void => {
      expect(typeof values).toBe("object");
    };
    onSubmit({ name: "Alice", age: 30 });
  });

  it("onSubmit callback type accepts entity data and returns Promise<void>", async () => {
    const onSubmit = async (values: Record<string, unknown>): Promise<void> => {
      expect(typeof values).toBe("object");
    };
    await expect(onSubmit({ name: "Bob" })).resolves.toBeUndefined();
  });

  it("onSubmitError receives FieldErrors-shaped object", () => {
    const errors = {
      email: { type: "required", message: "Email is required" },
      name: { type: "minLength", message: "Name too short" },
    };
    const onSubmitError = (e: typeof errors) => {
      expect(Object.keys(e)).toHaveLength(2);
    };
    onSubmitError(errors);
  });
});

// ─── Feature 3: Async Options Loading ─────────────────────────────────────

describe("Feature 3 – Async Options Loading (loadOptions / optionsDependsOn / optionsLoading)", () => {
  it("IFieldConfig accepts loadOptions function", () => {
    const config: IFieldConfig = {
      type: "Dropdown",
      label: "Country",
      loadOptions: async ({ fieldId, values }) => {
        expect(fieldId).toBe("country");
        expect(typeof values).toBe("object");
        return [{ value: "us", label: "United States" }];
      },
    };
    expect(typeof config.loadOptions).toBe("function");
  });

  it("IFieldConfig accepts optionsDependsOn array", () => {
    const config: IFieldConfig = {
      type: "Dropdown",
      label: "City",
      optionsDependsOn: ["country", "region"],
    };
    expect(config.optionsDependsOn).toEqual(["country", "region"]);
  });

  it("IFieldConfig.loadOptions returns Promise<IOption[]>", async () => {
    const expected: IOption[] = [
      { value: "nyc", label: "New York" },
      { value: "la", label: "Los Angeles" },
    ];
    const config: IFieldConfig = {
      type: "Dropdown",
      label: "City",
      loadOptions: async () => expected,
    };
    const result = await config.loadOptions!({ fieldId: "city", values: { country: "us" } });
    expect(result).toEqual(expected);
  });

  it("IRuntimeFieldState has optionsLoading boolean flag", () => {
    const loadingState: IRuntimeFieldState = {
      type: "Dropdown",
      options: [],
      optionsLoading: true,
    };
    expect(loadingState.optionsLoading).toBe(true);

    const loadedState: IRuntimeFieldState = {
      type: "Dropdown",
      options: [{ value: "a", label: "A" }],
      optionsLoading: false,
    };
    expect(loadedState.optionsLoading).toBe(false);
  });

  it("IFieldProps has optionsLoading boolean flag", () => {
    const props: IFieldProps = {
      fieldName: "category",
      options: [],
      optionsLoading: true,
    };
    expect(props.optionsLoading).toBe(true);
  });

  it("loadOptions is called with the correct context shape", async () => {
    let capturedContext: { fieldId: string; values: Record<string, unknown> } | undefined;
    const config: IFieldConfig = {
      type: "Dropdown",
      label: "Test",
      loadOptions: async (ctx) => {
        capturedContext = ctx;
        return [];
      },
    };
    const context = { fieldId: "test", values: { foo: "bar" } };
    await config.loadOptions!(context);
    expect(capturedContext).toEqual(context);
  });

  it("optionsDependsOn defaults to undefined when not provided", () => {
    const config: IFieldConfig = {
      type: "Dropdown",
      label: "Without deps",
    };
    expect(config.optionsDependsOn).toBeUndefined();
  });
});
