/**
 * Where a course sits in the student's curriculum.
 *
 * Declared per course rather than inferred from the course code, because a code
 * prefix identifies the department offering the course, not the course's role in a
 * program. CC, CS, and NS courses are all degree requirements despite the different
 * prefixes, and the same course can play different roles in different programs —
 * Sikolohiyang Filipino is a major for a psychology student and a GE for this one.
 * No amount of prefix parsing can represent that; declaring it can.
 *
 * Declared as a const array with the type derived from it, rather than the reverse,
 * so runtime validation has a list to check against and the two can never disagree.
 */
export const COURSE_CATEGORY_IDS = ["major", "general_education", "physical_education"] as const;

export type CourseCategoryId = (typeof COURSE_CATEGORY_IDS)[number];

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
  /** Section code as used by the registrar, e.g. "S15" for majors, "Z11" for GE, "Y11" for PE. */
  section: string;
  instructor: string;
  room: string;
  /** All meeting times for this section — typically 2 entries for a twice-a-week course, 1 for a once-a-week course like PE. */
  schedule: ScheduleSlot[];
}

/** A course as it would appear in a catalog — a code/title/units/category, with one or more sections a student can pick from. */
export interface Course {
  id: string;
  code: string;
  title: string;
  units: number;
  category: CourseCategoryId;
  sections: Section[];
}

/** Top-level shape of the mock data file / what a courses API endpoint would return. */
export interface CourseData {
  courses: Course[];
}

/**
 * A section the student has added to their personal schedule.
 * Flattens the parent course's identifying fields alongside the chosen section so
 * schedule-rendering components don't need to look the course back up by id.
 */
export interface SelectedSection {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  units: number;
  category: CourseCategoryId;
  section: Section;
}