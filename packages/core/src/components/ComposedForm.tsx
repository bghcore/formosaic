import React, { useMemo } from "react";
import { composeForm } from "../templates/ComposedFormBuilder";
import { IComposeFormOptions, IFragmentDef, IFormConnection } from "../types/IFormConnection";
import { IFieldConfig } from "../types/IFieldConfig";
import { IFormConfig, IFormSettings } from "../types/IFormConfig";
import { IWizardConfig } from "../types/IWizardConfig";
import { IFormFragmentProps } from "./FormFragment";
import { IFormConnectionProps } from "./FormConnection";
import { IFormFieldProps } from "./FormField";
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
  /** Children: FormFragment, FormField, FormConnection components. */
  children?: React.ReactNode;
}

export function ComposedForm(props: IComposedFormProps): React.ReactElement | null {
  const { children, config: baseConfig, settings, wizard, fieldOrder, lookups, ...formosaicProps } = props;

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

    const options: IComposeFormOptions = {
      fragments,
      ...(Object.keys(fields).length > 0 && { fields }),
      ...(connections.length > 0 && { connections }),
      ...(fieldOrder && { fieldOrder }),
      ...(wizard && { wizard }),
      ...(settings && { settings }),
      ...(lookups && { lookups }),
    };

    // If we have any fragments or fields from JSX, compose them
    if (Object.keys(fragments).length > 0 || Object.keys(fields).length > 0) {
      return composeForm(options);
    }

    // If only baseConfig provided (no JSX children), return it as-is
    return baseConfig ?? { version: 2 as const, fields: {} };
  }, [children, fieldOrder, wizard, settings, lookups, baseConfig]);

  // Lazy import to avoid circular deps — just render null with data-testid for now
  // The actual Formosaic integration will be wired in Task 9
  return React.createElement("div", { "data-testid": "composed-form" });
}
ComposedForm.displayName = "ComposedForm";
