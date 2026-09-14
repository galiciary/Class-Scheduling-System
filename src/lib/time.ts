/**
 * Pure, dependency-free helpers and domain constants for the "HH:mm" time strings
 * and DayOfWeek values used throughout the schedule data. Kept separate from any
 * component so they're trivially unit-testable and reusable wherever times need
 * comparing, sorting, or displaying.
 */
import type { DayOfWeek, ScheduleSlot } from "@/types/course";

/** A start/end pair, independent of which day it falls on. */
export interface TimeRange {
  startTime: string;
  endTime: string;
}

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
 * The standard class periods: 1.5-hour blocks from 7:30 AM with 15-minute breaks
 * between them, running to 9:15 PM.
 *
 * The timetable renders all of these regardless of what's selected, so the shape of
 * the week stays readable even with an empty or partly-filled schedule.
 */
export const CLASS_PERIODS: TimeRange[] = [
  { startTime: "07:30", endTime: "09:00" },
  { startTime: "09:15", endTime: "10:45" },
  { startTime: "11:00", endTime: "12:30" },
  { startTime: "12:45", endTime: "14:15" },
  { startTime: "14:30", endTime: "16:00" },
  { startTime: "16:15", endTime: "17:45" },
  { startTime: "18:00", endTime: "19:30" },
  { startTime: "19:45", endTime: "21:15" },
];

/**
 * Converts a "HH:mm" (24h) string into minutes since midnight.
 * Used for numeric comparison (sorting, conflict checks) and for positioning
 * a schedule block within the grid.
 *
 * @example timeToMinutes("10:00") // 600
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Formats a "HH:mm" (24h) string into a friendly 12-hour label.
 *
 * @example formatTime("10:00") // "10:00 AM"
 * @example formatTime("14:30") // "2:30 PM"
 */
export function formatTime(time: string): string {
  const [hoursStr, minutesStr] = time.split(":");
  const hours = Number(hoursStr);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${minutesStr} ${period}`;
}

/**
 * Formats a single schedule slot's day and time range as one readable string.
 *
 * @example formatScheduleSlot({ day: "Monday", startTime: "10:00", endTime: "11:30" })
 * // "Mon 10:00 AM - 11:30 AM"
 */
export function formatScheduleSlot(slot: ScheduleSlot): string {
  return `${slot.day.slice(0, 3)} ${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`;
}

/**
 * Formats a section's full schedule (which may span multiple days) into a
 * single comma-separated line.
 */
export function formatSchedule(schedule: ScheduleSlot[]): string {
  return schedule.map(formatScheduleSlot).join(", ");
}

/**
 * Compact variant for dense UI: when every meeting shares the same time (the
 * normal case — a section meets at the same hour on each of its days), the days
 * are grouped and the time is stated once. Falls back to the verbose form when
 * the times actually differ per day.
 *
 * @example formatScheduleCompact([
 *   { day: "Monday", startTime: "10:00", endTime: "11:30" },
 *   { day: "Thursday", startTime: "10:00", endTime: "11:30" },
 * ])
 * // "Mon/Thu 10:00 AM – 11:30 AM"
 */
export function formatScheduleCompact(schedule: ScheduleSlot[]): string {
  if (schedule.length === 0) return "Schedule TBA";

  const [first] = schedule;
  const allShareOneTime = schedule.every(
    (slot) => slot.startTime === first.startTime && slot.endTime === first.endTime,
  );

  if (!allShareOneTime) return formatSchedule(schedule);

  const days = schedule.map((slot) => slot.day.slice(0, 3)).join("/");
  return `${days} ${formatTime(first.startTime)} – ${formatTime(first.endTime)}`;
}