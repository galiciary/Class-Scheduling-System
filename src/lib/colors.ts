/**
 * Course colors, assigned by course category rather than per individual course.
 *
 * Categorizing means every major course reads as one color, every GE as another, and
 * so on — you can tell what kind of course a block is at a glance. The cost is that two
 * courses in the same category look alike on the grid, so each block relies on its
 * printed course code to identify it.
 *
 * Colors are computed here rather than stored on the course data because color is a
 * presentation concern: a real backend course catalog wouldn't return a color field,
 * so keeping it out of mockCourses.json keeps that data honest to what an API would send.
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
  id: string;
  /** Human-readable name, used in the schedule legend. */
  label: string;
  /** Course code prefixes belonging to this category. */
  prefixes: string[];
  color: CourseColor;
}

/**
 * The default category, covering degree courses that aren't one of the explicit
 * categories below — core (CC), computer science (CS), and subject codes that follow
 * no departmental prefix at all (CREATIVE, PSYFILI, and so on).
 *
 * Making it the fallback rather than an exhaustive prefix list means a new subject code
 * picks up a sensible color without this table needing an entry for every course the
 * university offers — only the exceptions have to be declared.
 */
const MAJOR_CATEGORY: CourseCategory = {
  id: "major",
  label: "Major Courses",
  prefixes: ["CC", "CS"],
  color: {
    bg: "bg-purple-50",
    border: "border-purple-300",
    text: "text-purple-700",
    accent: "bg-purple-500",
  },
};

/** Categories in legend order. Prefixes don't overlap, so match order doesn't matter here. */
export const COURSE_CATEGORIES: CourseCategory[] = [
  MAJOR_CATEGORY,
  {
    id: "network-security",
    label: "NIS Specialization",
    prefixes: ["NS"],
    color: {
      bg: "bg-blue-50",
      border: "border-blue-300",
      text: "text-blue-700",
      accent: "bg-blue-500",
    },
  },
  {
    id: "general-education",
    label: "General Education",
    prefixes: ["GE", "LCC"],
    color: {
      bg: "bg-emerald-50",
      border: "border-emerald-300",
      text: "text-emerald-700",
      accent: "bg-emerald-500",
    },
  },
  {
    id: "physical-education",
    label: "Physical Education",
    prefixes: ["PE"],
    color: {
      bg: "bg-orange-50",
      border: "border-orange-300",
      text: "text-orange-700",
      accent: "bg-orange-500",
    },
  },
];

export function getCourseCategory(courseCode: string): CourseCategory {
  const code = courseCode.toUpperCase();

  return (
    COURSE_CATEGORIES.find((category) =>
      category.prefixes.some((prefix) => code.startsWith(prefix)),
    ) ?? MAJOR_CATEGORY
  );
}

/** Convenience for components that only need the color, not the category label. */
export function getCourseColor(courseCode: string): CourseColor {
  return getCourseCategory(courseCode).color;
}