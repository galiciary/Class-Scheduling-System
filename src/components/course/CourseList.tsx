"use client";

import { useMemo } from "react";
import { CourseCard } from "@/components/course/CourseCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useSchedule } from "@/hooks/useSchedule";
import type { Course } from "@/types/course";

interface CourseListProps {
  courses: Course[];
  isLoading: boolean;
  error: string | null;
  /** Whether a search is active, so the empty state can explain why nothing is shown. */
  hasQuery: boolean;
}

/**
 * Renders the course catalog and owns its loading / error / empty presentation.
 *
 * Reads selection state from the schedule store directly rather than receiving it
 * through props — the store is shared, so there's nothing to drill down from the
 * page, and the list stays decoupled from wherever it's rendered.
 */
export function CourseList({ courses, isLoading, error, hasQuery }: CourseListProps) {
  const { selectedSections, addSection, removeSection } = useSchedule();

  // course id -> selected section id. Rebuilt only when the selection changes, so
  // each card receives a plain string and `memo` on CourseCard can do its job.
  const selectedSectionByCourse = useMemo(() => {
    const map = new Map<string, string>();
    for (const selected of selectedSections) {
      map.set(selected.courseId, selected.section.id);
    }
    return map;
  }, [selectedSections]);

  if (isLoading) {
    return (
      <ul className="space-y-3" aria-busy="true" aria-label="Loading courses">
        {Array.from({ length: 5 }).map((_, index) => (
          <li
            key={index}
            className="h-20 animate-pulse rounded-xl border border-slate-200 bg-slate-100"
          />
        ))}
      </ul>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-rose-200 bg-rose-50 px-6 py-8 text-center"
      >
        <p className="text-sm font-medium text-rose-800">{error}</p>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <EmptyState
        title={hasQuery ? "No matching courses" : "No courses available"}
        description={
          hasQuery
            ? "Try a different course code, title, or instructor."
            : "Check back once the catalog has been published."
        }
      />
    );
  }

  return (
    <ul className="space-y-3">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          selectedSectionId={selectedSectionByCourse.get(course.id)}
          onSelectSection={addSection}
          onRemoveSection={removeSection}
        />
      ))}
    </ul>
  );
}