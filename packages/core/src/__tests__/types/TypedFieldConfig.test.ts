import { describe, it, expect } from "vitest";
import { defineFieldConfigs } from "../../types/TypedFieldConfig";

describe("defineFieldConfigs", () => {
  it("returns the input as Dictionary<IFieldConfig>", () => {
    const configs = defineFieldConfigs({
      name: { component: "Textbox", label: "Name", required: true },
      status: {
        component: "Dropdown",
        label: "Status",
        dropdownOptions: [
          { key: "Active", text: "Active" },
          { key: "Inactive", text: "Inactive" },
        ],
      },
    });

    expect(configs.name).toBeDefined();
    expect(configs.name.component).toBe("Textbox");
    expect(configs.status).toBeDefined();
    expect(configs.status.component).toBe("Dropdown");
  });

  it("preserves dependency configurations", () => {
    const configs = defineFieldConfigs({
      type: {
        component: "Dropdown",
        label: "Type",
        dropdownOptions: [
          { key: "bug", text: "Bug" },
          { key: "feature", text: "Feature" },
        ],
        dependencies: {
          bug: {
            severity: { required: true, hidden: false },
          },
          feature: {
            severity: { hidden: true },
          },
        },
      },
      severity: {
        component: "Dropdown",
        label: "Severity",
        hidden: true,
      },
    });

    expect(configs.type.dependencies).toBeDefined();
    expect(configs.type.dependencies!["bug"]).toBeDefined();
  });

  it("preserves dropdown dependencies", () => {
    const configs = defineFieldConfigs({
      country: {
        component: "Dropdown",
        label: "Country",
        dropdownDependencies: {
          US: { region: ["East", "West"] },
        },
      },
      region: {
        component: "Dropdown",
        label: "Region",
      },
    });

    expect(configs.country.dropdownDependencies).toBeDefined();
  });

  it("works with all field config properties", () => {
    const configs = defineFieldConfigs({
      email: {
        component: "Textbox",
        label: "Email",
        required: true,
        validations: ["EmailValidation"],
        asyncValidations: ["CheckUniqueEmail"],
        computedValue: "$values.firstName + '@example.com'",
      },
    });

    expect(configs.email.validations).toEqual(["EmailValidation"]);
    expect(configs.email.asyncValidations).toEqual(["CheckUniqueEmail"]);
    expect(configs.email.computedValue).toBe("$values.firstName + '@example.com'");
  });

  it("returns empty object for empty input", () => {
    const configs = defineFieldConfigs({});
    expect(Object.keys(configs)).toHaveLength(0);
  });
});
