import { describe, expect, it } from "vitest";
import {
  countActiveFilters,
  EMPTY_FILTERS,
  filterCourses,
  type CourseFilters,
} from "@/lib/filterCourses";
import type { Course } from "@/types/course";

const courses: Course[] = [
  {
    id: "CCPROG3",
    code: "CCPROG3",
    title: "Object-Oriented Programming",
    units: 3,
    category: "major",
    sections: [
      {
        id: "CCPROG3-S15",
        section: "S15",
        instructor: "Soren Uy",
        schedule: [
          { day: "Wednesday", startTime: "07:30", endTime: "09:00", room: "A1901" },
          { day: "Saturday", startTime: "07:30", endTime: "09:00", room: "A1901" },
        ],
      },
      {
        id: "CCPROG3-S16",
        section: "S16",
        instructor: "Angel Wings",
        schedule: [
          { day: "Monday", startTime: "16:15", endTime: "17:45", room: "Online" },
          { day: "Thursday", startTime: "16:15", endTime: "17:45", room: "Online" },
        ],
      },
    ],
  },
  {
    id: "GEMATMW",
    code: "GEMATMW",
    title: "Mathematics in the Modern World",
    units: 3,
    category: "general_education",
    sections: [
      {
        id: "GEMATMW-Z11",
        section: "Z11",
        instructor: "Rigor Fernandez",
        schedule: [
          { day: "Monday", startTime: "09:15", endTime: "10:45", room: "G208" },
          { day: "Thursday", startTime: "09:15", endTime: "10:45", room: "Online" },
        ],
      },
    ],
  },
];

const withFilters = (overrides: Partial<CourseFilters>): CourseFilters => ({
  ...EMPTY_FILTERS,
  ...overrides,
});

const codesFrom = (result: Course[]) => result.map((course) => course.code);
const sectionsFrom = (course: Course) => course.sections.map((section) => section.section);

describe("filterCourses", () => {
  it("returns every course when no filter is set", () => {
    expect(filterCourses(courses, EMPTY_FILTERS)).toHaveLength(2);
  });

  it("returns the original course object when nothing was filtered out", () => {
    const [first] = filterCourses(courses, EMPTY_FILTERS);
    expect(first).toBe(courses[0]);
  });

  it("matches a query against code and title, ignoring case", () => {
    expect(codesFrom(filterCourses(courses, withFilters({ query: "ccprog" })))).toEqual(["CCPROG3"]);
    expect(codesFrom(filterCourses(courses, withFilters({ query: "mathematics" })))).toEqual([
      "GEMATMW",
    ]);
  });

  it("keeps only the sections whose instructor matches the query", () => {
    const [course] = filterCourses(courses, withFilters({ query: "soren" }));
    expect(sectionsFrom(course)).toEqual(["S15"]);
  });

  it("filters by category", () => {
    expect(
      codesFrom(filterCourses(courses, withFilters({ categories: ["general_education"] }))),
    ).toEqual(["GEMATMW"]);
  });

  it("filters by section modality", () => {
    const [course] = filterCourses(courses, withFilters({ modalities: ["online"] }));
    expect(course.code).toBe("CCPROG3");
    expect(sectionsFrom(course)).toEqual(["S16"]);
  });

  it("keeps only sections that meet on a selected day", () => {
    const [course] = filterCourses(courses, withFilters({ meetingDays: ["Saturday"] }));
    expect(course.code).toBe("CCPROG3");
    expect(sectionsFrom(course)).toEqual(["S15"]);
  });

  it("treats several selected days as any of them, not all of them", () => {
    const result = filterCourses(courses, withFilters({ meetingDays: ["Monday", "Saturday"] }));
    expect(codesFrom(result)).toEqual(["CCPROG3", "GEMATMW"]);
    expect(sectionsFrom(result[0])).toEqual(["S15", "S16"]);
  });

  it("drops a course entirely when none of its sections meet on a selected day", () => {
    expect(filterCourses(courses, withFilters({ meetingDays: ["Friday"] }))).toEqual([]);
  });

  it("applies filters together rather than independently", () => {
    const result = filterCourses(
      courses,
      withFilters({ categories: ["major"], modalities: ["in_person"] }),
    );
    expect(result).toHaveLength(1);
    expect(sectionsFrom(result[0])).toEqual(["S15"]);
  });
});

describe("countActiveFilters", () => {
  it("ignores the free-text query and counts only structured filters", () => {
    expect(countActiveFilters(withFilters({ query: "anything" }))).toBe(0);
    expect(
      countActiveFilters(withFilters({ categories: ["major"], meetingDays: ["Saturday"] })),
    ).toBe(2);
  });
});