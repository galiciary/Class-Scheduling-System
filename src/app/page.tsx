"use client";

import { useMemo, useState } from "react";
import { CourseList } from "@/components/course/CourseList";
import { SearchBar } from "@/components/filters/SearchBar";
import { ScheduleView } from "@/components/schedule/ScheduleView";
import { useCourses } from "@/hooks/useCourses";
import { useSchedule } from "@/hooks/useSchedule";
import { filterCourses } from "@/lib/filterCourses";

export default function HomePage() {
  const { courses, isLoading, error } = useCourses();
  const { selectedSections, totalUnits, clearSchedule } = useSchedule();
  const [query, setQuery] = useState("");

  // Only re-filters when the catalog or the query changes — not when a section is
  // added or removed, which re-renders this page but leaves the course list identical.
  const filteredCourses = useMemo(() => filterCourses(courses, query), [courses, query]);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Class Scheduler
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Browse courses, choose your sections, and build your dream schedule.
        </p>
      </header>

      <section className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-slate-200 bg-white px-4 py-3">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-slate-900">{selectedSections.length}</span> selected
        </p>
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-slate-900">{totalUnits}</span> total units
        </p>
        {selectedSections.length > 0 ? (
          <button
            type="button"
            onClick={clearSchedule}
            className="ml-auto rounded-md px-2 py-1 text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline"
          >
            Clear schedule
          </button>
        ) : null}
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:items-start">
        <section>
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase">
            Courses
          </h2>
          <SearchBar value={query} onChange={setQuery} resultCount={filteredCourses.length} />
          <div className="mt-4">
            <CourseList
              courses={filteredCourses}
              isLoading={isLoading}
              error={error}
              hasQuery={query.trim().length > 0}
            />
          </div>
        </section>

        <section className="lg:sticky lg:top-8">
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase">
            Your schedule
          </h2>
          <ScheduleView />
        </section>
      </div>
    </main>
  );
}