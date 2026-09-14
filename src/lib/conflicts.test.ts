import { describe, expect, it } from "vitest";
import type { TimetableEntry } from "@/lib/buildTimetable";
import { describeConflict, detectConflicts } from "@/lib/conflicts";
import type { DayOfWeek } from "@/types/course";

interface EntryInput {
  id: string;
  sectionId: string;
  courseCode: string;
  sectionCode: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
}

function entry(input: EntryInput): TimetableEntry {
  return {
    ...input,
    courseTitle: `${input.courseCode} title`,
    category: "major",
    instructor: "Instructor",
    room: "R101",
  };
}

describe("detectConflicts", () => {
  it("reports nothing when classes fall at different times", () => {
    const report = detectConflicts([
      entry({ id: "a", sectionId: "A", courseCode: "AAA", sectionCode: "S01", day: "Monday", startTime: "07:30", endTime: "09:00" }),
      entry({ id: "b", sectionId: "B", courseCode: "BBB", sectionCode: "S02", day: "Monday", startTime: "11:00", endTime: "12:30" }),
    ]);

    expect(report.conflicts).toEqual([]);
    expect(report.conflictingEntryIds.size).toBe(0);
  });

  it("reports nothing when classes are on different days at the same time", () => {
    const report = detectConflicts([
      entry({ id: "a", sectionId: "A", courseCode: "AAA", sectionCode: "S01", day: "Monday", startTime: "07:30", endTime: "09:00" }),
      entry({ id: "b", sectionId: "B", courseCode: "BBB", sectionCode: "S02", day: "Tuesday", startTime: "07:30", endTime: "09:00" }),
    ]);

    expect(report.conflicts).toEqual([]);
  });

  it("does not treat back-to-back classes as overlapping", () => {
    const report = detectConflicts([
      entry({ id: "a", sectionId: "A", courseCode: "AAA", sectionCode: "S01", day: "Monday", startTime: "07:30", endTime: "09:00" }),
      entry({ id: "b", sectionId: "B", courseCode: "BBB", sectionCode: "S02", day: "Monday", startTime: "09:00", endTime: "10:30" }),
    ]);

    expect(report.conflicts).toEqual([]);
  });

  it("detects a partial overlap and flags both entries", () => {
    const report = detectConflicts([
      entry({ id: "a", sectionId: "A", courseCode: "AAA", sectionCode: "S01", day: "Monday", startTime: "07:30", endTime: "09:00" }),
      entry({ id: "b", sectionId: "B", courseCode: "BBB", sectionCode: "S02", day: "Monday", startTime: "08:30", endTime: "10:00" }),
    ]);

    expect(report.conflicts).toHaveLength(1);
    expect(report.conflicts[0].timeLabel).toBe("8:30 AM – 9:00 AM");
    expect([...report.conflictingEntryIds].sort()).toEqual(["a", "b"]);
  });

  it("reports one conflict per section pair, listing every day they clash on", () => {
    const report = detectConflicts([
      entry({ id: "a1", sectionId: "A", courseCode: "AAA", sectionCode: "S01", day: "Tuesday", startTime: "12:45", endTime: "14:15" }),
      entry({ id: "a2", sectionId: "A", courseCode: "AAA", sectionCode: "S01", day: "Friday", startTime: "12:45", endTime: "14:15" }),
      entry({ id: "b1", sectionId: "B", courseCode: "BBB", sectionCode: "S02", day: "Tuesday", startTime: "12:45", endTime: "14:15" }),
      entry({ id: "b2", sectionId: "B", courseCode: "BBB", sectionCode: "S02", day: "Friday", startTime: "12:45", endTime: "14:15" }),
    ]);

    expect(report.conflicts).toHaveLength(1);
    expect(report.conflicts[0].days).toEqual(["Tuesday", "Friday"]);
  });
});

describe("describeConflict", () => {
  it("names both sections, the days, and the overlapping window", () => {
    const report = detectConflicts([
      entry({ id: "a1", sectionId: "A", courseCode: "CSARCH1", sectionCode: "S25", day: "Tuesday", startTime: "12:45", endTime: "14:15" }),
      entry({ id: "a2", sectionId: "A", courseCode: "CSARCH1", sectionCode: "S25", day: "Friday", startTime: "12:45", endTime: "14:15" }),
      entry({ id: "b1", sectionId: "B", courseCode: "CSOPESY", sectionCode: "S40", day: "Tuesday", startTime: "12:45", endTime: "14:15" }),
      entry({ id: "b2", sectionId: "B", courseCode: "CSOPESY", sectionCode: "S40", day: "Friday", startTime: "12:45", endTime: "14:15" }),
    ]);

    expect(describeConflict(report.conflicts[0])).toBe(
      "CSARCH1 S25 overlaps CSOPESY S40 on Tuesday and Friday, 12:45 PM – 2:15 PM",
    );
  });
});