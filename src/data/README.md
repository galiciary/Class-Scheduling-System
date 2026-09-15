**# Mock course data**

`mockCourses.json` contains hand-authored mock data based on DLSU's curriculum. Course codes and titles are taken from the official program checklist, while the class schedules follow common DLSU scheduling conventions. This makes the data feel realistic instead of looking like generic placeholder data.

**## Shape**

The data follows the `CourseData` type in `src/types/course.ts`: `Course -> Section[] -> ScheduleSlot[]`.

**## Conventions followed**

- ****Units → session length****: 3-unit major/GE courses meet twice a week, with each session lasting 1.5 hours. `PETHREE` (PE, 2 units) meets once a week.

- ****Period grid****: The day is divided into fixed 1.5-hour periods starting at 7:30 AM, with a 15-minute break between each period, and running until 9:15 PM. Every section's `startTime`/`endTime` matches one of these periods:

`07:30–09:00, 09:15–10:45, 11:00–12:30, 12:45–14:15, 14:30–16:00, 16:15–17:45, 18:00–19:30, 19:45–21:15`.

These periods are also defined in `CLASS_PERIODS` in `src/lib/time.ts`, which the timetable uses when rendering schedules.

- ****Day pairing****: Twice-a-week sections use DLSU's standard day pairings — Monday/Thursday, Tuesday/Friday, or Wednesday/Saturday. No Sunday classes are included.

- ****Category****: Each course has a `category` (`major`, `general_education`, or `physical_education`) instead of having its category inferred from the course code. A code prefix represents the department offering the course, not its role in the curriculum. For example, CC, CS, and NS courses can all be degree requirements. Likewise, a course such as `PSYFILI` could be a major for a psychology student but a GE for this one. The category therefore needs to be explicitly defined in the data.

**## Assumptions carried over from the assessment brief**

- The brief guarantees that the mock data is conflict-free and does not require conflict detection. However, users can still select sections that overlap, so the app detects and reports these conflicts anyway (`src/lib/conflicts.ts`) — conflict detection is also listed as part of the Functionality criteria.

- Colors are intentionally ****not**** stored per course. `src/lib/colors.ts` maps each course's declared `category` to a color when it is rendered. A real API would return the course's classification, but it would not return a CSS class.
