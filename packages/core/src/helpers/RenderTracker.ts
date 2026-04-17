/**
 * RenderTracker — Module-level render count tracking for FormDevTools.
 *
 * Tracks per-field render counts and which fields re-rendered on the last change.
 *
 * Disabled by default. Callers (e.g. FormDevTools) must call `enableRenderTracker()`
 * to opt in. See audit P1-22 — when disabled, `trackRender` is a no-op fast path
 * so there is no hot-path cost / unbounded memory growth.
 */

const renderCounts: Map<string, number> = new Map();
let lastRenderedFields: Set<string> = new Set();
let pendingRenderedFields: Set<string> = new Set();
let totalFormRenders = 0;
let enabled = false;

/** Enable render tracking (e.g. when mounting FormDevTools). */
export function enableRenderTracker(): void {
  enabled = true;
}

/** Disable render tracking and clear state. */
export function disableRenderTracker(): void {
  enabled = false;
}

/** Whether tracking is currently enabled. */
export function isRenderTrackerEnabled(): boolean {
  return enabled;
}

/**
 * Record a render for the given field. Call this from RenderField.
 */
export function trackRender(fieldName: string): void {
  if (!enabled) return;
  renderCounts.set(fieldName, (renderCounts.get(fieldName) ?? 0) + 1);
  pendingRenderedFields.add(fieldName);
}

/**
 * Call once per form render cycle to snapshot which fields rendered.
 */
export function flushRenderCycle(): void {
  lastRenderedFields = pendingRenderedFields;
  pendingRenderedFields = new Set();
  totalFormRenders++;
}

/**
 * Returns the current render counts for all tracked fields.
 */
export function getRenderCounts(): Map<string, number> {
  return new Map(renderCounts);
}

/**
 * Returns the set of field names that rendered in the last cycle.
 */
export function getLastRenderedFields(): Set<string> {
  return new Set(lastRenderedFields);
}

/**
 * Returns total form render count.
 */
export function getTotalFormRenders(): number {
  return totalFormRenders;
}

/**
 * Reset all tracking data.
 */
export function resetRenderTracker(): void {
  renderCounts.clear();
  lastRenderedFields.clear();
  pendingRenderedFields.clear();
  totalFormRenders = 0;
}
