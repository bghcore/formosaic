import { IEntityData } from "../utils";

/**
 * Recursively walk an object tree and replace Date instances with
 * a serializable marker: `{ __type: "Date", value: "<ISO string>" }`.
 *
 * JSON.stringify's replacer receives the *return value* of `.toJSON()`,
 * which means Date objects appear as plain strings to the replacer.
 * Pre-processing avoids this problem.
 */
function markDates(value: unknown, visited = new WeakSet()): unknown {
  if (value instanceof Date) {
    return { __type: "Date", value: value.toISOString() };
  }
  if (Array.isArray(value)) {
    if (visited.has(value)) return value;
    visited.add(value);
    return value.map((item) => markDates(item, visited));
  }
  if (value !== null && typeof value === "object") {
    if (visited.has(value as object)) return value;
    visited.add(value as object);
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>)) {
      result[key] = markDates((value as Record<string, unknown>)[key], visited);
    }
    return result;
  }
  return value;
}

/**
 * Serialize form state to a JSON string, preserving Date objects
 * with a special `__type` marker so they can be round-tripped.
 */
export function serializeFormState(data: IEntityData): string {
  return JSON.stringify(markDates(data));
}

/**
 * Deserialize a JSON string back to form state, restoring Date objects
 * that were serialized with `serializeFormState`.
 */
export function deserializeFormState(json: string): IEntityData {
  return JSON.parse(json, (_key, value) => {
    if (value && typeof value === "object" && value.__type === "Date") {
      return new Date(value.value);
    }
    return value;
  });
}
