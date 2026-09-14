/**
 * Domain types for the class scheduling app.
 *
 * This mirrors how a real course-catalog API would likely structure data
 * (a course has multiple offered sections, each section meets on one or
 * more days/times), so the mock data in `src/data/mockCourses.json` can be
 * swapped for a live API response later without changing these types.
 */

/** Day a section meets on. Includes the full week (not just weekdays) since some sections meet on Saturday. */
export type DayOfWeek =
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

/** One meeting block for a section, e.g. "this section meets Monday 10:00-11:30". A section can have multiple slots (one per day it meets). */
export interface ScheduleSlot {
  day: DayOfWeek;
  /** 24-hour "HH:mm" format, e.g. "10:00" */
  startTime: string;
  /** 24-hour "HH:mm" format, e.g. "11:30" */
  endTime: string;
}

/**
 * One offered section of a course (e.g. CCPROG3 section S15).
 * Students select a section, not a course directly.
 */
export interface Section {
  id: string;
  /** Section code as used by the registrar, e.g. "S15" for majors/GE, "Y11" for PE. */
  section: string;
  instructor: string;
  room: string;
  /** All meeting times for this section — typically 2 entries for a twice-a-week course, 1 for a once-a-week course like PE. */
  schedule: ScheduleSlot[];
}

/** A course as it would appear in a catalog: a code/title/units, with one or more sections a student can pick from. */
export interface Course {
  id: string;
  code: string;
  title: string;
  units: number;
  sections: Section[];
}

/** Top-level shape of the mock data file / what a courses API endpoint would return. */
export interface CourseData {
  courses: Course[];
}

/**
 * A section the student has added to their personal schedule.
 * Flattens the parent course's code/title/units alongside the chosen section so
 * schedule-rendering components don't need to look the course back up by id.
 */
export interface SelectedSection {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  units: number;
  section: Section;
}