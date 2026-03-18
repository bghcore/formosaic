import { describe, it, expect, beforeEach } from "vitest";
import {
  registerLookupTables,
  getLookupTable,
  resetLookupTables,
} from "../../templates/LookupRegistry";

describe("LookupRegistry", () => {
  beforeEach(() => { resetLookupTables(); });

  it("returns undefined for unregistered table", () => {
    expect(getLookupTable("stateOptions")).toBeUndefined();
  });

  it("registers and retrieves a lookup table", () => {
    registerLookupTables({ stateOptions: { US: [{ value: "CA", label: "California" }] } });
    const table = getLookupTable("stateOptions");
    expect(table).toBeDefined();
  });

  it("merges multiple registrations", () => {
    registerLookupTables({ a: 1 });
    registerLookupTables({ b: 2 });
    expect(getLookupTable("a")).toBe(1);
    expect(getLookupTable("b")).toBe(2);
  });

  it("resetLookupTables clears all tables", () => {
    registerLookupTables({ a: 1 });
    resetLookupTables();
    expect(getLookupTable("a")).toBeUndefined();
  });
});
