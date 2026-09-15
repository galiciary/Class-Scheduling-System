# Technical Rationale

## Stack

**Next.js (App Router) with TypeScript and Tailwind CSS.** The brief allows React or Next.js, so I chose Next.js for its built-in project structure and because it makes moving to a real API fairly straightforward. A route handler can be added later without having to restructure the application.

TypeScript is also useful here because the data model has several similar string fields, such as course codes, section codes, rooms, and times. Using types helped catch mistakes during the two data model refactors described below.

**No state management library, no UI kit.** The brief warns against adding complexity without a good reason. The app only has one piece of shared mutable state: the student's selected sections, which React can handle on its own. The UI is also fairly simple, consisting mainly of a list, a disclosure, and a grid. Using a component library would have added another dependency and a theming layer without providing much benefit.

**Vitest** is used for testing because the logic that needs testing is written in plain TypeScript. Vitest can run it without much configuration beyond resolving the `@/` alias.

## Data model

The data follows the `Course → Section[] → ScheduleSlot[]` structure suggested in the brief. Two decisions within this structure are worth explaining because both fixed problems in an earlier version.

**Course category is declared, not inferred.** The first version tried to determine a course's category from its code prefix, where something like `CS*` would mean one category and `GE*` another. This does not work well with actual course data. A prefix tells you which department offers the course, not what role it plays in a student's curriculum. `CC`, `CS`, and `NS` courses can all be degree requirements even though they have different prefixes. A course like `PSYFILI` can also be a major for a psychology student but a GE for this one. No amount of prefix parsing can reliably represent that difference. Because of this, `category` is stored directly on the course, and `colors.ts` uses that category to determine its color.

**Room belongs to the meeting, not the section.** DLSU sections can be hybrid, meaning they can meet on campus one day and online the next. A single `room` field on the section cannot represent that. Moving the room information into each `ScheduleSlot` makes this possible. It also means "hybrid" does not need to be stored separately. It can simply be derived from sections whose meeting slots have different setups in `sectionModality.ts`. This keeps the label consistent with the actual schedule.

**Color is deliberately absent from the data.** A real registrar API would provide information about a course's classification, but it would not provide a CSS class. Keeping colors out of `mockCourses.json` makes the mock data more representative of what a backend would actually return.

## State management

Selected sections are stored in a module-level store (`lib/scheduleStore.ts`) and accessed through `useSyncExternalStore`. Three issues led me to this approach, and this solution addresses all three.

The schedule is needed by the course list, timetable, and units summary. Using plain `useState` inside a hook would give each caller its own separate copy, which would require a Context provider to keep them synchronized. With a module-level store, any component using `useSchedule()` gets the same data without needing a provider.

Restoring the saved schedule with `setState` inside an effect would cause an extra render every time the component mounts. React's linting also flags this pattern for good reason. `useSyncExternalStore` lets the components read directly from the store without that extra update.

A lazy `useState` initializer that reads from `localStorage` would avoid the effect, but it introduces a hydration problem. The server would render an empty schedule while the client's first render would contain the saved schedule, causing a mismatch. `getServerSnapshot` returns an empty schedule for both the server render and the hydration render, and the saved data is loaded after mounting. This avoids the mismatch.

Another benefit is that the store's mutation functions are defined at the module level, so their references remain stable. This helps `memo` on the course cards work as intended.

## Rendering the timetable

The first version used an HTML `<table>` with one row for each class period. It was simple and semantic, and it gave screen readers proper day and time headers through `scope`. However, every row had the same height. This meant a 2-unit PE class looked the same as a 1.5-hour lecture, and a two-hour gap between classes looked the same as a fifteen-minute gap. For an app whose main purpose is helping students judge whether a schedule works, showing the wrong durations is a correctness issue rather than just a visual one.

The current grid instead uses a continuous 30-minute axis and positions each class block according to its actual start time and duration. A table is not well suited to this. Proportional heights would require `rowSpan` calculations, and a table cell cannot easily place overlapping classes side by side. The app needs to support overlapping selections because conflicts are intentionally allowed.

There is a trade-off here. The semantic table is no longer used. Each day column is given an accessible name, and every class block has an `aria-label` containing the course, section, day, time, and room. This follows the general approach used by calendar-style interfaces, although it is not as strong as using `scope="col"` table headers. I accepted this trade-off because the alternative would be a timetable that gives sighted users misleading information about class duration and spacing.

Overlapping classes are assigned lanes by scanning each day. Meetings are first grouped into clusters of classes that overlap, including overlaps that are connected through another class. Within each cluster, every class gets the lowest available lane. All classes in the same cluster use the same lane count, allowing them to divide the column evenly.

The grid itself has fixed vertical bounds covering the full day instead of adjusting based on the selected classes. This means the timetable has its full height on the first render and does not reflow as classes are added. The class blocks are positioned over the grid rather than stacked inside it.

## Conflict detection

The brief does not require this because the mock data is guaranteed to be conflict-free. I implemented it anyway because students can still select two sections that overlap, and conflict detection is also listed under Functionality in the evaluation criteria.

It **warns rather than blocks**. Showing the conflict directly on the timetable makes it clear which section needs to be changed. Blocking the selection would make it less obvious why the sections cannot be selected together. Conflicts are grouped by section pair rather than by individual day, so if two Tue/Fri courses overlap on both days, they are reported as one conflict instead of two separate conflicts. Classes that end exactly when another begins are not considered overlapping because the comparison uses half-open time ranges.

## Filtering

Filters are applied to **sections** rather than entire courses. A course remains visible if at least one of its sections matches the selected filters, and only the matching sections are kept. Filtering entire courses would create a confusing situation where a course appears to match something like "meets on Monday," but expanding it shows sections that do not actually meet on Monday.

When all sections of a course pass the filters, `filterCourses` returns the original course object instead of creating a copy. This preserves referential equality and helps keep `memo` on the course cards effective.

## Performance

The dataset is small, so most of these decisions are about keeping the architecture sensible rather than solving performance problems that do not currently exist.

Filtering is a pure function wrapped in `useMemo`, using the catalog and filters as its dependencies. This means adding or removing a section does not cause the catalog to be filtered again. Course cards are also memoized and receive the selected section as a **primitive string** instead of a lookup callback. A callback would get a new identity whenever the selection changes, which would defeat the purpose of memoization. Together with the store's stable handlers, changing one course's selection only needs to re-render that course card.

If the catalog became much larger, rendering would likely become the first issue. A few thousand sections would benefit from list virtualization. Search would also be better served by debouncing or a prebuilt search index instead of checking every course and section on every keystroke. Neither is necessary for 19 courses, so adding them now would make the project more complicated without solving an actual problem.

## Testing

There are 41 tests covering the pure modules: time handling, filtering, section modality, timetable construction and lane assignment, conflict detection, and validation of persisted schedules. The architecture was designed with this in mind. Keeping the scheduling rules outside the components makes them possible to test without needing a DOM.

Persisted data receives particular attention because `localStorage` should be treated as untrusted input. TypeScript does not perform runtime validation, so simply casting the stored data would allow an outdated or malformed structure to pass through. This became relevant when the `category` field was added and previously saved schedules no longer contained it. `parseStoredSchedule` checks each stored entry and removes malformed ones individually, so one invalid course does not cause the student's entire saved schedule to be lost.

**Not covered:** component rendering and interaction. Testing these would require Testing Library and a jsdom environment. For this project's scope, I considered the pure scheduling logic the more important area to test, but component-level testing is still a gap.

## Known limitations

- The error state in `useCourses` cannot currently be triggered because importing the bundled JSON does not throw an error. The hook is structured around an asynchronous request so that replacing the mock data with a real endpoint later can be done with minimal changes, and all consumers already handle the loading, success, and error states. However, the error path has not been tested against an actual failed request.

- No component-level tests, as mentioned above.

- The mobile layout places the course list above the schedule, so users have to scroll past the catalog to reach the timetable. This is acceptable for the current mobile layout, while the desktop layout places them side by side.

- No schedule generation or real API integration. Both are optional items in the brief, so I prioritized getting the required functionality working correctly instead of adding features that were not necessary for the assessment.
