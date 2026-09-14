# Mock course data

`mockCourses.json` is hand-authored mock data modeled after DLSU's actual BSCS-NIS
curriculum (course codes/titles pulled from the official program checklist) and
class-scheduling conventions, so it reads as realistic rather than placeholder data.

## Shape

Matches `CourseData` in `src/types/course.ts`: `Course -> Section[] -> ScheduleSlot[]`.

## Conventions followed

- **Units → session length**: 3-unit major/GE courses meet twice a week, 1.5 hours
  per session. `PETHREE` (PE, 2 units) meets once a week.
- **Period grid**: the day is divided into fixed 1.5-hour periods starting 7:30 AM,
  with a 15-minute break between each, running until 9:15 PM. Every section's
  `startTime`/`endTime` lands on one of these periods:
  `07:30–09:00, 09:15–10:45, 11:00–12:30, 12:45–14:15, 14:30–16:00, 16:15–17:45, 18:00–19:30, 19:45–21:15`.
- **Day pairing**: twice-a-week sections follow DLSU's standard pairings —
  Monday/Thursday, Tuesday/Friday, or Wednesday/Saturday.
- **Section codes**: `S`-prefixed (e.g. `S15`) for major/GE courses, `Y`-prefixed
  (e.g. `Y11`) for PE, matching most of DLSU's usual convention.
- **Rooms**: ordinary classroom codes (e.g. `G301`, `A1901`) for lecture courses;
  PE sections use Razon Sports Center codes (`ER801`, `ER802`) instead, since PE
  isn't held in a classroom.

## Assumptions carried over from the assessment brief

- No conflicting schedules are guaranteed in this dataset; the assessment
  explicitly says conflict detection is not required.
- Colors are intentionally **not** stored per course; see the doc comment in
  `src/lib/colors.ts` for why.