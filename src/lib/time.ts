/**
 * Pure, dependency-free helpers and domain constants for the "HH:mm" time strings
 * and DayOfWeek values used throughout the schedule data. Kept separate from any
 * component so they're trivially unit-testable and reusable wherever times need
 * comparing, sorting, or displaying.
 */
import type { DayOfWeek, ScheduleSlot } from "@/types/course";

/**
 * Full week in order, Sunday last. Only used to order days that fall outside the
 * normal class week (see CLASS_DAYS) so they still sort predictably.
 */
export const DAYS_OF_WEEK: DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

/**
 * Columns the timetable always shows. Classes aren't scheduled on Sundays, so
 * rendering a permanently empty Sunday column would only waste horizontal space.
 */
export const CLASS_DAYS: DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/**
 * Vertical bounds of the timetable, fixed regardless of what's selected.
 *
 * Classes run from 7:30 AM to 9:15 PM, so the grid spans 7:30 AM to 9:30 PM. Fixing
 * the bounds is what keeps the grid from resizing as classes are added: it's drawn to
 * full height on first paint, and blocks are positioned on top of it rather than
 * stacked inside it.
 */
export const GRID_START_MINUTES = 7 * 60 + 30;
export const GRID_END_MINUTES = 21 * 60 + 30;

/** Spacing of the timetable's gridlines and time labels. */
export const GRID_INTERVAL_MINUTES = 30;

/**
 * Converts a "HH:mm" (24h) string into minutes since midnight.
 *
 * Minutes are the unit every positional calculation works in — sorting, overlap
 * detection, and how far down the grid a block sits.
 *
 * @example timeToMinutes("10:00") // 600
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/** Inverse of timeToMinutes. @example minutesToTime(600) // "10:00" */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

/**
 * Formats a "HH:mm" (24h) string into a friendly 12-hour label.
 *
 * @example formatTime("07:30") // "7:30 AM"
 * @example formatTime("14:30") // "2:30 PM"
 */
export function formatTime(time: string): string {
  const [hoursStr, minutesStr] = time.split(":");
  const hours = Number(hoursStr);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${minutesStr} ${period}`;
}

/** Formats minutes since midnight directly, for the grid's time axis. */
export function formatMinutes(minutes: number): string {
  return formatTime(minutesToTime(minutes));
}

/** Formats a time range, e.g. "9:15 AM – 10:45 AM". */
export function formatTimeRange(startTime: string, endTime: string): string {
  return `${formatTime(startTime)} – ${formatTime(endTime)}`;
}

/**
 * Formats one meeting as a single line, e.g. "Mon 9:15 AM – 10:45 AM · G208".
 *
 * Each slot is rendered on its own line rather than grouping days that share a time,
 * because a section can meet on campus one day and online the next — collapsing them
 * would hide the difference that matters most when planning a week.
 */
export function formatSlot(slot: ScheduleSlot): string {
  return `${slot.day.slice(0, 3)} ${formatTimeRange(slot.startTime, slot.endTime)} · ${slot.room}`;
}

/**
 * Gridline positions, in minutes since midnight, at GRID_INTERVAL_MINUTES spacing.
 * The bounds are already snapped to whole intervals by buildTimetable, so these line
 * up exactly with the repeating background the grid paints.
 */
export function buildTimeAxis(startMinutes: number, endMinutes: number): number[] {
  const marks: number[] = [];

  for (let minutes = startMinutes; minutes <= endMinutes; minutes += GRID_INTERVAL_MINUTES) {
    marks.push(minutes);
  }

  return marks;
}