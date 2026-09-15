"use client";

import type { TimetableEntry } from "@/lib/buildTimetable";
import { getCourseColor } from "@/lib/colors";
import { formatTime, formatTimeRange } from "@/lib/time";

interface ScheduleClassCardProps {
  entry: TimetableEntry;
  onRemove: (sectionId: string) => void;
  /** Whether this meeting overlaps another selected class. */
  isConflicting?: boolean;
  /** Stretch to the height of a positioned container — the grid sizes blocks by duration. */
  fillHeight?: boolean;
}

/**
 * A single class block. Shared by both the desktop grid and the mobile day list so
 * the two layouts can never drift apart visually or in what they show.
 *
 * Carries its own time and room because both vary per meeting: the grid's axis gives
 * the approximate position but not the exact minutes, and a section can meet on campus
 * one day and online the next. The instructor is left out — the column is too narrow
 * for a full name, and the course list already shows it.
 *
 * Start and end times are stacked rather than set on one line. A full range doesn't fit
 * the column width, so left inline it wrapped anyway; splitting it deliberately makes
 * the break intentional and keeps the block's height predictable. Line heights are
 * tightened for the same reason — the block is sized by the class's duration, so the
 * text has to fit the space rather than the other way round.
 *
 * The saturated left bar carries the category, not the pale fill: most of a student's
 * schedule is major courses, so a grid of near-identical washed-out cards makes the
 * color coding useless. It stays the category color even when the card is flagged as
 * conflicting, since the rose outline and label already say that.
 */
export function ScheduleClassCard({
  entry,
  onRemove,
  isConflicting = false,
  fillHeight = false,
}: ScheduleClassCardProps) {
  const color = getCourseColor(entry.category);

  return (
    <div
      className={`relative overflow-hidden rounded-lg border py-1.5 pr-1.5 pl-2.5 ${
        fillHeight ? "h-full" : ""
      } ${color.bg} ${isConflicting ? "border-rose-400 ring-1 ring-rose-300" : color.border}`}
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${color.accent}`} aria-hidden="true" />

      {/*
        Sized to a 24px target and given enough contrast to read as a control — it's
        the only way to remove a class from the grid, so it can't be a faint hairline.
      */}
      <button
        type="button"
        onClick={() => onRemove(entry.sectionId)}
        aria-label={`Remove ${entry.courseCode} section ${entry.sectionCode}, ${entry.day} ${formatTimeRange(entry.startTime, entry.endTime)}, ${entry.room}`}
        className="absolute top-0 right-0 flex size-6 items-center justify-center rounded text-slate-500 transition-colors hover:bg-white hover:text-slate-900"
      >
        <span aria-hidden="true" className="text-sm leading-none">
          ×
        </span>
      </button>

      <p className={`pr-5 text-xs leading-tight font-semibold ${color.text}`}>{entry.courseCode}</p>

      <p className="mt-0.5 text-[11px] leading-tight text-slate-600">
        <span className="block">{formatTime(entry.startTime)} –</span>
        <span className="block">{formatTime(entry.endTime)}</span>
      </p>

      <p className="mt-0.5 truncate text-[11px] leading-tight text-slate-500">
        {entry.sectionCode} · {entry.room}
      </p>

      {/* Spelled out in text, not just a red border — color alone shouldn't carry meaning. */}
      {isConflicting ? (
        <p className="mt-0.5 flex items-center gap-1 text-[11px] leading-tight font-semibold text-rose-700">
          <span aria-hidden="true">⚠</span>
          Conflict
        </p>
      ) : null}
    </div>
  );
}