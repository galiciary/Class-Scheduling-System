"use client";

import type { CourseColor } from "@/lib/colors";
import { getSectionModality, SECTION_MODALITY_LABELS } from "@/lib/sectionModality";
import { formatSlot } from "@/lib/time";
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
 *
 * Meetings are listed one per line rather than collapsed, since a section can meet
 * on campus one day and online the next.
 */
export function SectionRow({ section, color, isSelected, onToggle }: SectionRowProps) {
  const modality = getSectionModality(section);

  return (
    <li
      className={`flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between ${
        isSelected ? `${color.bg} ${color.border}` : "border-slate-200 bg-white"
      }`}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-sm font-semibold ${isSelected ? color.text : "text-slate-900"}`}>
            {section.section}
          </span>
            {modality !== "in_person" ? (
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-slate-600 uppercase">
              {SECTION_MODALITY_LABELS[modality]}
            </span>
          ) : null}
        </div>

        <p className="mt-0.5 truncate text-sm text-slate-600">{section.instructor}</p>

        <ul className="mt-0.5 space-y-0.5">
          {section.schedule.map((slot) => (
            <li key={`${slot.day}-${slot.startTime}`} className="text-xs text-slate-500">
              {formatSlot(slot)}
            </li>
          ))}
        </ul>
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