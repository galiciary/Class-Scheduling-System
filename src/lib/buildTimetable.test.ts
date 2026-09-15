import { describe, expect, it } from "vitest";
import { buildTimetable } from "@/lib/buildTimetable";
import { CLASS_DAYS, GRID_END_MINUTES, GRID_START_MINUTES } from "@/lib/time";
import type { ScheduleSlot, SelectedSection } from "@/types/course";

function selection(
  courseCode: string,
  sectionId: string,
  schedule: ScheduleSlot[],
): SelectedSection {
  return {
    courseId: courseCode,
    courseCode,
    courseTitle: `${courseCode} title`,
    units: 3,
    category: "major",
    section: { id: sectionId, section: "S01", instructor: "Instructor", schedule },
  };
}

const dayNamed = (timetable: ReturnType<typeof buildTimetable>, day: string) =>
  timetable.days.find((candidate) => candidate.day === day);

describe("buildTimetable", () => {
  it("spans the standard day and every class day even with nothing selected", () => {
    const timetable = buildTimetable([]);

    expect(timetable.days.map((day) => day.day)).toEqual(CLASS_DAYS);
    expect(timetable.startMinutes).toBe(GRID_START_MINUTES);
    expect(timetable.endMinutes).toBe(GRID_END_MINUTES);
    expect(timetable.entries).toEqual([]);
  });

  it("positions a meeting by its start and end in minutes", () => {
    const timetable = buildTimetable([
      selection("CCPROG3", "CCPROG3-S15", [
        { day: "Wednesday", startTime: "09:15", endTime: "10:45", room: "A1901" },
      ]),
    ]);

    const [positioned] = dayNamed(timetable, "Wednesday")!.entries;
    expect(positioned.startMinutes).toBe(9 * 60 + 15);
    expect(positioned.endMinutes).toBe(10 * 60 + 45);
  });

  it("sizes a two-hour class longer than a ninety-minute one", () => {
    const timetable = buildTimetable([
      selection("PETHREE", "PETHREE-Y11", [
        { day: "Friday", startTime: "13:00", endTime: "15:00", room: "ER801" },
      ]),
      selection("CCPROG3", "CCPROG3-S15", [
        { day: "Monday", startTime: "09:15", endTime: "10:45", room: "A1901" },
      ]),
    ]);

    const pe = dayNamed(timetable, "Friday")!.entries[0];
    const lecture = dayNamed(timetable, "Monday")!.entries[0];

    expect(pe.endMinutes - pe.startMinutes).toBe(120);
    expect(lecture.endMinutes - lecture.startMinutes).toBe(90);
  });

  it("takes each meeting's room from its own slot, not from the section", () => {
    const timetable = buildTimetable([
      selection("GEMATMW", "GEMATMW-Z11", [
        { day: "Monday", startTime: "09:15", endTime: "10:45", room: "G208" },
        { day: "Thursday", startTime: "09:15", endTime: "10:45", room: "Online" },
      ]),
    ]);

    expect(timetable.entries.map((entry) => `${entry.day}:${entry.room}`)).toEqual([
      "Monday:G208",
      "Thursday:Online",
    ]);
  });

  it("gives classes that do not overlap the full width of the column", () => {
    const timetable = buildTimetable([
      selection("EARLY", "EARLY-S01", [
        { day: "Monday", startTime: "09:15", endTime: "10:45", room: "R101" },
      ]),
      selection("LATE", "LATE-S01", [
        { day: "Monday", startTime: "11:00", endTime: "12:30", room: "R101" },
      ]),
    ]);

    const monday = dayNamed(timetable, "Monday")!;
    expect(monday.entries.map((positioned) => positioned.columnCount)).toEqual([1, 1]);
  });

  it("puts overlapping classes in separate lanes so neither is hidden", () => {
    const timetable = buildTimetable([
      selection("AAA", "AAA-S01", [
        { day: "Monday", startTime: "09:15", endTime: "10:45", room: "R101" },
      ]),
      selection("BBB", "BBB-S01", [
        { day: "Monday", startTime: "10:00", endTime: "11:30", room: "R102" },
      ]),
    ]);

    const monday = dayNamed(timetable, "Monday")!;
    expect(monday.entries.map((positioned) => positioned.columnIndex)).toEqual([0, 1]);
    expect(monday.entries.every((positioned) => positioned.columnCount === 2)).toBe(true);
  });

  it("orders each day's classes chronologically", () => {
    const timetable = buildTimetable([
      selection("LATE", "LATE-S01", [
        { day: "Monday", startTime: "14:30", endTime: "16:00", room: "R101" },
      ]),
      selection("EARLY", "EARLY-S01", [
        { day: "Monday", startTime: "07:30", endTime: "09:00", room: "R101" },
      ]),
    ]);

    expect(dayNamed(timetable, "Monday")!.entries.map((p) => p.entry.courseCode)).toEqual([
      "EARLY",
      "LATE",
    ]);
  });

  it("widens the grid for a class outside the standard window", () => {
    const timetable = buildTimetable([
      selection("DAWN", "DAWN-S01", [
        { day: "Monday", startTime: "06:00", endTime: "07:00", room: "R101" },
      ]),
    ]);

    expect(timetable.startMinutes).toBe(6 * 60);
    expect(timetable.endMinutes).toBe(GRID_END_MINUTES);
  });

  it("adds a column for a day outside the standard class week", () => {
    const timetable = buildTimetable([
      selection("ODD", "ODD-S01", [
        { day: "Sunday", startTime: "07:30", endTime: "09:00", room: "R101" },
      ]),
    ]);

    expect(timetable.days.map((day) => day.day)).toEqual([...CLASS_DAYS, "Sunday"]);
  });
});