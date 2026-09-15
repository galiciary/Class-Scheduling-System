"use client";

import { ScheduleClassCard } from "@/components/schedule/ScheduleClassCard";
import type { TimetableDay } from "@/lib/buildTimetable";

interface ScheduleDayListProps {
  days: TimetableDay[];
  onRemove: (sectionId: string) => void;
  conflictingEntryIds: Set<string>;
}

/**
 * Mobile timetable. Six day columns are unreadable at phone width, so the same
 * meetings are stacked day by day instead.
 *
 * Unlike the desktop grid, free days are skipped rather than rendered empty —
 * vertical space is the scarce resource on a phone, and an empty day section
 * would just be scroll to get past.
 */
export function ScheduleDayList({ days, onRemove, conflictingEntryIds }: ScheduleDayListProps) {
  const daysWithClasses = days.filter((day) => day.entries.length > 0);

  return (
    <div className="space-y-4">
      {daysWithClasses.map((day) => (
        <section key={day.day} className="rounded-xl border border-slate-200 bg-white p-3">
          <h3 className="mb-2 text-sm font-semibold text-slate-900">{day.day}</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {day.entries.map((positioned) => (
              <ScheduleClassCard
                key={positioned.entry.id}
                entry={positioned.entry}
                onRemove={onRemove}
                isConflicting={conflictingEntryIds.has(positioned.entry.id)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}