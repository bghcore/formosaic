import { useEffect, useCallback, useRef, useState } from "react";
import { IEntityData } from "../utils";
import { serializeFormState, deserializeFormState } from "../utils/formStateSerialization";

export interface IDraftPersistenceOptions {
  /** Unique form identifier for storage key */
  formId: string;
  /** Current form data to persist */
  data: IEntityData;
  /** Auto-save interval in ms (default 30000) */
  saveIntervalMs?: number;
  /** Whether persistence is enabled (default true) */
  enabled?: boolean;
  /** Custom storage key prefix (default "draft_") */
  storageKeyPrefix?: string;
}

export interface IDraftState {
  data: IEntityData;
  timestamp: number;
}

export interface IUseDraftPersistenceResult {
  /** Recover a saved draft if one exists */
  recoverDraft: () => IDraftState | null;
  /** Clear the saved draft */
  clearDraft: () => void;
  /** Whether a draft exists */
  hasDraft: boolean;
  /** Manually save current state as draft */
  saveDraft: () => void;
}

function getStorageKey(formId: string, prefix: string): string {
  return `${prefix}${formId}`;
}

/**
 * Hook that persists form draft state to localStorage on a configurable interval.
 *
 * Handles localStorage errors gracefully (e.g. private browsing, quota exceeded).
 */
export function useDraftPersistence(options: IDraftPersistenceOptions): IUseDraftPersistenceResult {
  const {
    formId,
    data,
    saveIntervalMs = 30000,
    enabled = true,
    storageKeyPrefix = "draft_",
  } = options;

  const [hasDraft, setHasDraft] = useState<boolean>(false);
  const dataRef = useRef<IEntityData>(data);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  // Keep dataRef up to date with the latest data
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const storageKey = getStorageKey(formId, storageKeyPrefix);

  const saveDraft = useCallback(() => {
    try {
      const draftState: IDraftState = {
        data: dataRef.current,
        timestamp: Date.now(),
      };
      localStorage.setItem(storageKey, serializeFormState(draftState as unknown as IEntityData));
      setHasDraft(true);
    } catch {
      // localStorage may throw in private browsing or when quota is exceeded
    }
  }, [storageKey]);

  const recoverDraft = useCallback((): IDraftState | null => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return null;
      const parsed = deserializeFormState(stored) as unknown as IDraftState;
      return parsed;
    } catch {
      return null;
    }
  }, [storageKey]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setHasDraft(false);
    } catch {
      // localStorage may throw in private browsing
    }
  }, [storageKey]);

  // On mount, check if a draft exists
  useEffect(() => {
    if (!enabled) return;
    try {
      const stored = localStorage.getItem(storageKey);
      setHasDraft(stored !== null);
    } catch {
      setHasDraft(false);
    }
  }, [enabled, storageKey]);

  // Set up auto-save interval
  useEffect(() => {
    if (!enabled) return;

    intervalRef.current = setInterval(() => {
      saveDraft();
    }, saveIntervalMs);

    return () => {
      if (intervalRef.current !== undefined) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };
  }, [enabled, saveIntervalMs, saveDraft]);

  return {
    recoverDraft,
    clearDraft,
    hasDraft,
    saveDraft,
  };
}
