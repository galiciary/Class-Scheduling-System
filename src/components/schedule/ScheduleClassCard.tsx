"use client";

import type { TimetableEntry } from "@/lib/buildTimetable";
import { getCourseColor } from "@/lib/colors";
import { formatTime } from "@/lib/time";

interface ScheduleClassCardProps {
  entry: TimetableEntry;
  onRemove: (sectionId: string) => void;
  /**
   * The desktop grid already labels each row with its time, so the card omits it
   * there; the stacked mobile layout has no row header and needs it.
   */
  showTime?: boolean;
  /** Whether this meeting overlaps another selected class. */
  isConflicting?: boolean;
}

/**
 * A single class block. Shared by both the desktop grid and the mobile day list so
 * the two layouts can never drift apart visually or in what they show.
 *
 * The saturated left bar carries the category, not the pale fill: most of a student's
 * schedule is major courses, so a grid of near-identical washed-out cards makes the
 * color coding useless. The bar stays the category color even when the card is
 * flagged as conflicting — the rose outline and label already say that, and losing
 * the category would trade one piece of information for another.
 */
export function ScheduleClassCard({
  entry,
  onRemove,
  showTime = false,
  isConflicting = false,
}: ScheduleClassCardProps) {
  const color = getCourseColor(entry.courseCode);

  return (
    <div
      className={`relative overflow-hidden rounded-lg border py-2 pr-2 pl-3 ${color.bg} ${
        isConflicting ? "border-rose-400 ring-1 ring-rose-300" : color.border
      }`}
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${color.accent}`} aria-hidden="true" />

      <button
        type="button"
        onClick={() => onRemove(entry.sectionId)}
        aria-label={`Remove ${entry.courseCode} section ${entry.sectionCode} from schedule`}
        className="absolute top-1 right-1 rounded px-1 text-sm leading-none text-slate-400 transition-colors hover:bg-white hover:text-slate-700"
      >
        <span aria-hidden="true">×</span>
      </button>

      <p className={`pr-4 text-xs font-semibold ${color.text}`}>{entry.courseCode}</p>
      <p className="mt-0.5 text-[11px] text-slate-600">
        {entry.sectionCode} · {entry.room}
      </p>
      {showTime ? (
        <p className="mt-0.5 text-[11px] text-slate-500">
          {formatTime(entry.startTime)} – {formatTime(entry.endTime)}
        </p>
      ) : null}
      <p className="mt-0.5 truncate text-[11px] text-slate-500">{entry.instructor}</p>

      {/* Spelled out in text, not just a red border; color alone shouldn't carry meaning. */}
      {isConflicting ? (
        <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-rose-700">
          <span aria-hidden="true">⚠</span>
          Conflict
        </p>
      ) : null}
    </div>
  );
}