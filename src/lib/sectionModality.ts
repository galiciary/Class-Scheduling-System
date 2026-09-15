import { ONLINE_ROOM, type Section } from "@/types/course";

/**
 * How a section meets, derived from its slots rather than stored.
 *
 * "Hybrid" isn't a field anyone sets — it's what you call a section that meets in
 * person some days and online others. Deriving it means the label can never disagree
 * with the schedule it describes.
 */

export const SECTION_MODALITIES = ["in_person", "hybrid", "online"] as const;

export type SectionModality = (typeof SECTION_MODALITIES)[number];

export const SECTION_MODALITY_LABELS: Record<SectionModality, string> = {
  in_person: "In person",
  hybrid: "Hybrid",
  online: "Online",
};

export function getSectionModality(section: Section): SectionModality {
  const onlineCount = section.schedule.filter((slot) => slot.room === ONLINE_ROOM).length;

  if (onlineCount === 0) return "in_person";
  if (onlineCount === section.schedule.length) return "online";
  return "hybrid";
}