import { DAYS_OF_WEEK } from "@/lib/time";
import {
  COURSE_CATEGORY_IDS,
  type CourseCategoryId,
  type DayOfWeek,
  type ScheduleSlot,
  type Section,
  type SelectedSection,
} from "@/types/course";

/**
 * Validates a schedule read back out of localStorage.
 *
 * Stored JSON is untrusted input: TypeScript checks nothing at runtime, so casting it
 * with `as SelectedSection[]` would let a stale shape through silently. That isn't
 * hypothetical — adding the `category` field left every previously saved schedule
 * missing it, which rendered as the wrong color rather than as an error.
 *
 * Malformed entries are dropped individually instead of rejecting the whole payload,
 * so one unreadable course doesn't cost the student the rest of their schedule.
 *
 * Deliberately hand-written rather than reaching for a schema library: the shape is
 * small and fixed, and a dependency would be more weight than the problem deserves.
 */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isDayOfWeek(value: unknown): value is DayOfWeek {
  return typeof value === "string" && (DAYS_OF_WEEK as string[]).includes(value);
}

function isCourseCategoryId(value: unknown): value is CourseCategoryId {
  return typeof value === "string" && (COURSE_CATEGORY_IDS as readonly string[]).includes(value);
}

function parseScheduleSlot(value: unknown): ScheduleSlot | null {
  if (!isRecord(value)) return null;

  const { day, startTime, endTime, room } = value;
  if (!isDayOfWeek(day)) return null;
  if (!isNonEmptyString(startTime) || !isNonEmptyString(endTime)) return null;
  if (!isNonEmptyString(room)) return null;

  return { day, startTime, endTime, room };
}

function parseSection(value: unknown): Section | null {
  if (!isRecord(value)) return null;

  const { id, section, instructor, schedule } = value;
  if (!isNonEmptyString(id) || !isNonEmptyString(section)) return null;
  if (!isNonEmptyString(instructor)) return null;
  if (!Array.isArray(schedule)) return null;

  const slots: ScheduleSlot[] = [];
  for (const rawSlot of schedule) {
    const slot = parseScheduleSlot(rawSlot);
    // A section with an unreadable meeting time can't be placed on the grid, so the
    // whole section is rejected rather than rendered with a missing day.
    if (!slot) return null;
    slots.push(slot);
  }

  return { id, section, instructor, schedule: slots };
}

function parseSelectedSection(value: unknown): SelectedSection | null {
  if (!isRecord(value)) return null;

  const { courseId, courseCode, courseTitle, units, category, section } = value;
  if (!isNonEmptyString(courseId) || !isNonEmptyString(courseCode)) return null;
  if (!isNonEmptyString(courseTitle)) return null;
  if (typeof units !== "number" || !Number.isFinite(units)) return null;
  if (!isCourseCategoryId(category)) return null;

  const parsedSection = parseSection(section);
  if (!parsedSection) return null;

  return { courseId, courseCode, courseTitle, units, category, section: parsedSection };
}

/** Returns every valid selection in the stored payload; an empty array if none survive. */
export function parseStoredSchedule(raw: string): SelectedSection[] {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) return [];

  const selections: SelectedSection[] = [];
  for (const item of parsed) {
    const selected = parseSelectedSection(item);
    if (selected) selections.push(selected);
  }

  return selections;
}