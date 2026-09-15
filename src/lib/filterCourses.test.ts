import { describe, expect, it } from "vitest";
import { filterCourses } from "@/lib/filterCourses";
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
        schedule: [{ day: "Monday", startTime: "07:30", endTime: "09:00", room: "A1901" }],
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
        schedule: [{ day: "Tuesday", startTime: "09:15", endTime: "10:45", room: "Online" }],
      },
    ],
  },
];

const codesMatching = (query: string) => filterCourses(courses, query).map((course) => course.code);

describe("filterCourses", () => {
  it("returns every course for an empty or whitespace-only query", () => {
    expect(filterCourses(courses, "")).toHaveLength(2);
    expect(filterCourses(courses, "   ")).toHaveLength(2);
  });

  it("matches on course code, ignoring case", () => {
    expect(codesMatching("ccprog")).toEqual(["CCPROG3"]);
    expect(codesMatching("CCPROG")).toEqual(["CCPROG3"]);
  });

  it("matches on course title", () => {
    expect(codesMatching("mathematics")).toEqual(["GEMATMW"]);
  });

  it("matches on an instructor teaching any of the course's sections", () => {
    expect(codesMatching("soren")).toEqual(["CCPROG3"]);
  });

  it("returns nothing when the query matches no field", () => {
    expect(filterCourses(courses, "zzzz")).toEqual([]);
  });
});