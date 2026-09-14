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
- **Category**: each course declares a `category` (`major`, `general_education`, or
  `physical_education`) rather than having it inferred from the course code. A code
  prefix identifies the offering department, not the course's curriculum role — CC, CS,
  and NS are all degree requirements — and a course like `PSYFILI` is a major for a
  psychology student and a GE for this one. Only the data can express that.

## Assumptions carried over from the assessment brief

- The brief guarantees the mock data is conflict-free and waives conflict detection.
  Selecting sections that clash is still possible, so the app detects and reports
  overlaps anyway (`src/lib/conflicts.ts`) — the evaluation criteria list conflict
  detection under Functionality.
- Colors are intentionally **not** stored per course. `src/lib/colors.ts` maps the
  declared `category` to a color at render time — a real API would return a course
  classification, but never a CSS class.