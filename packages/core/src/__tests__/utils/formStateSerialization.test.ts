import { describe, it, expect } from "vitest";
import { serializeFormState, deserializeFormState } from "../../utils/formStateSerialization";

describe("formStateSerialization", () => {
  it("serializes and deserializes a simple object", () => {
    const data = { name: "Alice", age: 30, active: true };
    const json = serializeFormState(data);
    const result = deserializeFormState(json);

    expect(result).toEqual(data);
  });

  it("handles Date objects round-trip", () => {
    const now = new Date("2025-01-15T12:00:00.000Z");
    const data = { createdAt: now, title: "Test" };
    const json = serializeFormState(data);

    // The serialized form should contain the __type marker
    expect(json).toContain("__type");
    expect(json).toContain("Date");

    const result = deserializeFormState(json);
    expect(result.createdAt).toBeInstanceOf(Date);
    expect((result.createdAt as Date).toISOString()).toBe("2025-01-15T12:00:00.000Z");
    expect(result.title).toBe("Test");
  });

  it("handles nested objects", () => {
    const data = {
      user: {
        name: "Bob",
        address: {
          city: "Seattle",
          zip: "98101",
        },
      },
      count: 42,
    };

    const json = serializeFormState(data);
    const result = deserializeFormState(json);

    expect(result).toEqual(data);
    expect((result.user as Record<string, unknown>)).toEqual(data.user);
  });

  it("handles null values", () => {
    const data = { name: null, value: "present", empty: null };
    const json = serializeFormState(data);
    const result = deserializeFormState(json);

    expect(result.name).toBeNull();
    expect(result.value).toBe("present");
    expect(result.empty).toBeNull();
  });

  it("handles arrays", () => {
    const data = {
      tags: ["alpha", "beta", "gamma"],
      scores: [100, 200, 300],
      mixed: [1, "two", true, null],
    };

    const json = serializeFormState(data);
    const result = deserializeFormState(json);

    expect(result).toEqual(data);
  });

  it("handles nested Date objects in arrays", () => {
    const date1 = new Date("2024-06-01T00:00:00.000Z");
    const date2 = new Date("2024-12-25T00:00:00.000Z");
    const data = { dates: [date1, date2] };

    const json = serializeFormState(data);
    const result = deserializeFormState(json);

    const resultDates = result.dates as Date[];
    expect(resultDates).toHaveLength(2);
    expect(resultDates[0]).toBeInstanceOf(Date);
    expect(resultDates[1]).toBeInstanceOf(Date);
    expect(resultDates[0].toISOString()).toBe("2024-06-01T00:00:00.000Z");
    expect(resultDates[1].toISOString()).toBe("2024-12-25T00:00:00.000Z");
  });

  it("handles empty object", () => {
    const data = {};
    const json = serializeFormState(data);
    const result = deserializeFormState(json);

    expect(result).toEqual({});
  });

  it("handles nested Dates inside objects", () => {
    const data = {
      event: {
        name: "Launch",
        startDate: new Date("2025-03-01T09:00:00.000Z"),
        endDate: new Date("2025-03-01T17:00:00.000Z"),
      },
    };

    const json = serializeFormState(data);
    const result = deserializeFormState(json);

    const event = result.event as Record<string, unknown>;
    expect(event.name).toBe("Launch");
    expect(event.startDate).toBeInstanceOf(Date);
    expect(event.endDate).toBeInstanceOf(Date);
    expect((event.startDate as Date).toISOString()).toBe("2025-03-01T09:00:00.000Z");
    expect((event.endDate as Date).toISOString()).toBe("2025-03-01T17:00:00.000Z");
  });
});
