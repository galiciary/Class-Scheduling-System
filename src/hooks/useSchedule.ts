import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { Course, Section, SelectedSection } from "@/types/course";
import {
  addSection as addSectionToStore,
  clearSchedule as clearScheduleInStore,
  getServerSnapshot,
  getSnapshot,
  removeSection as removeSectionFromStore,
  subscribe,
} from "@/lib/scheduleStore";

interface UseScheduleResult {
  selectedSections: SelectedSection[];
  totalUnits: number;
  addSection: (course: Course, section: Section) => void;
  removeSection: (sectionId: string) => void;
  isSectionSelected: (sectionId: string) => boolean;
  clearSchedule: () => void;
}

/**
 * React binding for the schedule store (`src/lib/scheduleStore.ts`).
 *
 * Reads through `useSyncExternalStore` so the persisted schedule hydrates without a
 * setState-in-effect round trip, and so every component calling this hook shares the
 * same selection state. The store's mutation functions are module-level and already
 * reference-stable, so they're passed straight through without wrapping.
 */
export function useSchedule(): UseScheduleResult {
  const selectedSections = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const isSectionSelected = useCallback(
    (sectionId: string) => selectedSections.some((selected) => selected.section.id === sectionId),
    [selectedSections],
  );

  const totalUnits = useMemo(
    () => selectedSections.reduce((sum, selected) => sum + selected.units, 0),
    [selectedSections],
  );

  return {
    selectedSections,
    totalUnits,
    addSection: addSectionToStore,
    removeSection: removeSectionFromStore,
    isSectionSelected,
    clearSchedule: clearScheduleInStore,
  };
}