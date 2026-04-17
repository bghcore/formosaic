/**
 * SSR / multi-tenant contract (audit P1-21):
 *
 * Plugin-style registry for static lookup tables referenced as
 * `$lookup.tableName` in template expressions. Populate ONCE at app boot;
 * values are shared across all requests served by the same Node process.
 * Do NOT register per-request / per-tenant lookup data here — pass it via
 * template params instead.
 */
let registry: Record<string, unknown> = {};

export function registerLookupTables(tables: Record<string, unknown>): void {
  registry = { ...registry, ...tables };
}

export function getLookupTable(name: string): unknown | undefined {
  return registry[name];
}

export function resetLookupTables(): void {
  registry = {};
}
