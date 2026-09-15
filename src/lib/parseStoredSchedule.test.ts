import { describe, expect, it } from "vitest";
import { parseStoredSchedule } from "@/lib/parseStoredSchedule";
import type { SelectedSection } from "@/types/course";

const valid: SelectedSection = {
  courseId: "CCPROG3",
  courseCode: "CCPROG3",
  courseTitle: "Object-Oriented Programming",
  units: 3,
  category: "major",
  section: {
    id: "CCPROG3-S15",
    section: "S15",
    instructor: "Soren Uy",
    schedule: [{ day: "Wednesday", startTime: "07:30", endTime: "09:00", room: "A1901" }],
  },
};

const store = (value: unknown) => parseStoredSchedule(JSON.stringify(value));

describe("parseStoredSchedule", () => {
  it("accepts a well-formed payload unchanged", () => {
    expect(store([valid])).toEqual([valid]);
  });

  it("returns nothing for unparseable JSON", () => {
    expect(parseStoredSchedule("{ not json")).toEqual([]);
  });

  it("returns nothing when the payload is not an array", () => {
    expect(store({ courses: [valid] })).toEqual([]);
  });

  it("drops an entry saved before the category field existed", () => {
    const { category, ...stale } = valid;
    void category;

    expect(store([stale])).toEqual([]);
  });

  it("drops an entry saved before rooms moved onto each meeting", () => {
    const stale = {
      ...valid,
      section: {
        ...valid.section,
        schedule: [{ day: "Wednesday", startTime: "07:30", endTime: "09:00" }],
      },
    };

    expect(store([stale])).toEqual([]);
  });

  it("drops an entry whose meeting falls on an unrecognized day", () => {
    const badDay = {
      ...valid,
      section: {
        ...valid.section,
        schedule: [{ day: "Funday", startTime: "07:30", endTime: "09:00", room: "A1901" }],
      },
    };

    expect(store([badDay])).toEqual([]);
  });

  it("keeps the valid entries alongside the dropped ones", () => {
    const { category, ...stale } = valid;
    void category;

    expect(store([stale, valid])).toEqual([valid]);
  });
});