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
