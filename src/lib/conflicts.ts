import type { TimetableEntry } from "@/lib/buildTimetable";
import { DAYS_OF_WEEK, formatTime, timeToMinutes } from "@/lib/time";
import type { DayOfWeek } from "@/types/course";

/**
 * Schedule conflict detection.
 *
 * The assessment's mock data is conflict-free and the brief doesn't require this,
 * but nothing stops a student from picking two sections that overlap, so the app
 * warns instead of pretending it can't happen. It warns rather than blocking the
 * selection: seeing the clash on the grid is what tells you which section to swap.
 *
 * Pure functions with no React dependency, so the rules can be unit-tested directly.
 */

/** Two sections that overlap in time, along with every day they clash on. */
export interface ScheduleConflict {
  id: string;
  /** Days on which these two overlap, in week order. */
  days: DayOfWeek[];
  /** The overlapping window itself, e.g. "12:45 PM – 2:15 PM". */
  timeLabel: string;
  first: TimetableEntry;
  second: TimetableEntry;
}

export interface ConflictReport {
  conflicts: ScheduleConflict[];
  /** Ids of every entry involved in at least one conflict, for highlighting cards. */
  conflictingEntryIds: Set<string>;
}

/** Half-open overlap test: classes that merely touch (one ends as the next begins) don't clash. */
function overlaps(a: TimetableEntry, b: TimetableEntry): boolean {
  return (
    timeToMinutes(a.startTime) < timeToMinutes(b.endTime) &&
    timeToMinutes(b.startTime) < timeToMinutes(a.endTime)
  );
}

export function detectConflicts(entries: TimetableEntry[]): ConflictReport {
  const entriesByDay = new Map<DayOfWeek, TimetableEntry[]>();
  for (const entry of entries) {
    const dayEntries = entriesByDay.get(entry.day);
    if (dayEntries) {
      dayEntries.push(entry);
    } else {
      entriesByDay.set(entry.day, [entry]);
    }
  }

  // Keyed by section pair + overlap window, so a course meeting Tue/Fri against the
  // same clashing course reports as one conflict on two days, not two conflicts.
  const conflictsByPair = new Map<string, ScheduleConflict>();
  const conflictingEntryIds = new Set<string>();

  for (const [day, dayEntries] of entriesByDay) {
    const sorted = [...dayEntries].sort(
      (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
    );

    for (let i = 0; i < sorted.length; i += 1) {
      const current = sorted[i];

      for (let j = i + 1; j < sorted.length; j += 1) {
        const next = sorted[j];

        // Sorted by start time: once a later class starts at or after this one ends,
        // every class after it does too, so there's nothing left to compare.
        if (timeToMinutes(next.startTime) >= timeToMinutes(current.endTime)) break;
        if (!overlaps(current, next)) continue;

        conflictingEntryIds.add(current.id);
        conflictingEntryIds.add(next.id);

        const overlapStart =
          timeToMinutes(current.startTime) > timeToMinutes(next.startTime)
            ? current.startTime
            : next.startTime;
        const overlapEnd =
          timeToMinutes(current.endTime) < timeToMinutes(next.endTime)
            ? current.endTime
            : next.endTime;

        const pairKey = [current.sectionId, next.sectionId].sort().join("--");
        const key = `${pairKey}-${overlapStart}-${overlapEnd}`;

        const existing = conflictsByPair.get(key);
        if (existing) {
          if (!existing.days.includes(day)) existing.days.push(day);
          continue;
        }

        conflictsByPair.set(key, {
          id: key,
          days: [day],
          timeLabel: `${formatTime(overlapStart)} – ${formatTime(overlapEnd)}`,
          first: current,
          second: next,
        });
      }
    }
  }

  const dayIndex = (day: DayOfWeek) => DAYS_OF_WEEK.indexOf(day);

  const conflicts = [...conflictsByPair.values()].map((conflict) => ({
    ...conflict,
    days: [...conflict.days].sort((a, b) => dayIndex(a) - dayIndex(b)),
  }));

  conflicts.sort(
    (a, b) =>
      dayIndex(a.days[0]) - dayIndex(b.days[0]) ||
      timeToMinutes(a.first.startTime) - timeToMinutes(b.first.startTime),
  );

  return { conflicts, conflictingEntryIds };
}

/** "Tuesday and Friday", "Monday, Wednesday and Friday". */
function formatDayList(days: DayOfWeek[]): string {
  if (days.length === 1) return days[0];
  return `${days.slice(0, -1).join(", ")} and ${days[days.length - 1]}`;
}

/** One-line description of a conflict, kept here so the wording stays testable. */
export function describeConflict(conflict: ScheduleConflict): string {
  const first = `${conflict.first.courseCode} ${conflict.first.sectionCode}`;
  const second = `${conflict.second.courseCode} ${conflict.second.sectionCode}`;
  return `${first} overlaps ${second} on ${formatDayList(conflict.days)}, ${conflict.timeLabel}`;
}