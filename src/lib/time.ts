/**
 * Pure, dependency-free helpers for working with the "HH:mm" time strings
 * and DayOfWeek values used throughout the schedule data. Kept separate from
 * any component so they're trivially unit-testable and reusable wherever
 * times need comparing, sorting, or displaying.
 */
import type { DayOfWeek, ScheduleSlot } from "@/types/course";

/** Canonical day ordering used for rendering the weekly grid's columns. */
export const DAYS_OF_WEEK: DayOfWeek[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/**
 * Converts a "HH:mm" (24h) string into minutes since midnight.
 * Used for numeric comparison (sorting, conflict checks) and for positioning
 * a schedule block vertically within the grid.
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
 * single comma-separated line, for compact display in course/section lists.
 *
 * @example formatSchedule([
 *   { day: "Monday", startTime: "10:00", endTime: "11:30" },
 *   { day: "Thursday", startTime: "10:00", endTime: "11:30" },
 * ])
 * // "Mon 10:00 AM - 11:30 AM, Thu 10:00 AM - 11:30 AM"
 */
export function formatSchedule(schedule: ScheduleSlot[]): string {
  return schedule.map(formatScheduleSlot).join(", ");
}