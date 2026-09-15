"use client";

import { ScheduleClassCard } from "@/components/schedule/ScheduleClassCard";
import type { Timetable } from "@/lib/buildTimetable";
import { buildTimeAxis, formatMinutes, GRID_INTERVAL_MINUTES } from "@/lib/time";

/**
 * Vertical scale of the grid: one pixel per minute. That puts a 30-minute interval at
 * 30px and a standard 1.5-hour class at 90px — enough for the block's four lines of
 * text plus a conflict warning, without any of it being clipped.
 *
 * This is the only number to change if the grid feels too tall or too cramped;
 * everything else is derived from it.
 */
const PIXELS_PER_MINUTE = 1;

interface ScheduleGridProps {
  timetable: Timetable;
  onRemove: (sectionId: string) => void;
  conflictingEntryIds: Set<string>;
}

/**
 * Desktop timetable: a continuous time axis with class blocks positioned and sized by
 * duration, so a 2-hour class is visibly twice a 1-hour one and the gaps between
 * classes are to scale.
 *
 * The gridlines are a repeating background on a fixed-height container, so the grid is
 * drawn at full size on first paint and never reflows as classes are added — the
 * blocks float above it rather than pushing it around.
 *
 * This can't be a <table>: a cell can't hold two overlapping classes side by side, and
 * conflicting selections are something the app deliberately supports. Each day column
 * is a list instead, and every block carries a full label for screen readers.
 */
export function ScheduleGrid({ timetable, onRemove, conflictingEntryIds }: ScheduleGridProps) {
  const { days, startMinutes, endMinutes } = timetable;

  const axis = buildTimeAxis(startMinutes, endMinutes);
  const gridHeight = (endMinutes - startMinutes) * PIXELS_PER_MINUTE;
  const intervalHeight = GRID_INTERVAL_MINUTES * PIXELS_PER_MINUTE;

  const gridlines = `repeating-linear-gradient(to bottom, rgb(241 245 249) 0px, rgb(241 245 249) 1px, transparent 1px, transparent ${intervalHeight}px)`;

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <div className="min-w-[720px]">
        <div className="flex border-b border-slate-200">
          <div className="w-20 shrink-0 px-2 py-2 text-xs font-medium tracking-wide text-slate-500 uppercase">
            Time
          </div>
          {days.map((day) => (
            <div
              key={day.day}
              className="flex-1 border-l border-slate-100 px-2 py-2 text-sm font-semibold text-slate-900"
            >
              {day.day}
            </div>
          ))}
        </div>

        <div className="flex" style={{ height: gridHeight }}>
          <div className="relative w-20 shrink-0">
            {axis.map((minutes) => (
              <span
                key={minutes}
                className="absolute right-2 text-[11px] leading-none text-slate-500"
                style={{ top: (minutes - startMinutes) * PIXELS_PER_MINUTE + 2 }}
              >
                {formatMinutes(minutes)}
              </span>
            ))}
          </div>

          {days.map((day) => (
            <div
              key={day.day}
              role="list"
              aria-label={`${day.day} classes`}
              className="relative flex-1 border-l border-slate-100"
              style={{ backgroundImage: gridlines }}
            >
              {day.entries.map((positioned) => (
                <div
                  key={positioned.entry.id}
                  role="listitem"
                  className="absolute px-0.5"
                  style={{
                    top: (positioned.startMinutes - startMinutes) * PIXELS_PER_MINUTE,
                    height:
                      (positioned.endMinutes - positioned.startMinutes) * PIXELS_PER_MINUTE,
                    left: `${(positioned.columnIndex / positioned.columnCount) * 100}%`,
                    width: `${100 / positioned.columnCount}%`,
                  }}
                >
                  <ScheduleClassCard
                    entry={positioned.entry}
                    onRemove={onRemove}
                    isConflicting={conflictingEntryIds.has(positioned.entry.id)}
                    fillHeight
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}