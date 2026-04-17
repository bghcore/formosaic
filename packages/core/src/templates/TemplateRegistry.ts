import { IFormTemplate } from "../types/IFormTemplate";

/**
 * SSR / multi-tenant contract (audit P1-21):
 *
 * This module-level registry is a plugin registry: it is intended to be
 * populated ONCE at app boot (outside of any request handler) and then read
 * from at request time. Templates registered here are shared across all
 * requests served by the same Node process — do NOT call registerFormTemplate
 * from inside a per-request code path (route handler, Server Component render,
 * Server Action) unless the template is truly static for the whole deploy.
 *
 * Per-request template variation should be handled by passing a resolved
 * `IFormConfig` directly to <Formosaic> instead of relying on this registry.
 */
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
