import { IFieldConfig, IDependencyAndRules } from "./IFieldConfig";
import { IDropdownOption } from "./IDropdownOption";
import { Dictionary } from "../utils";

/**
 * Type-safe field configuration builder.
 *
 * When you define your field configs using `defineFieldConfigs()`,
 * TypeScript will verify that all dependency references point to
 * actual field names in your config, catching typos at compile time.
 *
 * @example
 * const configs = defineFieldConfigs({
 *   name: { component: "Textbox", label: "Name", required: true },
 *   status: {
 *     component: "Dropdown",
 *     label: "Status",
 *     dropdownOptions: [
 *       { key: "Active", text: "Active" },
 *       { key: "Inactive", text: "Inactive" },
 *     ],
 *     dependencies: {
 *       Active: {
 *         name: { required: true },  // TypeScript verifies "name" exists
 *         // typo: { required: true },  // ERROR: "typo" not in field names
 *       },
 *     },
 *   },
 * });
 */

/**
 * A field config where dependency targets are constrained to known field names.
 */
export type TypedFieldConfig<TFields extends string> = Omit<IFieldConfig, "dependencies" | "dropdownDependencies"> & {
  /**
   * Business rules: when this field has a specific value, apply config changes to other fields.
   * Field names in the inner object are type-checked against the defined field names.
   */
  dependencies?: Record<string, Partial<Record<TFields, Partial<IFieldConfig>>>>;
  /**
   * Dropdown dependencies: when this field has a specific value, filter dropdown options for other fields.
   * Field names are type-checked.
   */
  dropdownDependencies?: Record<string, Partial<Record<TFields, string[]>>>;
};

/**
 * Define field configs with type-safe dependency references.
 * TypeScript will error if a dependency targets a field name that doesn't exist in the config.
 *
 * At runtime this is a no-op -- it just returns the input. The value is purely at compile time.
 *
 * @example
 * const configs = defineFieldConfigs({
 *   name: { component: "Textbox", label: "Name" },
 *   status: {
 *     component: "Dropdown",
 *     label: "Status",
 *     dependencies: {
 *       Active: { name: { required: true } },  // "name" exists
 *     },
 *   },
 * });
 */
export function defineFieldConfigs<T extends Record<string, TypedFieldConfig<Extract<keyof T, string>>>>(
  configs: T
): Dictionary<IFieldConfig> {
  return configs as unknown as Dictionary<IFieldConfig>;
}
