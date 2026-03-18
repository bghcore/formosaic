import { IFormTemplate } from "../types/IFormTemplate";

let registry: Record<string, IFormTemplate> = {};

export function registerFormTemplate<TParams extends Record<string, unknown> = Record<string, unknown>>(
  name: string,
  template: IFormTemplate<TParams>
): void {
  registry[name] = template;
}

export function registerFormTemplates(templates: Record<string, IFormTemplate>): void {
  for (const [name, template] of Object.entries(templates)) {
    registry[name] = template;
  }
}

export function getFormTemplate(name: string): IFormTemplate | undefined {
  return registry[name];
}

export function resetFormTemplates(): void {
  registry = {};
}
