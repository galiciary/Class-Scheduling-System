"use client";

import { ScheduleClassCard } from "@/components/schedule/ScheduleClassCard";
import type { Timetable } from "@/lib/buildTimetable";

interface ScheduleGridProps {
  timetable: Timetable;
  onRemove: (sectionId: string) => void;
  conflictingEntryIds: Set<string>;
}

/**
 * Desktop timetable.
 *
 * Uses a real <table> rather than CSS grid divs: a timetable is genuinely tabular
 * data, and the scope="col"/scope="row" headers let a screen reader announce which
 * day and time a class belongs to instead of reading a flat pile of text.
 *
 * `table-fixed` is load-bearing, not cosmetic. With automatic layout the browser
 * sizes each column to its contents, so adding a class would re-measure that column
 * and shift every day heading sideways. Fixed layout pins the columns to equal
 * widths. The cell minimum height is set just under a populated card's height, so
 * rows barely move when a class lands in one while empty periods stay compact
 * instead of padding the grid out with whitespace. The minimum table width lets the
 * container scroll on a narrow viewport instead of crushing six days into slivers.
 */
export function ScheduleGrid({ timetable, onRemove, conflictingEntryIds }: ScheduleGridProps) {
  const { days, rows } = timetable;

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full min-w-[680px] table-fixed border-collapse text-left">
        <caption className="sr-only">Weekly class schedule, by day and time</caption>
        <thead>
          <tr className="border-b border-slate-200">
            <th
              scope="col"
              className="w-28 px-3 py-2 text-xs font-medium tracking-wide text-slate-500 uppercase"
            >
              Time
            </th>
            {days.map((day) => (
              <th key={day} scope="col" className="px-2 py-2 text-sm font-semibold text-slate-900">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={`${row.startTime}-${row.endTime}`}
              className="border-b border-slate-100 last:border-0"
            >
              <th scope="row" className="px-3 py-2 align-top text-xs font-medium text-slate-500">
                {row.label}
              </th>
              {days.map((day) => {
                const entries = row.entriesByDay.get(day) ?? [];
                return (
                <td key={day} className="h-14 px-1.5 py-1.5 align-top">
                    {entries.length > 0 ? (
                      <div className="space-y-1.5">
                        {entries.map((entry) => (
                          <ScheduleClassCard
                            key={entry.id}
                            entry={entry}
                            onRemove={onRemove}
                            isConflicting={conflictingEntryIds.has(entry.id)}
                          />
                        ))}
                      </div>
                    ) : null}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}