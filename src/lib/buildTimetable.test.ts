import { describe, expect, it } from "vitest";
import { buildTimetable, groupTimetableByDay } from "@/lib/buildTimetable";
import { CLASS_DAYS, CLASS_PERIODS } from "@/lib/time";
import type { ScheduleSlot, SelectedSection } from "@/types/course";

function selection(courseCode: string, sectionId: string, schedule: ScheduleSlot[]): SelectedSection {
  return {
    courseId: courseCode,
    courseCode,
    courseTitle: `${courseCode} title`,
    units: 3,
    category: "major",
    section: {
      id: sectionId,
      section: "S01",
      instructor: "Instructor",
      room: "R101",
      schedule,
    },
  };
}

describe("buildTimetable", () => {
  it("renders the full fixed grid even with nothing selected", () => {
    const timetable = buildTimetable([]);

    expect(timetable.days).toEqual(CLASS_DAYS);
    expect(timetable.rows).toHaveLength(CLASS_PERIODS.length);
    expect(timetable.entries).toEqual([]);
  });

  it("places each of a section's meetings in the matching period and day", () => {
    const timetable = buildTimetable([
      selection("CCPROG3", "CCPROG3-S15", [
        { day: "Wednesday", startTime: "07:30", endTime: "09:00" },
        { day: "Saturday", startTime: "07:30", endTime: "09:00" },
      ]),
    ]);

    const firstPeriod = timetable.rows[0];
    expect(firstPeriod.label).toBe("7:30 AM – 9:00 AM");
    expect(firstPeriod.entriesByDay.get("Wednesday")).toHaveLength(1);
    expect(firstPeriod.entriesByDay.get("Saturday")).toHaveLength(1);
    expect(firstPeriod.entriesByDay.get("Monday")).toBeUndefined();
    expect(timetable.entries).toHaveLength(2);
  });

  it("adds a row in chronological order for a time outside the standard periods", () => {
    const timetable = buildTimetable([
      selection("ODD", "ODD-S01", [{ day: "Monday", startTime: "10:00", endTime: "11:30" }]),
    ]);

    expect(timetable.rows).toHaveLength(CLASS_PERIODS.length + 1);
    // Sits between the 9:15 and 11:00 periods rather than being appended at the end.
    expect(timetable.rows[2].startTime).toBe("10:00");
  });

  it("adds a column for a day outside the standard class week", () => {
    const timetable = buildTimetable([
      selection("ODD", "ODD-S01", [{ day: "Sunday", startTime: "07:30", endTime: "09:00" }]),
    ]);

    expect(timetable.days).toEqual([...CLASS_DAYS, "Sunday"]);
  });

  it("stacks two classes sharing a cell rather than dropping one", () => {
    const slot: ScheduleSlot[] = [{ day: "Monday", startTime: "07:30", endTime: "09:00" }];
    const timetable = buildTimetable([
      selection("AAA", "AAA-S01", slot),
      selection("BBB", "BBB-S01", slot),
    ]);

    expect(timetable.rows[0].entriesByDay.get("Monday")).toHaveLength(2);
  });
});

describe("groupTimetableByDay", () => {
  it("lists each day's classes in chronological order", () => {
    const timetable = buildTimetable([
      selection("LATE", "LATE-S01", [{ day: "Monday", startTime: "14:30", endTime: "16:00" }]),
      selection("EARLY", "EARLY-S01", [{ day: "Monday", startTime: "07:30", endTime: "09:00" }]),
    ]);

    const monday = groupTimetableByDay(timetable).find((group) => group.day === "Monday");

    expect(monday?.entries.map((entry) => entry.courseCode)).toEqual(["EARLY", "LATE"]);
  });
});