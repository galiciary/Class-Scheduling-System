import { describe, expect, it } from "vitest";
import { getSectionModality } from "@/lib/sectionModality";
import type { Section } from "@/types/course";

function section(rooms: string[]): Section {
  return {
    id: "TEST-S01",
    section: "S01",
    instructor: "Instructor",
    schedule: rooms.map((room, index) => ({
      day: index === 0 ? "Monday" : "Thursday",
      startTime: "09:15",
      endTime: "10:45",
      room,
    })),
  };
}

describe("getSectionModality", () => {
  it("is in person when no meeting is online", () => {
    expect(getSectionModality(section(["G208", "G208"]))).toBe("in_person");
  });

  it("is online when every meeting is online", () => {
    expect(getSectionModality(section(["Online", "Online"]))).toBe("online");
  });

  it("is hybrid when meetings are split between campus and online", () => {
    expect(getSectionModality(section(["G208", "Online"]))).toBe("hybrid");
  });
});