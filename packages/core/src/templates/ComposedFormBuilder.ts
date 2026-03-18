import { IComposeFormOptions } from "../types/IFormConnection";
import { IFormConfig } from "../types/IFormConfig";
import { IFieldConfig } from "../types/IFieldConfig";
import { ITemplateFieldRef } from "../types/IFormTemplate";
import { resolveTemplates } from "./TemplateResolver";
import { compileConnections } from "./ConnectionCompiler";
import { IResolvedFormConfig } from "../types/IResolvedFormConfig";

export function composeForm(options: IComposeFormOptions): IFormConfig {
  const fields: Record<string, IFieldConfig | ITemplateFieldRef> = {};

  // Build templateRef entries from fragments
  for (const [prefix, fragment] of Object.entries(options.fragments ?? {})) {
    if (fragment.template) {
      const ref: ITemplateFieldRef = {
        templateRef: fragment.template,
        ...(fragment.params && { templateParams: fragment.params }),
        ...(fragment.overrides && { templateOverrides: fragment.overrides }),
        ...(fragment.defaultValues && { defaultValues: fragment.defaultValues }),
      };
      fields[prefix] = ref;
    } else if (fragment.config) {
      // Inline config: prefix each field
      for (const [fieldName, fieldConfig] of Object.entries(fragment.config.fields)) {
        fields[`${prefix}.${fieldName}`] = fieldConfig as IFieldConfig;
      }
    }
  }

  // Merge standalone fields
  if (options.fields) {
    for (const [name, config] of Object.entries(options.fields)) {
      fields[name] = config;
    }
  }

  // Build the IFormConfig
  const config: IFormConfig = {
    version: 2,
    fields,
    ...(options.fieldOrder && { fieldOrder: options.fieldOrder }),
    ...(options.wizard && { wizard: options.wizard }),
    ...(options.settings && { settings: options.settings }),
    ...(options.lookups && { lookups: options.lookups }),
  };

  // Resolve templates
  const resolved = resolveTemplates(config) as IResolvedFormConfig;

  // Compile connections if present
  if (options.connections?.length && resolved._resolvedPorts) {
    const connectionRules = compileConnections(options.connections, resolved._resolvedPorts);
    if (connectionRules.length > 0) {
      // Attach connection rules to the first standalone field (or first fragment field)
      const targetFieldName =
        Object.keys(options.fields ?? {})[0] ?? Object.keys(resolved.fields)[0];
      if (targetFieldName && resolved.fields[targetFieldName]) {
        resolved.fields[targetFieldName] = {
          ...resolved.fields[targetFieldName],
          rules: [
            ...(resolved.fields[targetFieldName].rules ?? []),
            ...connectionRules,
          ],
        };
      }
    }
  }

  return resolved;
}

/**
 * Type-safe builder for composed forms. At runtime this is identical to `composeForm()`.
 * The value is purely at the type level — IComposeFormOptions provides type checking
 * for fragment definitions, connections, and wizard steps.
 *
 * @example
 * const config = defineComposedForm({
 *   fragments: {
 *     shipping: { template: "address", params: { required: true } },
 *     billing: { template: "address" },
 *   },
 *   fields: { sameAddr: { type: "Toggle", label: "Same as shipping?" } },
 *   connections: [{ name: "copy", when: ..., source: ..., target: ..., effect: "copyValues" }],
 * });
 */
export function defineComposedForm(options: IComposeFormOptions): IFormConfig {
  return composeForm(options);
}
