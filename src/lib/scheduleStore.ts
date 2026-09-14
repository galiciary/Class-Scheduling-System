import { parseStoredSchedule } from "@/lib/parseStoredSchedule";
import type { Course, Section, SelectedSection } from "@/types/course";


const STORAGE_KEY = "class-scheduling-system:selected-sections";

/**
 * External store holding the student's selected sections, persisted to localStorage.
 *
 * This lives outside React (a plain module) rather than in component state because:
 *   - localStorage is genuinely an external system; `useSyncExternalStore` is React's
 *     designated API for reading one, and it hydrates safely (see getServerSnapshot).
 *   - Several components need the same selection state (course list, schedule grid,
 *     units summary). A shared module store keeps them in sync without a Context
 *     provider or prop drilling.
 *   - It avoids calling setState inside an effect to restore persisted data, which
 *     causes an extra cascading render on every mount.
 */

/**
 * Stable empty reference. `getSnapshot` must return the *same* reference when nothing
 * has changed — returning a fresh `[]` each call would make React re-render forever.
 */
const EMPTY: SelectedSection[] = [];

let currentSections: SelectedSection[] = EMPTY;
let hasLoadedFromStorage = false;

const listeners = new Set<() => void>();

function emitChange(): void {
  for (const listener of listeners) listener();
}

function readFromStorage(): SelectedSection[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;

    // Validated rather than cast: see parseStoredSchedule for why stored JSON can't
    // be trusted to still match the current shape.
    const stored = parseStoredSchedule(raw);
    return stored.length > 0 ? stored : EMPTY;
  } catch {
    // localStorage itself was unreachable (private browsing, blocked storage).
    return EMPTY;
  }
}

function writeToStorage(sections: SelectedSection[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
  } catch {
    // localStorage unavailable (private browsing, quota exceeded). The schedule
    // still works for this session, it just won't survive a refresh.
  }
}

/** Commits a new selection list: updates the store, persists it, and notifies subscribers. */
function setSections(next: SelectedSection[]): void {
  currentSections = next;
  writeToStorage(next);
  emitChange();
}

/**
 * Subscribes a React component to store changes.
 *
 * React calls this after mount (never during SSR), so `window` is safe to touch here.
 * The first subscriber loads any persisted schedule; React re-reads the snapshot right
 * after subscribing, so that restored data shows up without an explicit setState.
 */
export function subscribe(listener: () => void): () => void {
  if (!hasLoadedFromStorage) {
    hasLoadedFromStorage = true;
    currentSections = readFromStorage();
  }

  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Current selections on the client. Must be reference-stable between changes. */
export function getSnapshot(): SelectedSection[] {
  return currentSections;
}

/**
 * Selections as seen during server rendering and hydration. Always empty, because the
 * server has no access to the user's localStorage — this is what keeps the server HTML
 * and the first client render identical, avoiding a hydration mismatch.
 */
export function getServerSnapshot(): SelectedSection[] {
  return EMPTY;
}

/**
 * Adds a section to the schedule. Only one section per course is allowed, so this
 * replaces any section of the same course already selected, matching how course
 * registration normally works.
 */
export function addSection(course: Course, section: Section): void {
  const withoutThisCourse = currentSections.filter(
    (selected) => selected.courseId !== course.id,
  );

    setSections([
    ...withoutThisCourse,
    {
      courseId: course.id,
      courseCode: course.code,
      courseTitle: course.title,
      units: course.units,
      category: course.category,
      section,
    },
  ]);
}

/** Removes a section by its id. No-ops if that section isn't selected, so we don't trigger a pointless re-render. */
export function removeSection(sectionId: string): void {
  const next = currentSections.filter((selected) => selected.section.id !== sectionId);
  if (next.length === currentSections.length) return;
  setSections(next);
}

/** Empties the schedule. No-ops if it's already empty. */
export function clearSchedule(): void {
  if (currentSections.length === 0) return;
  setSections(EMPTY);
}