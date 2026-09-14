import type { CourseCategoryId } from "@/types/course";

/**
 * Maps a course category to the colors used to render it.
 *
 * This module is purely presentational: it takes the category the data already
 * declares and decides what it looks like. It deliberately does not decide *what*
 * category a course is — that's domain data, and it lives on the course itself (see
 * `CourseCategoryId` in `src/types/course.ts`). An earlier version inferred category
 * from the course code prefix, which broke as soon as it met courses whose prefix
 * says nothing about their curriculum role.
 *
 * Color stays out of the data for the mirror-image reason: a real registrar API would
 * return a course classification, but it would never return a hex value or a CSS class.
 *
 * Note: red/rose is deliberately absent — it's reserved for conflict highlighting, so a
 * course must never be able to look like a warning.
 */

export interface CourseColor {
  /** Pale surface fill. */
  bg: string;
  /** Mid-weight outline. */
  border: string;
  /** Readable text color on the pale fill. */
  text: string;
  /**
   * Saturated 500-weight color, used for legend dots and the accent bar on schedule
   * cards. The pale fills alone are too close together to separate at card size, so
   * this is what actually makes a category identifiable at a glance.
   */
  accent: string;
}

export interface CourseCategory {
  id: CourseCategoryId;
  /** Human-readable name, used in the schedule legend. */
  label: string;
  color: CourseColor;
}

/** Categories in legend order. */
export const COURSE_CATEGORIES: CourseCategory[] = [
  {
    id: "major",
    label: "Major Courses",
    color: {
      bg: "bg-purple-50",
      border: "border-purple-300",
      text: "text-purple-700",
      accent: "bg-purple-500",
    },
  },
  {
    id: "general_education",
    label: "General Education",
    color: {
      bg: "bg-emerald-50",
      border: "border-emerald-300",
      text: "text-emerald-700",
      accent: "bg-emerald-500",
    },
  },
  {
    id: "physical_education",
    label: "Physical Education",
    color: {
      bg: "bg-orange-50",
      border: "border-orange-300",
      text: "text-orange-700",
      accent: "bg-orange-500",
    },
  },
];

const CATEGORY_BY_ID = new Map(COURSE_CATEGORIES.map((category) => [category.id, category]));

/**
 * TypeScript can't check JSON at runtime, so a category value from a future data
 * source that isn't one we know about falls back to the first category rather than
 * rendering an unstyled card.
 */
export function getCourseCategory(category: CourseCategoryId): CourseCategory {
  return CATEGORY_BY_ID.get(category) ?? COURSE_CATEGORIES[0];
}

/** Convenience for components that only need the color, not the category label. */
export function getCourseColor(category: CourseCategoryId): CourseColor {
  return getCourseCategory(category).color;
}