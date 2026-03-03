import { Dictionary } from "../utils";
import { IFieldConfig } from "../types/IFieldConfig";

/**
 * Converts a Zod object schema to Dictionary<IFieldConfig>.
 * Does NOT require zod as a dependency — inspects the schema shape at runtime.
 *
 * Supports: z.string(), z.number(), z.boolean(), z.enum(), z.date(),
 * z.array(), z.optional(), z.nullable()
 *
 * @example
 * const schema = z.object({
 *   name: z.string().min(1),
 *   email: z.string().email(),
 *   age: z.number().min(0).max(120),
 *   role: z.enum(["admin", "user", "guest"]),
 *   active: z.boolean(),
 * });
 * const fieldConfigs = zodSchemaToFieldConfig(schema);
 */
export function zodSchemaToFieldConfig(zodSchema: unknown): Dictionary<IFieldConfig> {
  const configs: Dictionary<IFieldConfig> = {};

  // Get the shape from a Zod object schema
  const shape = getZodShape(zodSchema);
  if (!shape) return configs;

  for (const [fieldName, fieldSchema] of Object.entries(shape)) {
    configs[fieldName] = zodFieldToConfig(fieldName, fieldSchema as ZodDef);
  }

  return configs;
}

interface ZodDef {
  _def?: {
    typeName?: string;
    innerType?: ZodDef;
    checks?: Array<{ kind: string; value?: unknown; message?: string }>;
    values?: string[];
    options?: ZodDef[];
    type?: ZodDef;
  };
}

function getZodShape(schema: unknown): Record<string, unknown> | null {
  const s = schema as ZodDef;
  // z.object() has _def.shape() or _def.shape
  if (s?._def && typeof s._def === "object") {
    const def = s._def as Record<string, unknown>;
    if (typeof def.shape === "function") return (def.shape as () => Record<string, unknown>)();
    if (typeof def.shape === "object" && def.shape !== null) return def.shape as Record<string, unknown>;
  }
  return null;
}

function zodFieldToConfig(fieldName: string, field: ZodDef): IFieldConfig {
  const { typeName, isOptional } = unwrapZodType(field);
  const checks = getZodChecks(field);

  const config: IFieldConfig = {
    label: formatLabel(fieldName),
    required: !isOptional,
  };

  // Map Zod type to component
  switch (typeName) {
    case "ZodString":
      config.component = "Textbox";
      if (checks.some(c => c.kind === "email")) {
        config.validations = [...(config.validations ?? []), "EmailValidation"];
      }
      if (checks.some(c => c.kind === "url")) {
        config.validations = [...(config.validations ?? []), "isValidUrl"];
      }
      break;
    case "ZodNumber":
      config.component = "Number";
      break;
    case "ZodBoolean":
      config.component = "Toggle";
      break;
    case "ZodEnum":
    case "ZodNativeEnum":
      config.component = "Dropdown";
      const values = getZodEnumValues(field);
      if (values) {
        config.dropdownOptions = values.map(v => ({ key: String(v), text: String(v) }));
      }
      break;
    case "ZodDate":
      config.component = "DateControl";
      break;
    case "ZodArray":
      config.component = "Multiselect";
      break;
    default:
      config.component = "Textbox";
  }

  return config;
}

function unwrapZodType(field: ZodDef): { typeName: string; isOptional: boolean } {
  let current = field;
  let isOptional = false;

  // Unwrap ZodOptional, ZodNullable, ZodDefault
  while (current?._def) {
    const tn = current._def.typeName;
    if (tn === "ZodOptional" || tn === "ZodNullable") {
      isOptional = true;
      current = current._def.innerType as ZodDef;
    } else if (tn === "ZodDefault") {
      current = current._def.innerType as ZodDef;
    } else {
      break;
    }
  }

  return { typeName: current?._def?.typeName ?? "ZodString", isOptional };
}

function getZodChecks(field: ZodDef): Array<{ kind: string; value?: unknown }> {
  let current = field;
  while (current?._def) {
    if (current._def.checks) return current._def.checks;
    if (current._def.innerType) {
      current = current._def.innerType as ZodDef;
    } else {
      break;
    }
  }
  return [];
}

function getZodEnumValues(field: ZodDef): string[] | null {
  let current = field;
  while (current?._def) {
    if (current._def.values) return current._def.values;
    if (current._def.innerType) {
      current = current._def.innerType as ZodDef;
    } else {
      break;
    }
  }
  return null;
}

function formatLabel(fieldName: string): string {
  // Convert camelCase to Title Case
  return fieldName
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, s => s.toUpperCase())
    .trim();
}
