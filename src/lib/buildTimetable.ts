import { CLASS_DAYS, CLASS_PERIODS, DAYS_OF_WEEK, formatTime, timeToMinutes } from "@/lib/time";
import type { DayOfWeek, SelectedSection } from "@/types/course";

/**
 * Transforms the student's selected sections into a renderable timetable.
 *
 * Kept as a pure function outside React so the grid components stay presentational
 * and this logic can be unit-tested on its own.
 *
 * The grid is fixed: every standard class period and every class day is rendered
 * whether or not anything is scheduled in it, so the week keeps its shape with an
 * empty or half-filled schedule. Anything in the data that falls outside that grid
 * (an unusual time range, or a Sunday class) is appended as an extra row or column
 * rather than dropped — the mock data never does this, but a real API might.
 */

/** One meeting of one section on one day — the unit rendered in a timetable cell. */
export interface TimetableEntry {
  /** Unique per section + day, so it's safe as a React key. */
  id: string;
  sectionId: string;
  courseCode: string;
  courseTitle: string;
  sectionCode: string;
  instructor: string;
  room: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
}

/** One time band in the timetable, holding whatever meets during it, keyed by day. */
export interface TimetableRow {
  startTime: string;
  endTime: string;
  /** Display label, e.g. "7:30 AM – 9:00 AM". */
  label: string;
  entriesByDay: Map<DayOfWeek, TimetableEntry[]>;
}

export interface Timetable {
  days: DayOfWeek[];
  /** Time bands, earliest first. */
  rows: TimetableRow[];
  /** Every meeting, flattened — used for conflict detection without re-walking the rows. */
  entries: TimetableEntry[];
}

function toTimeKey(startTime: string, endTime: string): string {
  return `${startTime}-${endTime}`;
}

function createRow(startTime: string, endTime: string): TimetableRow {
  return {
    startTime,
    endTime,
    label: `${formatTime(startTime)} – ${formatTime(endTime)}`,
    entriesByDay: new Map(),
  };
}

export function buildTimetable(selectedSections: SelectedSection[]): Timetable {
  const entries: TimetableEntry[] = [];

  for (const selected of selectedSections) {
    for (const slot of selected.section.schedule) {
      entries.push({
        id: `${selected.section.id}-${slot.day}-${slot.startTime}`,
        sectionId: selected.section.id,
        courseCode: selected.courseCode,
        courseTitle: selected.courseTitle,
        sectionCode: selected.section.section,
        instructor: selected.section.instructor,
        room: selected.section.room,
        day: slot.day,
        startTime: slot.startTime,
        endTime: slot.endTime,
      });
    }
  }

  // Columns: the standard class week, plus any day in the data that falls outside it.
  const usedDays = new Set(entries.map((entry) => entry.day));
  const unexpectedDays = DAYS_OF_WEEK.filter(
    (day) => usedDays.has(day) && !CLASS_DAYS.includes(day),
  );
  const days = [...CLASS_DAYS, ...unexpectedDays];

  // Rows: seed every standard period so the grid is complete before any data lands in it.
  const rowsByTime = new Map<string, TimetableRow>();
  for (const period of CLASS_PERIODS) {
    rowsByTime.set(
      toTimeKey(period.startTime, period.endTime),
      createRow(period.startTime, period.endTime),
    );
  }

  for (const entry of entries) {
    const timeKey = toTimeKey(entry.startTime, entry.endTime);

    let row = rowsByTime.get(timeKey);
    if (!row) {
      // A time range that isn't one of the standard periods — give it its own row.
      row = createRow(entry.startTime, entry.endTime);
      rowsByTime.set(timeKey, row);
    }

    // An array per cell rather than a single entry: the mock data is conflict-free,
    // but real data might not be, and stacking beats silently discarding.
    const cell = row.entriesByDay.get(entry.day);
    if (cell) {
      cell.push(entry);
    } else {
      row.entriesByDay.set(entry.day, [entry]);
    }
  }

  const rows = [...rowsByTime.values()].sort(
    (a, b) =>
      timeToMinutes(a.startTime) - timeToMinutes(b.startTime) ||
      timeToMinutes(a.endTime) - timeToMinutes(b.endTime),
  );

    return { days, rows, entries };
}

export interface TimetableDayGroup {
  day: DayOfWeek;
  entries: TimetableEntry[];
}

/**
 * Flattens a timetable into per-day lists for the mobile layout. Rows are already
 * sorted by start time, so each day's entries come out in chronological order.
 */
export function groupTimetableByDay(timetable: Timetable): TimetableDayGroup[] {
  return timetable.days.map((day) => ({
    day,
    entries: timetable.rows.flatMap((row) => row.entriesByDay.get(day) ?? []),
  }));
}