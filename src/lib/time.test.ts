import { describe, expect, it } from "vitest";
import { formatSlot, formatTime, timeToMinutes } from "@/lib/time";

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

describe("formatSlot", () => {
  it("renders the day, time range, and room on one line", () => {
    expect(
      formatSlot({ day: "Monday", startTime: "09:15", endTime: "10:45", room: "G208" }),
    ).toBe("Mon 9:15 AM – 10:45 AM · G208");
  });

  it("shows the online room the same way any other room is shown", () => {
    expect(
      formatSlot({ day: "Thursday", startTime: "09:15", endTime: "10:45", room: "Online" }),
    ).toBe("Thu 9:15 AM – 10:45 AM · Online");
  });
});