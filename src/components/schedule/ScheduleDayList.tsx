"use client";

import { ScheduleClassCard } from "@/components/schedule/ScheduleClassCard";
import type { TimetableDayGroup } from "@/lib/buildTimetable";

interface ScheduleDayListProps {
  groups: TimetableDayGroup[];
  onRemove: (sectionId: string) => void;
  conflictingEntryIds: Set<string>;
}

/**
 * Mobile timetable. Six day columns are unreadable at phone width, so the same
 * entries are stacked day by day instead.
 *
 * Unlike the desktop grid, free days are skipped rather than rendered empty —
 * vertical space is the scarce resource on a phone, and an empty day section
 * would just be scroll to get past.
 */
export function ScheduleDayList({ groups, onRemove, conflictingEntryIds }: ScheduleDayListProps) {
  const daysWithClasses = groups.filter((group) => group.entries.length > 0);

  return (
    <div className="space-y-4">
      {daysWithClasses.map((group) => (
        <section key={group.day} className="rounded-xl border border-slate-200 bg-white p-3">
          <h3 className="mb-2 text-sm font-semibold text-slate-900">{group.day}</h3>
          <div className="space-y-2">
            {group.entries.map((entry) => (
              <ScheduleClassCard
                key={entry.id}
                entry={entry}
                onRemove={onRemove}
                showTime
                isConflicting={conflictingEntryIds.has(entry.id)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}