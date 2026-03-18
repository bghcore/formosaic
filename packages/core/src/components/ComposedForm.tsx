import React, { useMemo } from "react";
import { composeForm } from "../templates/ComposedFormBuilder";
import { IComposeFormOptions, IFragmentDef, IFormConnection } from "../types/IFormConnection";
import { IFieldConfig } from "../types/IFieldConfig";
import { IFormConfig, IFormSettings } from "../types/IFormConfig";
import { IWizardConfig } from "../types/IWizardConfig";
import { IFormFragmentProps } from "./FormFragment";
import { IFormConnectionProps } from "./FormConnection";
import { IFormFieldProps } from "./FormField";
import { Formosaic } from "./Formosaic";
import { IEntityData } from "../utils";

export interface IComposedFormProps {
  /** Base config to merge JSX declarations into. */
  config?: IFormConfig;
  /** Form-level settings. */
  settings?: IFormSettings;
  /** Wizard config. */
  wizard?: IWizardConfig;
  /** Field display order. */
  fieldOrder?: string[];
  /** Lookup tables. */
  lookups?: Record<string, unknown>;
  /** Save callback. */
  onSave?: (data: IEntityData) => void | Promise<void>;
  /** Entity data (initial values). */
  entityData?: IEntityData;
  /** Whether form is in read-only mode. */
  readOnly?: boolean;
  /** Config name for the form instance. Defaults to "composed". */
  configName?: string;
  /** Test ID prefix. */
  testId?: string;
  /** Children: FormFragment, FormField, FormConnection components. */
  children?: React.ReactNode;
}

export function ComposedForm(props: IComposedFormProps): React.ReactElement | null {
  const {
    children,
    config: baseConfig,
    settings,
    wizard,
    fieldOrder,
    lookups,
    onSave,
    entityData,
    readOnly,
    configName = "composed",
    testId,
  } = props;

  const composedConfig = useMemo(() => {
    const fragments: Record<string, IFragmentDef> = {};
    const fields: Record<string, IFieldConfig> = {};
    const connections: IFormConnection[] = [];

    // Walk children to extract props
    React.Children.forEach(children, (child) => {
      if (!React.isValidElement(child)) return;
      const displayName = (child.type as any)?.displayName;

      if (displayName === "FormFragment") {
        const p = child.props as IFormFragmentProps;
        fragments[p.prefix] = {
          ...(p.template && { template: p.template }),
          ...(p.config && { config: p.config }),
          ...(p.params && { params: p.params }),
          ...(p.overrides && { overrides: p.overrides }),
          ...(p.defaultValues && { defaultValues: p.defaultValues }),
        };
      } else if (displayName === "FormField") {
        const p = child.props as IFormFieldProps;
        fields[p.name] = p.config;
      } else if (displayName === "FormConnection") {
        const p = child.props as IFormConnectionProps;
        connections.push({
          name: p.name,
          when: p.when,
          source: p.source,
          target: p.target,
          effect: p.effect,
        });
      }
    });

    // Merge base config fields/fragments with JSX-extracted ones
    // JSX children are merged ON TOP of the base config
    const baseFields = baseConfig?.fields ?? {};
    const baseTemplates = baseConfig?.templates;
    const baseLookups = baseConfig?.lookups;

    // Separate templateRef entries from plain fields in baseConfig
    const baseFragments: Record<string, IFragmentDef> = {};
    const basePlainFields: Record<string, IFieldConfig> = {};
    for (const [name, fieldDef] of Object.entries(baseFields)) {
      if ("templateRef" in fieldDef && typeof (fieldDef as any).templateRef === "string") {
        const ref = fieldDef as any;
        baseFragments[name] = {
          template: ref.templateRef,
          ...(ref.templateParams && { params: ref.templateParams }),
          ...(ref.templateOverrides && { overrides: ref.templateOverrides }),
          ...(ref.defaultValues && { defaultValues: ref.defaultValues }),
        };
      } else {
        basePlainFields[name] = fieldDef as IFieldConfig;
      }
    }

    // Merge: base first, then JSX on top (JSX wins on conflict)
    const mergedFragments = { ...baseFragments, ...fragments };
    const mergedFields = { ...basePlainFields, ...fields };
    const mergedLookups = { ...baseLookups, ...lookups };

    const hasFragments = Object.keys(mergedFragments).length > 0;
    const hasFields = Object.keys(mergedFields).length > 0;

    if (hasFragments || hasFields) {
      const options: IComposeFormOptions = {
        fragments: mergedFragments,
        ...(Object.keys(mergedFields).length > 0 && { fields: mergedFields }),
        ...(connections.length > 0 && { connections }),
        ...(fieldOrder ?? baseConfig?.fieldOrder ? { fieldOrder: fieldOrder ?? baseConfig?.fieldOrder } : {}),
        ...(wizard ?? baseConfig?.wizard ? { wizard: wizard ?? baseConfig?.wizard } : {}),
        ...(settings ?? baseConfig?.settings ? { settings: settings ?? baseConfig?.settings } : {}),
        ...(Object.keys(mergedLookups).length > 0 && { lookups: mergedLookups }),
      };
      const composed = composeForm(options);
      // Carry over inline templates if present
      if (baseTemplates) {
        composed.templates = { ...baseTemplates, ...composed.templates };
      }
      return composed;
    }

    // If only baseConfig provided (no JSX children, no fragments), return it as-is
    return baseConfig ?? { version: 2 as const, fields: {} };
  }, [children, fieldOrder, wizard, settings, lookups, baseConfig]);

  const defaultValues = entityData ?? {};

  return (
    <Formosaic
      configName={configName}
      testId={testId}
      formConfig={composedConfig}
      defaultValues={defaultValues}
      areAllFieldsReadonly={readOnly}
      saveData={onSave ? async (data) => { await onSave(data); return data; } : undefined}
    />
  );
}
ComposedForm.displayName = "ComposedForm";
