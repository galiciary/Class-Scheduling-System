"use client";

import { COURSE_CATEGORIES } from "@/lib/colors";
import { countActiveFilters, EMPTY_FILTERS, type CourseFilters } from "@/lib/filterCourses";
import { SECTION_MODALITIES, SECTION_MODALITY_LABELS } from "@/lib/sectionModality";
import { CLASS_DAYS } from "@/lib/time";

interface FilterPanelProps {
  filters: CourseFilters;
  onChange: (filters: CourseFilters) => void;
}

/** Adds or removes a value, so every chip is its own independent toggle. */
function toggleValue<T>(values: T[], value: T): T[] {
  return values.includes(value) ? values.filter((current) => current !== value) : [...values, value];
}

function FilterChip({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
        isActive
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
      }`}
    >
      {label}
    </button>
  );
}

/**
 * Structured filters, collapsed behind a disclosure so the default view stays a plain
 * search box. Built on <details>/<summary> rather than a custom toggle, which gets
 * keyboard operation and expanded-state announcement for free.
 *
 * Every chip is an independent toggle with aria-pressed — selecting nothing in a group
 * means that group imposes no restriction, which reads more naturally than an explicit
 * "Any" option that has to be kept mutually exclusive with the rest.
 */
export function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const activeCount = countActiveFilters(filters);

  return (
    <details className="mt-2 rounded-lg border border-slate-200 bg-white">
      <summary className="cursor-pointer list-none px-3 py-2 text-xs font-medium text-slate-700 select-none">
        Filters
        {activeCount > 0 ? (
          <span className="ml-1 text-slate-500">· {activeCount} active</span>
        ) : null}
      </summary>

      <div className="space-y-3 border-t border-slate-100 px-3 py-3">
        <fieldset>
          <legend className="mb-1.5 text-[11px] font-medium tracking-wide text-slate-500 uppercase">
            Category
          </legend>
          <div className="flex flex-wrap gap-1.5">
            {COURSE_CATEGORIES.map((category) => (
              <FilterChip
                key={category.id}
                label={category.label}
                isActive={filters.categories.includes(category.id)}
                onClick={() =>
                  onChange({ ...filters, categories: toggleValue(filters.categories, category.id) })
                }
              />
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-1.5 text-[11px] font-medium tracking-wide text-slate-500 uppercase">
            Class setup
          </legend>
          <div className="flex flex-wrap gap-1.5">
            {SECTION_MODALITIES.map((modality) => (
              <FilterChip
                key={modality}
                label={SECTION_MODALITY_LABELS[modality]}
                isActive={filters.modalities.includes(modality)}
                onClick={() =>
                  onChange({ ...filters, modalities: toggleValue(filters.modalities, modality) })
                }
              />
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-1.5 text-[11px] font-medium tracking-wide text-slate-500 uppercase">
            Meets on
          </legend>
          <div className="flex flex-wrap gap-1.5">
            {CLASS_DAYS.map((day) => (
              <FilterChip
                key={day}
                label={day.slice(0, 3)}
                isActive={filters.meetingDays.includes(day)}
                onClick={() =>
                  onChange({ ...filters, meetingDays: toggleValue(filters.meetingDays, day) })
                }
              />
            ))}
          </div>
        </fieldset>

        {activeCount > 0 ? (
          <button
            type="button"
            onClick={() => onChange({ ...EMPTY_FILTERS, query: filters.query })}
            className="text-xs font-medium text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline"
          >
            Clear filters
          </button>
        ) : null}
      </div>
    </details>
  );
}