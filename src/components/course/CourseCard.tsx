"use client";

import { memo, useId, useState } from "react";
import { SectionRow } from "@/components/course/SectionRow";
import { getCourseColor } from "@/lib/colors";
import type { Course, Section } from "@/types/course";

interface CourseCardProps {
  course: Course;
  /**
   * Id of this course's currently selected section, if any.
   *
   * Deliberately a primitive rather than a lookup callback: combined with the
   * store's stable handler references, it's what lets the `memo` below actually
   * skip work — changing one course's selection re-renders that card only,
   * instead of every card in the list.
   */
  selectedSectionId?: string;
  onSelectSection: (course: Course, section: Section) => void;
  onRemoveSection: (sectionId: string) => void;
}

function CourseCardComponent({
  course,
  selectedSectionId,
  onSelectSection,
  onRemoveSection,
}: CourseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const sectionsPanelId = useId();

  const color = getCourseColor(course.category);
  const selectedSection = course.sections.find((section) => section.id === selectedSectionId);

  const handleToggle = (section: Section) => {
    if (section.id === selectedSectionId) {
      onRemoveSection(section.id);
    } else {
      onSelectSection(course, section);
    }
  };

  return (
    <li className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setIsExpanded((expanded) => !expanded)}
        aria-expanded={isExpanded}
        aria-controls={sectionsPanelId}
        className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-slate-50"
      >
        <span className={`size-2.5 shrink-0 rounded-full ${color.accent}`} aria-hidden="true" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-semibold text-slate-900">{course.code}</span>
            <span className="text-xs text-slate-500">
              {course.units} {course.units === 1 ? "unit" : "units"}
            </span>
          </div>
          <p className="truncate text-sm text-slate-600">{course.title}</p>
          {selectedSection ? (
            <p className={`mt-1 text-xs font-medium ${color.text}`}>
              Section {selectedSection.section} selected
            </p>
          ) : null}
        </div>

        <span
          aria-hidden="true"
          className={`shrink-0 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>

      {isExpanded ? (
        <ul id={sectionsPanelId} className="space-y-2 border-t border-slate-100 bg-slate-50 p-3">
          {course.sections.map((section) => (
            <SectionRow
              key={section.id}
              section={section}
              color={color}
              isSelected={section.id === selectedSectionId}
              onToggle={handleToggle}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export const CourseCard = memo(CourseCardComponent);