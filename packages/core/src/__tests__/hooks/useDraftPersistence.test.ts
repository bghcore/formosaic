import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { useDraftPersistence } from "../../hooks/useDraftPersistence";

/**
 * Minimal renderHook helper that avoids @testing-library/react dependency.
 * Uses react-dom/client createRoot API (React 18+/19).
 */
function renderHook<T>(hookFn: () => T): { result: { current: T }; unmount: () => void } {
  const result = { current: undefined as unknown as T };
  const container = document.createElement("div");
  document.body.appendChild(container);
  let root: Root;

  const TestComponent = () => {
    result.current = hookFn();
    return null;
  };

  act(() => {
    root = createRoot(container);
    root.render(React.createElement(TestComponent));
  });

  return {
    result,
    unmount: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}

describe("useDraftPersistence", () => {
  let mockStorage: Record<string, string>;

  beforeEach(() => {
    mockStorage = {};
    vi.useFakeTimers();

    vi.stubGlobal("localStorage", {
      getItem: vi.fn((key: string) => mockStorage[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        mockStorage[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStorage[key];
      }),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("saves draft to localStorage on interval", () => {
    const data = { name: "Alice", age: 30 };

    renderHook(() =>
      useDraftPersistence({
        formId: "test-form",
        data,
        saveIntervalMs: 5000,
      })
    );

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(localStorage.setItem).toHaveBeenCalled();
    const storedValue = mockStorage["draft_test-form"];
    expect(storedValue).toBeDefined();
    const parsed = JSON.parse(storedValue);
    expect(parsed.data).toEqual(data);
    expect(typeof parsed.timestamp).toBe("number");
  });

  it("recoverDraft returns saved data", () => {
    const draftData = { name: "Bob" };
    const draftState = JSON.stringify({ data: draftData, timestamp: 1234567890 });
    mockStorage["draft_test-form"] = draftState;

    const { result } = renderHook(() =>
      useDraftPersistence({
        formId: "test-form",
        data: {},
        saveIntervalMs: 30000,
      })
    );

    let recovered: ReturnType<typeof result.current.recoverDraft>;
    act(() => {
      recovered = result.current.recoverDraft();
    });

    expect(recovered!).not.toBeNull();
    expect(recovered!.data).toEqual(draftData);
    expect(recovered!.timestamp).toBe(1234567890);
  });

  it("clearDraft removes from localStorage", () => {
    mockStorage["draft_test-form"] = JSON.stringify({ data: { x: 1 }, timestamp: 100 });

    const { result } = renderHook(() =>
      useDraftPersistence({
        formId: "test-form",
        data: {},
        saveIntervalMs: 30000,
      })
    );

    act(() => {
      result.current.clearDraft();
    });

    expect(localStorage.removeItem).toHaveBeenCalledWith("draft_test-form");
    expect(mockStorage["draft_test-form"]).toBeUndefined();
    expect(result.current.hasDraft).toBe(false);
  });

  it("hasDraft is true when draft exists", () => {
    mockStorage["draft_test-form"] = JSON.stringify({ data: { x: 1 }, timestamp: 100 });

    const { result } = renderHook(() =>
      useDraftPersistence({
        formId: "test-form",
        data: {},
        saveIntervalMs: 30000,
      })
    );

    expect(result.current.hasDraft).toBe(true);
  });

  it("hasDraft is false when no draft exists", () => {
    const { result } = renderHook(() =>
      useDraftPersistence({
        formId: "test-form",
        data: {},
        saveIntervalMs: 30000,
      })
    );

    expect(result.current.hasDraft).toBe(false);
  });

  it("handles localStorage errors gracefully (mock throw)", () => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => {
        throw new Error("localStorage unavailable");
      }),
      setItem: vi.fn(() => {
        throw new Error("localStorage unavailable");
      }),
      removeItem: vi.fn(() => {
        throw new Error("localStorage unavailable");
      }),
    });

    const { result } = renderHook(() =>
      useDraftPersistence({
        formId: "test-form",
        data: { name: "Error test" },
        saveIntervalMs: 1000,
      })
    );

    // Should not throw, hasDraft should be false
    expect(result.current.hasDraft).toBe(false);

    // saveDraft should not throw
    act(() => {
      result.current.saveDraft();
    });

    // recoverDraft should return null without throwing
    let recovered: ReturnType<typeof result.current.recoverDraft>;
    act(() => {
      recovered = result.current.recoverDraft();
    });
    expect(recovered!).toBeNull();

    // clearDraft should not throw
    act(() => {
      result.current.clearDraft();
    });

    // Advancing timer should not throw (interval attempts save which would fail)
    act(() => {
      vi.advanceTimersByTime(1000);
    });
  });

  it("cleanup clears interval on unmount", () => {
    const clearIntervalSpy = vi.spyOn(global, "clearInterval");

    const { unmount } = renderHook(() =>
      useDraftPersistence({
        formId: "test-form",
        data: { name: "cleanup test" },
        saveIntervalMs: 5000,
      })
    );

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });

  it("saveDraft manually persists current state", () => {
    const data = { title: "Manual save" };

    const { result } = renderHook(() =>
      useDraftPersistence({
        formId: "manual-form",
        data,
        saveIntervalMs: 60000,
      })
    );

    act(() => {
      result.current.saveDraft();
    });

    expect(localStorage.setItem).toHaveBeenCalled();
    const stored = mockStorage["draft_manual-form"];
    expect(stored).toBeDefined();
    const parsed = JSON.parse(stored);
    expect(parsed.data).toEqual(data);
  });

  it("uses custom storage key prefix", () => {
    const data = { field: "value" };

    renderHook(() =>
      useDraftPersistence({
        formId: "my-form",
        data,
        saveIntervalMs: 1000,
        storageKeyPrefix: "custom_prefix_",
      })
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(mockStorage["custom_prefix_my-form"]).toBeDefined();
  });

  it("does not save when enabled is false", () => {
    renderHook(() =>
      useDraftPersistence({
        formId: "disabled-form",
        data: { x: 1 },
        saveIntervalMs: 1000,
        enabled: false,
      })
    );

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(localStorage.setItem).not.toHaveBeenCalled();
  });
});
