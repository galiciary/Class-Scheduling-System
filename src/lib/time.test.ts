import { describe, expect, it } from "vitest";
import { formatScheduleCompact, formatTime, timeToMinutes } from "@/lib/time";

describe("timeToMinutes", () => {
  it("converts a 24-hour time to minutes since midnight", () => {
    expect(timeToMinutes("00:00")).toBe(0);
    expect(timeToMinutes("07:30")).toBe(450);
    expect(timeToMinutes("21:15")).toBe(1275);
  });

  it("orders times correctly when compared numerically", () => {
    expect(timeToMinutes("09:15")).toBeLessThan(timeToMinutes("11:00"));
  });
});

describe("formatTime", () => {
  it("formats morning and afternoon times in 12-hour form", () => {
    expect(formatTime("07:30")).toBe("7:30 AM");
    expect(formatTime("14:30")).toBe("2:30 PM");
  });

  it("renders noon and midnight as 12 rather than 0", () => {
    expect(formatTime("12:00")).toBe("12:00 PM");
    expect(formatTime("00:30")).toBe("12:30 AM");
  });
});

describe("formatScheduleCompact", () => {
  it("groups days that share a single time", () => {
    expect(
      formatScheduleCompact([
        { day: "Monday", startTime: "10:00", endTime: "11:30" },
        { day: "Thursday", startTime: "10:00", endTime: "11:30" },
      ]),
    ).toBe("Mon/Thu 10:00 AM – 11:30 AM");
  });

  it("lists each meeting separately when the times differ by day", () => {
    expect(
      formatScheduleCompact([
        { day: "Monday", startTime: "10:00", endTime: "11:30" },
        { day: "Thursday", startTime: "13:00", endTime: "14:30" },
      ]),
    ).toBe("Mon 10:00 AM - 11:30 AM, Thu 1:00 PM - 2:30 PM");
  });

  it("handles a section with no meetings", () => {
    expect(formatScheduleCompact([])).toBe("Schedule TBA");
  });
});