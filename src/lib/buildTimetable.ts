import {
  CLASS_DAYS,
  DAYS_OF_WEEK,
  GRID_END_MINUTES,
  GRID_INTERVAL_MINUTES,
  GRID_START_MINUTES,
  timeToMinutes,
} from "@/lib/time";
import type { CourseCategoryId, DayOfWeek, SelectedSection } from "@/types/course";

/**
 * Transforms the student's selected sections into a positioned timetable.
 *
 * Kept as a pure function outside React so the grid components stay presentational
 * and this logic can be unit-tested on its own.
 *
 * Blocks are placed on a continuous time axis rather than snapped into fixed period
 * rows. That costs the simplicity of a row-per-period table, but it's the only way the
 * grid can tell the truth about duration — a 2-unit PE class really is longer than a
 * 3-unit lecture, and the gaps between classes really do vary. It also means a class
 * at any time at all can be drawn, rather than only times the app anticipated.
 *
 * Positions are expressed in minutes, not pixels. How many pixels a minute is worth is
 * the grid component's decision.
 */

/** One meeting of one section on one day — the unit rendered as a block. */
export interface TimetableEntry {
  /** Unique per section + day, so it's safe as a React key. */
  id: string;
  sectionId: string;
  courseCode: string;
  courseTitle: string;
  sectionCode: string;
  category: CourseCategoryId;
  instructor: string;
  room: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
}

/** A meeting with everything the grid needs to place it. */
export interface PositionedEntry {
  entry: TimetableEntry;
  startMinutes: number;
  endMinutes: number;
  /** 0-based lane within a group of mutually overlapping classes. */
  columnIndex: number;
  /** Lanes that group needs, so each block can be sized 1/columnCount of the column. */
  columnCount: number;
}

export interface TimetableDay {
  day: DayOfWeek;
  entries: PositionedEntry[];
}

export interface Timetable {
  days: TimetableDay[];
  /** Grid bounds in minutes since midnight, snapped to whole gridline intervals. */
  startMinutes: number;
  endMinutes: number;
  /** Every meeting, flattened — used for conflict detection without walking the days. */
  entries: TimetableEntry[];
}

function overlaps(a: PositionedEntry, b: PositionedEntry): boolean {
  return a.startMinutes < b.endMinutes && b.startMinutes < a.endMinutes;
}

/**
 * Assigns each meeting a lane so overlapping classes can sit side by side instead of
 * hiding one another.
 *
 * Meetings are swept in start order and grouped into clusters of transitively
 * overlapping classes; within a cluster each block takes the lowest lane not already
 * claimed by something it overlaps. Every block in a cluster then reports the same
 * columnCount, so they divide the column evenly and line up.
 */
function assignLanes(dayEntries: TimetableEntry[]): PositionedEntry[] {
  const positioned = dayEntries
    .map<PositionedEntry>((entry) => ({
      entry,
      startMinutes: timeToMinutes(entry.startTime),
      endMinutes: timeToMinutes(entry.endTime),
      columnIndex: 0,
      columnCount: 1,
    }))
    .sort((a, b) => a.startMinutes - b.startMinutes || a.endMinutes - b.endMinutes);

  const placed: PositionedEntry[] = [];
  let cluster: PositionedEntry[] = [];
  let clusterEnd = Number.NEGATIVE_INFINITY;

  const closeCluster = () => {
    const laneCount = Math.max(...cluster.map((member) => member.columnIndex)) + 1;
    for (const member of cluster) member.columnCount = laneCount;
    placed.push(...cluster);
    cluster = [];
    clusterEnd = Number.NEGATIVE_INFINITY;
  };

  for (const current of positioned) {
    // Nothing in the cluster reaches this class, so the cluster is finished.
    if (cluster.length > 0 && current.startMinutes >= clusterEnd) closeCluster();

    const takenLanes = new Set(
      cluster.filter((member) => overlaps(member, current)).map((member) => member.columnIndex),
    );

    let lane = 0;
    while (takenLanes.has(lane)) lane += 1;
    current.columnIndex = lane;

    cluster.push(current);
    clusterEnd = Math.max(clusterEnd, current.endMinutes);
  }

  if (cluster.length > 0) closeCluster();

  return placed;
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
        category: selected.category,
        instructor: selected.section.instructor,
        room: slot.room,
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
  const dayOrder = [...CLASS_DAYS, ...unexpectedDays];

  // Bounds: the standard window, widened only if something falls outside it, then
  // snapped outward to whole intervals so labels land exactly on the gridlines.
  let startMinutes = GRID_START_MINUTES;
  let endMinutes = GRID_END_MINUTES;

  for (const entry of entries) {
    startMinutes = Math.min(startMinutes, timeToMinutes(entry.startTime));
    endMinutes = Math.max(endMinutes, timeToMinutes(entry.endTime));
  }

  startMinutes = Math.floor(startMinutes / GRID_INTERVAL_MINUTES) * GRID_INTERVAL_MINUTES;
  endMinutes = Math.ceil(endMinutes / GRID_INTERVAL_MINUTES) * GRID_INTERVAL_MINUTES;

  const days = dayOrder.map<TimetableDay>((day) => ({
    day,
    entries: assignLanes(entries.filter((entry) => entry.day === day)),
  }));

  return { days, startMinutes, endMinutes, entries };
}