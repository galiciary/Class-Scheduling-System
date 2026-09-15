# Mock course data

`mockCourses.json` contains hand-authored mock data based on DLSU's curriculum. Course codes and titles are taken from the official program checklist, while the class schedules follow common DLSU scheduling conventions. This makes the data feel realistic instead of looking like generic placeholder data.

## Shape

The data follows the `CourseData` type in `src/types/course.ts`: `Course -> Section[] -> ScheduleSlot[]`.

## Conventions followed

- **Units → session length**: 3-unit major/GE courses meet twice a week, with each session lasting 1.5 hours. `PETHREE` (PE, 2 units) meets once a week for two hours.

- **Period grid**: The day is divided into fixed 1.5-hour periods starting at 7:30 AM, with a 15-minute break between each period, and running until 9:15 PM. Every 3-unit section's `startTime`/`endTime` matches one of these periods:

  `07:30–09:00, 09:15–10:45, 11:00–12:30, 12:45–14:15, 14:30–16:00, 16:15–17:45, 18:00–19:30, 19:45–21:15`

  The timetable does not assume this. It draws a continuous 30-minute axis and positions each class by its real start time and duration, so PE's two-hour block renders correctly alongside the others, and data from a real API could use any times at all.

- **Day pairing**: Twice-a-week sections use DLSU's standard day pairings — Monday/Thursday, Tuesday/Friday, or Wednesday/Saturday. No Sunday classes are included.

- **Section codes**: `S`-prefixed (such as `S15`) for major courses, `Z`-prefixed for GE courses, and `Y`-prefixed for PE, following DLSU's usual convention.

- **Rooms and modality**: The room is stored on each `ScheduleSlot` rather than on the section, because a section can meet in person one day and online the next. A slot's room is either a room code (`G208`, `A1901`) or the literal value `"Online"`, which is how the registrar records it. "Hybrid" is not stored at all; it is simply a section whose slots differ, and the UI derives the label from that. PE sections use Razon Sports Center codes (`ER801`, `ER802`), since PE is not held in a classroom.

- **Category**: Each course has a `category` (`major`, `general_education`, or `physical_education`) instead of having its category inferred from the course code. A code prefix represents the department offering the course, not its role in the curriculum. For example, CC, CS, and NS courses can all be degree requirements. Likewise, a course such as `PSYFILI` could be a major for a psychology student but a GE for this one. The category therefore needs to be explicitly defined in the data.

## Assumptions carried over from the assessment brief

- The brief guarantees that the mock data is conflict-free and does not require conflict detection. However, users can still select sections that overlap, so the app detects and reports these conflicts anyway (`src/lib/conflicts.ts`) — conflict detection is also listed as part of the Functionality criteria.

- Colors are intentionally **not** stored per course. `src/lib/colors.ts` maps each course's declared `category` to a color when it is rendered. A real API would return the course's classification, but it would not return a CSS class.