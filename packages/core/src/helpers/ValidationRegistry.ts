import { IEntityData } from "../utils";
import { IValidationRule } from "../types/IValidationRule";
import { ICondition } from "../types/ICondition";
import { evaluateCondition } from "./ConditionEvaluator";

/**
 * Unified validator function signature.
 * Handles sync, async, and cross-field validation.
 *
 * @param value - The field's current value
 * @param params - Parameters from IValidationRule.params
 * @param context - Full form context (values, field name, abort signal)
 * @returns Error message string, undefined if valid, or a Promise for async
 */
export type ValidatorFn = (
  value: unknown,
  params: Record<string, unknown> | undefined,
  context: IValidationContext
) => string | undefined | Promise<string | undefined>;

export interface IValidationContext {
  fieldName: string;
  values: IEntityData;
  signal?: AbortSignal;
}

// --- Built-in validators ---

const required: ValidatorFn = (value) => {
  if (value === null || value === undefined || (typeof value === "string" && value.trim() === "")) {
    return "This field is required";
  }
  return undefined;
};

const email: ValidatorFn = (value) => {
  if (!value || typeof value !== "string") return undefined;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value) ? undefined : "Invalid email address";
};

const phone: ValidatorFn = (value) => {
  if (!value || typeof value !== "string") return undefined;
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
  return phoneRegex.test(value) ? undefined : "Invalid phone number";
};

const url: ValidatorFn = (value) => {
  if (!value || typeof value !== "string") return undefined;
  return /(http(s?)):\/\//i.test(value) ? undefined : "Invalid URL";
};

const year: ValidatorFn = (value) => {
  if (!value || typeof value !== "string") return undefined;
  const y = parseInt(value, 10);
  if (isNaN(y) || y < 1900 || y > 2100) return "Invalid year";
  return undefined;
};

const noSpecialCharacters: ValidatorFn = (value) => {
  if (!value || typeof value !== "string") return undefined;
  return /[^a-zA-Z0-9\s\-_.]/.test(value) ? "Special characters are not allowed" : undefined;
};

const currency: ValidatorFn = (value) => {
  if (!value && value !== 0) return undefined;
  const str = typeof value === "string" ? value : String(value);
  return /^-?\d{1,}(\.\d{1,2})?$/.test(str) ? undefined : "Invalid currency format";
};

const uniqueInArray: ValidatorFn = (value) => {
  if (!value || !Array.isArray(value)) return undefined;
  const seen = new Set<string>();
  for (const item of value) {
    const str = String(item);
    if (seen.has(str)) return `Duplicate value: ${str}`;
    seen.add(str);
  }
  return undefined;
};

const minLength: ValidatorFn = (value, params) => {
  if (value === null || value === undefined || typeof value !== "string") return undefined;
  const min = Number(params?.min ?? 0);
  return value.length < min ? `Must be at least ${min} characters` : undefined;
};

const maxLength: ValidatorFn = (value, params) => {
  if (!value || typeof value !== "string") return undefined;
  const max = Number(params?.max ?? Infinity);
  return value.length > max ? `Must be at most ${max} characters` : undefined;
};

const numericRange: ValidatorFn = (value, params) => {
  if (value == null || value === "") return undefined;
  const num = typeof value === "number" ? value : Number(value);
  if (isNaN(num)) return "Must be a number";
  const min = Number(params?.min ?? -Infinity);
  const max = Number(params?.max ?? Infinity);
  if (num < min || num > max) return `Must be between ${min} and ${max}`;
  return undefined;
};

const pattern: ValidatorFn = (value, params) => {
  if (!value || typeof value !== "string") return undefined;
  const regex = params?.pattern;
  const message = (params?.message as string) ?? "Invalid format";
  if (!regex) return undefined;
  // Per audit P0-10: cap pattern source and input length to mitigate ReDoS
  // from adversarial configs.
  const patternStr = String(regex);
  if (patternStr.length > 256) {
    if ((globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("[formosaic] pattern validator regex source exceeds 256 chars; skipping.");
    }
    return undefined;
  }
  if (value.length > 10_000) {
    if ((globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("[formosaic] pattern validator input exceeds 10000 chars; skipping.");
    }
    return undefined;
  }
  try {
    return new RegExp(patternStr).test(value) ? undefined : message;
  } catch {
    return undefined;
  }
};

const maxKb: ValidatorFn = (value, params) => {
  if (!value || typeof value !== "string") return undefined;
  const maxKbValue = Number(params?.maxKb ?? 150);
  const sizeKb = Math.ceil(new Blob([value]).size / 1000);
  return sizeKb > maxKbValue ? `Content exceeds maximum size of ${maxKbValue}KB` : undefined;
};

const exclusiveNumericRange: ValidatorFn = (value, params) => {
  if (value == null || value === "") return undefined;
  const num = typeof value === "number" ? value : Number(value);
  if (isNaN(num)) return "Must be a number";
  const exclMin = params?.exclusiveMin != null ? Number(params.exclusiveMin) : undefined;
  const exclMax = params?.exclusiveMax != null ? Number(params.exclusiveMax) : undefined;
  const min = params?.min != null ? Number(params.min) : undefined;
  const max = params?.max != null ? Number(params.max) : undefined;
  if (exclMin !== undefined && num <= exclMin) return `Must be greater than ${exclMin}`;
  if (exclMax !== undefined && num >= exclMax) return `Must be less than ${exclMax}`;
  if (min !== undefined && num < min) return `Must be at least ${min}`;
  if (max !== undefined && num > max) return `Must be at most ${max}`;
  return undefined;
};

const multipleOf: ValidatorFn = (value, params) => {
  if (value == null || value === "") return undefined;
  const num = typeof value === "number" ? value : Number(value);
  if (isNaN(num)) return "Must be a number";
  const factor = Number(params?.factor ?? 1);
  if (factor === 0) return undefined;
  // Use tolerance for floating-point arithmetic
  const remainder = Math.abs(num % factor);
  const tolerance = 1e-10;
  if (remainder > tolerance && Math.abs(remainder - Math.abs(factor)) > tolerance) {
    return `Must be a multiple of ${factor}`;
  }
  return undefined;
};

const requiredIf: ValidatorFn = (value, params, context) => {
  if (!params?.field || !params?.values) return undefined;
  const depValue = context.values[params.field as string];
  const allowedValues = params.values as string[];
  if (allowedValues.includes(String(depValue)) && (value == null || value === "")) {
    return "This field is required";
  }
  return undefined;
};

// --- Validator Metadata ---

/** Metadata describing a validator for use in designer UIs and documentation. */
export interface IValidatorMetadata {
  /** Human-readable display name */
  label: string;
  /** Optional description of what the validator checks */
  description?: string;
  /** Named parameters the validator accepts */
  params?: Record<string, {
    type: "string" | "number" | "boolean";
    label: string;
    required?: boolean;
  }>;
}

/**
 * SSR / multi-tenant contract (audit P1-21):
 *
 * Plugin-style registry. Populate ONCE at app boot. Metadata is shared
 * across all requests served by the same Node process.
 */
let validatorMetadataRegistry: Record<string, IValidatorMetadata> = {};

/** Register metadata for a custom (or built-in) validator */
export function registerValidatorMetadata(name: string, metadata: IValidatorMetadata): void {
  validatorMetadataRegistry = { ...validatorMetadataRegistry, [name]: metadata };
}

/** Get metadata for a specific validator by name */
export function getValidatorMetadata(name: string): IValidatorMetadata | undefined {
  return validatorMetadataRegistry[name];
}

/** Get all registered validator metadata */
export function getAllValidatorMetadata(): Record<string, IValidatorMetadata> {
  return { ...validatorMetadataRegistry };
}

/** Reset validator metadata registry (for testing) */
export function resetValidatorMetadataRegistry(): void {
  validatorMetadataRegistry = {};
}

// --- Registry ---

const defaultValidators: Record<string, ValidatorFn> = {
  required,
  email,
  phone,
  url,
  year,
  noSpecialCharacters,
  currency,
  uniqueInArray,
  minLength,
  maxLength,
  numericRange,
  pattern,
  maxKb,
  exclusiveNumericRange,
  multipleOf,
  requiredIf,
  // Legacy name aliases
  EmailValidation: email,
  PhoneNumberValidation: phone,
  YearValidation: year,
  isValidUrl: url,
  NoSpecialCharactersValidation: noSpecialCharacters,
  CurrencyValidation: currency,
  UniqueInArrayValidation: uniqueInArray,
  Max150KbValidation: (v, _p, c) => maxKb(v, { maxKb: 150 }, c),
  Max32KbValidation: (v, _p, c) => maxKb(v, { maxKb: 32 }, c),
};

/**
 * SSR / multi-tenant contract (audit P1-21):
 *
 * Plugin-style registry of named validator functions. Register custom
 * validators ONCE at app boot via registerValidators(). Validators receive
 * `value`, `params`, and `context.values` per-call, so per-request/per-user
 * state must be plumbed through those arguments — do NOT capture per-request
 * context in a module-level closure, as it would leak across tenants.
 */
let validatorRegistry: Record<string, ValidatorFn> = { ...defaultValidators };

/** Register custom validators (merge into registry) */
export function registerValidators(custom: Record<string, ValidatorFn>): void {
  validatorRegistry = { ...validatorRegistry, ...custom };
}

/** Get a validator by name */
export function getValidator(name: string): ValidatorFn | undefined {
  return validatorRegistry[name];
}

/** Get a copy of the full registry */
export function getValidatorRegistry(): Record<string, ValidatorFn> {
  return { ...validatorRegistry };
}

/** Reset registry to defaults (for testing) */
export function resetValidatorRegistry(): void {
  validatorRegistry = { ...defaultValidators };
}

/**
 * Run all validation rules for a field value.
 * Handles sync, async, and conditional validation.
 */
export async function runValidations(
  value: unknown,
  rules: IValidationRule[],
  context: IValidationContext
): Promise<string | undefined> {
  for (const rule of rules) {
    if (context.signal?.aborted) return undefined;

    // Check conditional validation
    if (rule.when) {
      if (!evaluateCondition(rule.when, context.values)) continue;
    }

    const validator = getValidator(rule.name);
    if (!validator) continue;

    const result = validator(value, rule.params, context);
    const message = result instanceof Promise ? await result : result;

    if (message) {
      return rule.message ?? message;
    }
  }
  return undefined;
}

/**
 * Run only sync validation rules (no await, fast fail).
 */
export function runSyncValidations(
  value: unknown,
  rules: IValidationRule[],
  context: IValidationContext
): string | undefined {
  for (const rule of rules) {
    if (rule.async) continue;

    if (rule.when) {
      if (!evaluateCondition(rule.when, context.values)) continue;
    }

    const validator = getValidator(rule.name);
    if (!validator) continue;

    const result = validator(value, rule.params, context);
    if (typeof result === "string") {
      return rule.message ?? result;
    }
  }
  return undefined;
}

// --- Factory helpers for common validators ---

export function createMinLengthRule(min: number, message?: string): IValidationRule {
  return { name: "minLength", params: { min }, message };
}

export function createMaxLengthRule(max: number, message?: string): IValidationRule {
  return { name: "maxLength", params: { max }, message };
}

export function createNumericRangeRule(min: number, max: number, message?: string): IValidationRule {
  return { name: "numericRange", params: { min, max }, message };
}

export function createPatternRule(pattern: string, message: string): IValidationRule {
  return { name: "pattern", params: { pattern, message } };
}

export function createRequiredIfRule(
  field: string,
  values: string[],
  message?: string
): IValidationRule {
  return { name: "requiredIf", params: { field, values }, message };
}
