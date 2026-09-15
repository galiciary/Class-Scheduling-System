import { getSectionModality, type SectionModality } from "@/lib/sectionModality";
import type { Course, CourseCategoryId, DayOfWeek, Section } from "@/types/course";

/**
 * Narrows the course catalog by free-text search and by structured filters.
 *
 * Filters are applied to *sections*, not courses, and a course survives if any of its
 * sections do — carrying only those sections with it. Filtering whole courses instead
 * would show a course matching the filter and then reveal sections inside it that
 * contradict the filter the student just set.
 *
 * Kept as a plain pure function rather than baked into a hook or component: trivially
 * unit-testable, and the caller wraps it in `useMemo` so the catalog is only re-walked
 * when the data or the filters actually change.
 */

export interface CourseFilters {
  /** Free text matched against course code, course title, and section instructor. */
  query: string;
  /** Empty means no category restriction. */
  categories: CourseCategoryId[];
  /** Empty means no modality restriction. */
  modalities: SectionModality[];
  /** Keeps sections meeting on at least one of these days. Empty means no day restriction. */
  meetingDays: DayOfWeek[];
}

export const EMPTY_FILTERS: CourseFilters = {
  query: "",
  categories: [],
  modalities: [],
  meetingDays: [],
};

/** How many structured filters are switched on, for the UI's "N active" badge. */
export function countActiveFilters(filters: CourseFilters): number {
  return filters.categories.length + filters.modalities.length + filters.meetingDays.length;
}

function sectionMatches(
  section: Section,
  filters: CourseFilters,
  courseMatchesQuery: boolean,
  query: string,
): boolean {
  // A query hit on the course itself covers all its sections; otherwise the section
  // has to earn its place on its instructor.
  if (!courseMatchesQuery && !section.instructor.toLowerCase().includes(query)) return false;

  if (filters.modalities.length > 0 && !filters.modalities.includes(getSectionModality(section))) {
    return false;
  }

  // "Any of", not "all of": picking Monday and Thursday should surface a section that
  // meets on either, rather than only sections meeting on both.
  if (
    filters.meetingDays.length > 0 &&
    !section.schedule.some((slot) => filters.meetingDays.includes(slot.day))
  ) {
    return false;
  }

  return true;
}

export function filterCourses(courses: Course[], filters: CourseFilters): Course[] {
  const query = filters.query.trim().toLowerCase();
  const matching: Course[] = [];

  for (const course of courses) {
    if (filters.categories.length > 0 && !filters.categories.includes(course.category)) {
      continue;
    }

    const courseMatchesQuery =
      query.length === 0 ||
      course.code.toLowerCase().includes(query) ||
      course.title.toLowerCase().includes(query);

    const sections = course.sections.filter((section) =>
      sectionMatches(section, filters, courseMatchesQuery, query),
    );

    if (sections.length === 0) continue;

    // Reuse the original object when nothing was filtered out. Allocating a fresh one
    // would break referential equality and defeat the memo on each course card.
    matching.push(sections.length === course.sections.length ? course : { ...course, sections });
  }

  return matching;
}