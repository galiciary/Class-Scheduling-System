/**
 * Color assignment for course codes.
 *
 * Hashing the course code means a course's
 * color stays the same everywhere it's rendered (course list, schedule grid,
 * legend) without needing to thread a shared color map through props/state.
 */

/** Small fixed set of Tailwind color tokens; extend if more visual variety is needed. */
const PALETTE = [
  { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-700", dot: "bg-blue-500" },
  { bg: "bg-purple-50", border: "border-purple-300", text: "text-purple-700", dot: "bg-purple-500" },
  { bg: "bg-emerald-50", border: "border-emerald-300", text: "text-emerald-700", dot: "bg-emerald-500" },
  { bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-700", dot: "bg-amber-500" },
  { bg: "bg-rose-50", border: "border-rose-300", text: "text-rose-700", dot: "bg-rose-500" },
  { bg: "bg-cyan-50", border: "border-cyan-300", text: "text-cyan-700", dot: "bg-cyan-500" },
  { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-700", dot: "bg-orange-500" },
  { bg: "bg-indigo-50", border: "border-indigo-300", text: "text-indigo-700", dot: "bg-indigo-500" },
] as const;

/** One entry from the palette: a matched set of background/border/text/dot classes for a single course color. */
export type CourseColor = (typeof PALETTE)[number];

/**
 * Simple deterministic string hash (Java's `String.hashCode` algorithm).
 * Not cryptographic. It just needs to spread course codes evenly across the palette.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Returns the same `CourseColor` every time for a given course code.
 *
 * @example getCourseColor("CCPROG3") // always the same palette entry
 */
export function getCourseColor(courseCode: string): CourseColor {
  return PALETTE[hashString(courseCode) % PALETTE.length];
}