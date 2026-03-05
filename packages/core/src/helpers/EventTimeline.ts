/**
 * EventTimeline — Module-level chronological event log for FormDevTools.
 *
 * Logs timestamped events from the rules engine, field changes, and validations.
 */

export type TimelineEventType = "field_change" | "rule_evaluated" | "validation_run" | "form_submit";

export interface ITimelineEvent {
  timestamp: number;
  type: TimelineEventType;
  fieldName: string;
  details: string;
}

const timeline: ITimelineEvent[] = [];
const MAX_EVENTS = 500;

/**
 * Log a new event to the timeline.
 */
export function logEvent(type: TimelineEventType, fieldName: string, details: string): void {
  timeline.push({ timestamp: Date.now(), type, fieldName, details });
  // Keep bounded to avoid unbounded memory growth
  if (timeline.length > MAX_EVENTS) {
    timeline.splice(0, timeline.length - MAX_EVENTS);
  }
}

/**
 * Returns a copy of the full timeline.
 */
export function getTimeline(): ITimelineEvent[] {
  return [...timeline];
}

/**
 * Clear all timeline events.
 */
export function clearTimeline(): void {
  timeline.length = 0;
}
