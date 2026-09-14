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
  These are mirrored in `CLASS_PERIODS` in `src/lib/time.ts`, which is what the
  timetable renders.
- **Day pairing**: twice-a-week sections follow DLSU's standard pairings —
  Monday/Thursday, Tuesday/Friday, or Wednesday/Saturday. No Sunday classes.
- **Section codes**: `S`-prefixed (e.g. `S15`) for major courses, `Z`-prefixed for
  GE courses, and `Y`-prefixed for PE, matching DLSU's usual convention.
- **Rooms**: ordinary classroom codes (e.g. `G301`, `A1901`) for lecture courses;
  PE sections use Razon Sports Center codes (`ER801`, `ER802`) instead, since PE
  isn't held in a classroom.

## Assumptions carried over from the assessment brief

- The brief guarantees the mock data is conflict-free and waives conflict detection.
  Selecting sections that clash is still possible, so the app detects and reports
  overlaps anyway (`src/lib/conflicts.ts`) — the evaluation criteria list conflict
  detection under Functionality.
- Colors are intentionally **not** stored per course. They're derived from the
  course code's category prefix (CC/CS, NS, GE/LCC, PE) at render time; see
  `src/lib/colors.ts` for the reasoning.