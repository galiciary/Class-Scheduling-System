import type { Course } from "@/types/course";

/**
 * Filters courses by a free-text search query, matching against course code,
 * title, and any section's instructor name (case-insensitive, substring match).
 *
 * Kept as a plain, pure function rather than baked into a hook or component:
 *   - trivially unit-testable in isolation
 *   - callers wrap it in `useMemo` keyed on [courses, query], so the full
 *     list is only re-filtered when the data or the query actually changes,
 *     not on every unrelated re-render
 */
export function filterCourses(courses: Course[], query: string): Course[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return courses;

  return courses.filter((course) => {
    if (course.code.toLowerCase().includes(trimmed)) return true;
    if (course.title.toLowerCase().includes(trimmed)) return true;
    return course.sections.some((section) =>
      section.instructor.toLowerCase().includes(trimmed),
    );
  });
}