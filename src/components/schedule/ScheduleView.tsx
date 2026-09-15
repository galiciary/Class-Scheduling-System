"use client";

import { useMemo } from "react";
import { ScheduleDayList } from "@/components/schedule/ScheduleDayList";
import { ScheduleGrid } from "@/components/schedule/ScheduleGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { useSchedule } from "@/hooks/useSchedule";
import { buildTimetable } from "@/lib/buildTimetable";
import { COURSE_CATEGORIES } from "@/lib/colors";
import { describeConflict, detectConflicts, type ScheduleConflict } from "@/lib/conflicts";
import type { SelectedSection } from "@/types/course";

/**
 * Color key for the grid. Lists categories rather than individual courses, because
 * colors are assigned per category — a per-course legend would repeat the same
 * swatch for every major course and imply a distinction that isn't there.
 *
 * Filtering the canonical list (rather than collecting categories as courses are
 * added) keeps the legend in a fixed order, so it doesn't reshuffle itself while
 * the student builds a schedule.
 */
function ScheduleLegend({ selectedSections }: { selectedSections: SelectedSection[] }) {
  const categories = useMemo(() => {
    const present = new Set(selectedSections.map((selected) => selected.category));
    return COURSE_CATEGORIES.filter((category) => present.has(category.id));
  }, [selectedSections]);

  return (
    <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1.5">
      {categories.map((category) => (
        <li key={category.id} className="flex items-center gap-1.5 text-xs text-slate-600">
          <span className={`size-2 rounded-full ${category.color.accent}`} aria-hidden="true" />
          {category.label}
        </li>
      ))}
    </ul>
  );
}

/**
 * Conflict summary. Announced with role="alert" so it reaches screen readers the
 * moment a clashing section is added, rather than only being visible on the grid.
 */
function ConflictNotice({ conflicts }: { conflicts: ScheduleConflict[] }) {
  return (
    <div role="alert" className="mb-3 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2">
      <p className="text-xs font-semibold text-rose-800">
        <span aria-hidden="true">⚠ </span>
        {conflicts.length} schedule {conflicts.length === 1 ? "conflict" : "conflicts"}
      </p>
      <ul className="mt-1 space-y-0.5">
        {conflicts.map((conflict) => (
          <li key={conflict.id} className="text-xs text-rose-700">
            {describeConflict(conflict)}
          </li>
        ))}
      </ul>
      <p className="mt-1.5 text-xs text-rose-600">
        Swap one of the sections, or remove it from the grid below.
      </p>
    </div>
  );
}

/**
 * The schedule side of the app: reads the shared selection store, derives the
 * timetable and any conflicts once per change, and picks a layout for the viewport.
 *
 * Both layouts are rendered and toggled with CSS rather than a JS media query,
 * which keeps the server and client markup identical (no hydration mismatch) and
 * avoids a resize listener.
 */
export function ScheduleView() {
  const { selectedSections, removeSection } = useSchedule();

  const timetable = useMemo(() => buildTimetable(selectedSections), [selectedSections]);
  const { conflicts, conflictingEntryIds } = useMemo(
    () => detectConflicts(timetable.entries),
    [timetable],
  );

  const isEmpty = selectedSections.length === 0;

  return (
    <div>
      {conflicts.length > 0 ? <ConflictNotice conflicts={conflicts} /> : null}

      {isEmpty ? (
        <p className="mb-3 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-xs text-slate-500">
          No classes added yet — add a section from the course list and it will appear here.
        </p>
      ) : (
        <ScheduleLegend selectedSections={selectedSections} />
      )}

      {/*
        The empty grid still earns its place on desktop: it shows the shape of the
        week at a glance. On a phone it would be six cards of nothing to scroll past,
        so there the notice above stands on its own.
      */}
      <div className="hidden md:block">
        <ScheduleGrid
          timetable={timetable}
          onRemove={removeSection}
          conflictingEntryIds={conflictingEntryIds}
        />
      </div>

      <div className="md:hidden">
        {isEmpty ? (
          <EmptyState
            title="No classes scheduled yet"
            description="Add a section from the course list and it will show up here."
          />
        ) : (
          <ScheduleDayList
            days={timetable.days}
            onRemove={removeSection}
            conflictingEntryIds={conflictingEntryIds}
          />
        )}
      </div>
    </div>
  );
}