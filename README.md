# Class Scheduling System

A class scheduling web application for browsing course offerings, selecting sections, and building a weekly timetable.

The catalog is modeled on DLSU's real course codes, the 1.5-hour period structure used by most subjects, Mon/Thu, Tue/Fri, and Wed/Sat day pairings, and in-person, hybrid, and fully online sections.

## Features

- Browse the course catalog and expand a course to view its sections

- Search by course code, title, or instructor

- Filter by category, class setup (in person / hybrid / online), and meeting day

- Add and remove sections; selecting a second section from the same course replaces the first

- A weekly timetable drawn to scale, so a 2-unit PE block is visibly longer than a 1.5-hour lecture, and gaps between classes are shown accurately

- Conflict detection: overlapping sections are highlighted on the grid and summarized above it

- Per-meeting rooms, so a hybrid section can show a physical room on one day and "Online" on another

- Schedule persists across reloads through `localStorage`

- Separate desktop and mobile layouts, along with loading, empty, and error states

## Getting started

### Prerequisites

- **Node.js 22.12 or newer.** Next.js itself runs on 20.9+, but the test runner (Vitest 5) requires 22.12+, so 22.12 is the minimum version for the repository as a whole.

- npm (included with Node)

### Installation

```bash

git clone https://github.com/galiciary/Class-Scheduling-System.git

cd Class-Scheduling-System

npm install

```

`npm install` should work without any additional flags. If it reports a peer dependency conflict, that indicates an issue with the committed `package.json` rather than something that should be worked around with `--legacy-peer-deps`.

### Running

```bash

npm run dev

```

Then open http://localhost:3000.

### Other scripts

```bash

npm run build      # production build

npm start          # serve the production build (run `npm run build` first)

npm test           # run the unit tests once

npm run test:watch # re-run tests on change

npm run lint       # ESLint

npx tsc --noEmit   # type check

```

## Project structure

src/

app/ Next.js App Router entry, including layout, page, and global styles

components/

course/ Course list, course card, and section row

filters/ Search box and filter panel

schedule/ Timetable grid, mobile day list, class block, and schedule view

ui/ Shared UI components

hooks/ useCourses (catalog loading), useSchedule (selection)

lib/ Framework-free logic for timetable building, conflict detection, filtering, time helpers, color mapping, and storage validation

types/ Domain types

data/ Mock course data and its documentation

The main separation is in `lib/`. Everything there is pure and has no React dependency, which makes the scheduling rules easier to test directly and keeps the components focused on displaying the data.

## Mock data

`src/data/mockCourses.json`` holds 19 courses. The conventions it follows, including the period grid, day pairings, section code prefixes, and how rooms and online meetings are represented, are documented in [`src/data/README.md`](src/data/README.md).

## Tests

```bash

npm test

```

42 tests covering time handling, filtering, section modality, timetable construction, conflict detection, and validation of persisted schedules.

## Technical rationale

See [TECHNICAL_RATIONALE.md](TECHNICAL_RATIONALE.md) for the reasoning behind the stack, data model, state management, and timetable rendering, including the trade-offs made and the limitations that could be addressed in future improvements.
