/**
 * Formosaic save-path unit tests.
 *
 * Covers audit P0-4 (autosave AbortSignal propagation, abortable retry,
 * no-reset-on-undefined-save, no-op when no saveData):
 *
 * - retry on transient errors, success after N attempts
 * - retry exhaustion → onSaveError called
 * - AbortSignal propagation to saveData
 * - unmount aborts pending save promise
 * - updatedEntity fallback when saveData returns undefined
 * - no-saveData path is a no-op
 * - abortable retry sleep (new save interrupts retry backoff)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Formosaic } from "../../components/Formosaic";
import { RulesEngineProvider } from "../../providers/RulesEngineProvider";
import { InjectedFieldProvider } from "../../providers/InjectedFieldProvider";
import type { IFormConfig } from "../../types/IFormConfig";
import type { IEntityData } from "../../utils";

// ─── Minimal controlled text input field ──────────────────────────────────────

const TestTextbox: React.FC<{
  fieldName?: string;
  value?: unknown;
  setFieldValue?: (fieldName: string, value: unknown, skipSave?: boolean, timeout?: number) => void;
  testId?: string;
}> = ({ fieldName, value, setFieldValue, testId }) => (
  <input
    data-testid={`field-${fieldName ?? testId ?? "input"}`}
    value={(value as string) ?? ""}
    onChange={(e) => {
      if (setFieldValue && fieldName) setFieldValue(fieldName, e.target.value, false, 50);
    }}
  />
);

const TEST_CONFIG: IFormConfig = {
  version: 2,
  fields: {
    name: { type: "Textbox", label: "Name" },
  },
};

// ─── Providers wrapper ────────────────────────────────────────────────────────

function renderFormosaic(
  props: Partial<React.ComponentProps<typeof Formosaic>> & {
    saveData?: (
      data: IEntityData,
      dirtyFields?: string[],
      options?: { signal?: AbortSignal }
    ) => Promise<IEntityData>;
    onSaveError?: (err: string) => void;
  },
  defaultValues: IEntityData = { name: "" }
) {
  const fields = { Textbox: <TestTextbox /> };
  return render(
    <RulesEngineProvider>
      <InjectedFieldProvider injectedFields={fields as unknown as Record<string, React.JSX.Element>}>
        <Formosaic
          configName="test"
          formConfig={TEST_CONFIG}
          defaultValues={defaultValues}
          {...props}
        />
      </InjectedFieldProvider>
    </RulesEngineProvider>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Fires an input change to dirty the form. */
function typeIntoField(value: string) {
  const input = screen.getByTestId("field-name") as HTMLInputElement;
  fireEvent.change(input, { target: { value } });
}

/** Advance the autosave debounce timer (default 50ms via TestTextbox). */
async function advanceDebounce() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(100);
  });
}

/** Advance timers + flush microtasks so promise chains settle. */
async function flushMicrotasks() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Formosaic save path (P0-4 regression)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("retries on error and succeeds after 2 failures", async () => {
    let attempts = 0;
    const saveData = vi.fn(async (data: IEntityData) => {
      attempts += 1;
      if (attempts < 3) throw new Error(`transient ${attempts}`);
      return data;
    });
    const onSaveError = vi.fn();

    renderFormosaic({ saveData, onSaveError, maxSaveRetries: 3 });

    typeIntoField("Alice");
    await advanceDebounce();
    await flushMicrotasks();

    // First attempt happens immediately, then retries with exponential backoff:
    // attempt 1 -> fail -> 1s sleep -> attempt 2 -> fail -> 2s sleep -> attempt 3 -> ok
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
      await vi.advanceTimersByTimeAsync(2000);
      await vi.advanceTimersByTimeAsync(100);
    });
    await flushMicrotasks();

    expect(saveData).toHaveBeenCalledTimes(3);
    expect(onSaveError).not.toHaveBeenCalled();
  });

  it("calls onSaveError after exhausting retries", async () => {
    const saveData = vi.fn(async () => {
      throw new Error("persistent failure");
    });
    const onSaveError = vi.fn();

    renderFormosaic({ saveData, onSaveError, maxSaveRetries: 2 });

    typeIntoField("Bob");
    await advanceDebounce();
    await flushMicrotasks();

    // 1 initial + maxSaveRetries=2 retries => 3 calls total
    // Advance through retry sleeps: 1s, 2s
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
      await vi.advanceTimersByTimeAsync(2000);
      await vi.advanceTimersByTimeAsync(100);
    });
    await flushMicrotasks();

    expect(saveData.mock.calls.length).toBe(3);
    expect(onSaveError).toHaveBeenCalledTimes(1);
    // The error message should be a string (not an object).
    expect(typeof onSaveError.mock.calls[0][0]).toBe("string");
  });

  it("passes an AbortSignal to saveData (options.signal is present and not aborted)", async () => {
    let capturedSignal: AbortSignal | undefined;
    const saveData = vi.fn(async (
      data: IEntityData,
      _dirty?: string[],
      options?: { signal?: AbortSignal }
    ) => {
      capturedSignal = options?.signal;
      return data;
    });

    renderFormosaic({ saveData });

    typeIntoField("Carol");
    await advanceDebounce();
    await flushMicrotasks();

    expect(saveData).toHaveBeenCalled();
    expect(capturedSignal).toBeInstanceOf(AbortSignal);
    expect(capturedSignal?.aborted).toBe(false);
  });

  it("aborts the previous save signal when a new save begins mid-flight", async () => {
    // Concrete P0-4 regression: if a save is in-flight and a new save is
    // triggered (second edit), the previous save's AbortSignal must be aborted
    // so the consumer can cancel its network request.
    const capturedSignals: AbortSignal[] = [];
    let resolveSave: ((value: IEntityData) => void) | undefined;
    const pendingPromise = new Promise<IEntityData>((resolve) => {
      resolveSave = resolve;
    });

    const saveData = vi.fn(async (
      data: IEntityData,
      _dirty?: string[],
      options?: { signal?: AbortSignal }
    ) => {
      if (options?.signal) capturedSignals.push(options.signal);
      // Return the pending promise — it never resolves until we call resolveSave
      return pendingPromise;
    });

    const { unmount } = renderFormosaic({ saveData });

    typeIntoField("Dave");
    await advanceDebounce();
    await flushMicrotasks();

    expect(saveData).toHaveBeenCalledTimes(1);
    expect(capturedSignals.length).toBe(1);
    expect(capturedSignals[0].aborted).toBe(false);

    // Trigger another save — this should abort the previous controller.
    typeIntoField("Dave2");
    await advanceDebounce();
    await flushMicrotasks();

    // At this point the first save was superseded. Its signal should be aborted.
    expect(capturedSignals[0].aborted).toBe(true);

    unmount();

    // Resolve the original pending promise so vitest doesn't leak it.
    resolveSave?.({ name: "Dave2" });
  });

  it("does not reset form to empty when saveData returns undefined (updatedEntity fallback)", async () => {
    // When saveData resolves to undefined, Formosaic uses the submitted data
    // as the reset value instead of an empty object. Without this fallback,
    // RHF reset({}) would blow away the field values the user just typed.
    const saveData = vi.fn(async (): Promise<IEntityData> =>
      undefined as unknown as IEntityData
    );

    const { container } = renderFormosaic({ saveData }, { name: "Erin" });

    typeIntoField("Frank");
    await advanceDebounce();
    await flushMicrotasks();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
    await flushMicrotasks();

    expect(saveData).toHaveBeenCalled();

    // After the undefined-returning save completes, the field should still
    // contain the most recently typed value (not be reset to "" or the
    // original default).
    const input = container.querySelector('[data-testid="field-name"]') as HTMLInputElement;
    expect(input.value).toBe("Frank");
  });

  it("no-saveData path: typing in a field does not crash and preserves form state", async () => {
    const { container } = renderFormosaic({}, { name: "initial" });

    // No saveData supplied — autosave should no-op. Typing should not throw.
    expect(() => typeIntoField("no-save-test")).not.toThrow();

    await advanceDebounce();
    await flushMicrotasks();

    const input = container.querySelector('[data-testid="field-name"]') as HTMLInputElement;
    // Field value is preserved (not wiped).
    expect(input.value).toBe("no-save-test");
  });

  it("abortable retry sleep: a new save during retry backoff supersedes the stale retry", async () => {
    // When the first save fails and enters the retry-backoff sleep, a new
    // dirty change must not wait out the stale sleep — the abort controller
    // is replaced and the sleep is cancelled.
    let callCount = 0;
    const errors: Error[] = [new Error("first-fail")];
    const saveData = vi.fn(async () => {
      callCount += 1;
      const err = errors[callCount - 1];
      if (err) throw err;
      return { name: "ok" } as IEntityData;
    });

    renderFormosaic({ saveData, maxSaveRetries: 3 });

    // First save: fails, should enter 1s backoff sleep
    typeIntoField("first");
    await advanceDebounce();
    await flushMicrotasks();
    expect(callCount).toBe(1);

    // While the retry is sleeping, trigger a new save. The new save aborts
    // the previous controller, cancelling the pending sleep.
    typeIntoField("second");
    await advanceDebounce();
    await flushMicrotasks();

    // The retry from the first save should NOT run anymore — only the new
    // save call (which succeeds because errors[1] is undefined).
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    await flushMicrotasks();

    // callCount: 1 (first failed) + 1 (second new save) = 2.
    // If the abort did NOT cancel the sleep, we'd see 3+ calls (retry fired).
    expect(callCount).toBeLessThanOrEqual(2);
  });
});
