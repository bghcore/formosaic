import { IJsonSchemaNode } from "./types";

/**
 * Resolve all $ref pointers in a JSON Schema, inlining referenced definitions.
 *
 * - Handles both `definitions` (draft-04) and `$defs` (draft-2019+)
 * - Merges sibling properties alongside $ref (title, description override)
 * - Detects circular references via visited set, falls back to { type: "string" }
 * - Strips definitions/$defs from output
 */
export function resolveRefs(schema: IJsonSchemaNode, maxDepth: number = 64): IJsonSchemaNode {
  const defs: Record<string, IJsonSchemaNode> = {
    ...(schema.definitions ?? {}),
    ...(schema.$defs ?? {}),
  };

  const resolved = resolveNode(schema, defs, new Set<string>(), 0, maxDepth);

  // Strip definition blocks from output
  const { definitions: _d, $defs: _dd, ...clean } = resolved;
  return clean;
}

function resolveNode(
  node: IJsonSchemaNode,
  defs: Record<string, IJsonSchemaNode>,
  visited: Set<string>,
  depth: number = 0,
  maxDepth: number = 64
): IJsonSchemaNode {
  // Per audit P0-10: bound recursion to prevent stack overflow from deeply
  // nested / pathologically-constructed JSON Schemas.
  if (depth > maxDepth) {
    throw new Error(
      `[formosaic:rjsf] Maximum schema recursion depth (${maxDepth}) exceeded during $ref resolution.`
    );
  }
  if (node.$ref) {
    const refPath = node.$ref;

    if (visited.has(refPath)) {
      // Circular reference — fall back to string
      return { type: "string" };
    }

    const resolved = lookupRef(refPath, defs);
    if (!resolved) {
      return { type: "string" };
    }

    visited.add(refPath);

    // Merge sibling properties (title, description, etc.) over the resolved def
    const { $ref: _ref, ...siblings } = node;
    const inlined = resolveNode({ ...resolved, ...siblings }, defs, visited, depth + 1, maxDepth);

    visited.delete(refPath);
    return inlined;
  }

  const result: IJsonSchemaNode = {};

  for (const [key, value] of Object.entries(node)) {
    if (key === "definitions" || key === "$defs") {
      continue;
    }

    if (key === "properties" && value && typeof value === "object") {
      const props: Record<string, IJsonSchemaNode> = {};
      for (const [propName, propValue] of Object.entries(
        value as Record<string, IJsonSchemaNode>
      )) {
        props[propName] = resolveNode(propValue, defs, visited, depth + 1, maxDepth);
      }
      result.properties = props;
    } else if (key === "items") {
      if (Array.isArray(value)) {
        result.items = value.map((item: IJsonSchemaNode) =>
          resolveNode(item, defs, visited, depth + 1, maxDepth)
        ) as unknown as IJsonSchemaNode;
      } else if (value && typeof value === "object") {
        result.items = resolveNode(value as IJsonSchemaNode, defs, visited, depth + 1, maxDepth);
      }
    } else if (
      (key === "allOf" || key === "oneOf" || key === "anyOf") &&
      Array.isArray(value)
    ) {
      (result as Record<string, unknown>)[key] = value.map(
        (item: IJsonSchemaNode) => resolveNode(item, defs, visited, depth + 1, maxDepth)
      );
    } else if (key === "if" || key === "then" || key === "else") {
      if (value && typeof value === "object") {
        (result as Record<string, unknown>)[key] = resolveNode(
          value as IJsonSchemaNode,
          defs,
          visited,
          depth + 1,
          maxDepth
        );
      }
    } else if (key === "dependencies" && value && typeof value === "object") {
      const deps: Record<string, string[] | IJsonSchemaNode> = {};
      for (const [depName, depValue] of Object.entries(
        value as Record<string, string[] | IJsonSchemaNode>
      )) {
        if (Array.isArray(depValue)) {
          deps[depName] = depValue;
        } else if (typeof depValue === "object" && depValue !== null) {
          deps[depName] = resolveNode(
            depValue as IJsonSchemaNode,
            defs,
            visited,
            depth + 1,
            maxDepth
          );
        }
      }
      result.dependencies = deps;
    } else if (
      key === "additionalProperties" &&
      value &&
      typeof value === "object"
    ) {
      result.additionalProperties = resolveNode(
        value as IJsonSchemaNode,
        defs,
        visited,
        depth + 1,
        maxDepth
      );
    } else if (key === "__proto__" || key === "constructor" || key === "prototype") {
      // Per audit P0-10: skip prototype-pollution keys.
      continue;
    } else {
      (result as Record<string, unknown>)[key] = value;
    }
  }

  return result;
}

function lookupRef(
  ref: string,
  defs: Record<string, IJsonSchemaNode>
): IJsonSchemaNode | undefined {
  // Support "#/definitions/Foo" and "#/$defs/Foo"
  const match = ref.match(/^#\/(?:definitions|\$defs)\/(.+)$/);
  if (!match) return undefined;

  const path = match[1];
  // Handle nested paths like "Foo/Bar"
  const parts = path.split("/");
  let current: IJsonSchemaNode | undefined = defs[parts[0]];
  for (let i = 1; i < parts.length && current; i++) {
    current = (current as Record<string, IJsonSchemaNode>)[parts[i]];
  }
  return current;
}
