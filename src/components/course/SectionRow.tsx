"use client";

import type { CourseColor } from "@/lib/colors";
import { formatScheduleCompact } from "@/lib/time";
import type { Section } from "@/types/course";

interface SectionRowProps {
  section: Section;
  color: CourseColor;
  isSelected: boolean;
  /** Adds this section, or removes it when it's already selected. */
  onToggle: (section: Section) => void;
}

/**
 * One selectable section of a course. Purely presentational — it's told whether
 * it's selected and reports toggles upward, so it carries no schedule logic and
 * can be dropped into any list of sections.
 */
export function SectionRow({ section, color, isSelected, onToggle }: SectionRowProps) {
  return (
    <li
      className={`flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between ${
        isSelected ? `${color.bg} ${color.border}` : "border-slate-200 bg-white"
      }`}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${isSelected ? color.text : "text-slate-900"}`}>
            {section.section}
          </span>
          <span className="text-xs text-slate-500">{section.room}</span>
        </div>
        <p className="mt-0.5 truncate text-sm text-slate-600">{section.instructor}</p>
        <p className="mt-0.5 text-xs text-slate-500">{formatScheduleCompact(section.schedule)}</p>
      </div>

      <button
        type="button"
        onClick={() => onToggle(section)}
        aria-pressed={isSelected}
        aria-label={
          isSelected
            ? `Remove section ${section.section} from schedule`
            : `Add section ${section.section} to schedule`
        }
        className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
          isSelected
            ? "bg-slate-900 text-white hover:bg-slate-700"
            : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
        }`}
      >
        {isSelected ? "Selected" : "Add"}
      </button>
    </li>
  );
}