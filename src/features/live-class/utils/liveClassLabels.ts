import type { BatchDays, BatchTime } from "../types/liveClass.types";

export const BATCH_DAY_LABELS: Record<BatchDays, string> = {
  MTW: "Mon, Tue, Wed",
  MWT: "Mon, Wed, Thu",
  MTT: "Mon, Tue, Thu",
  SS: "Sat, Sun",
};

export const BATCH_TIME_LABELS: Record<BatchTime, string> = {
  "10:00-12:00": "10:00 AM - 12:00 PM",
  "12:00-2:00": "12:00 PM - 02:00 PM",
  "2:30-4:30": "02:30 PM - 04:30 PM",
  "4:30-6:30": "04:30 PM - 06:30 PM",
};

export function getBatchTimeBounds(time: BatchTime): { start: string; end: string } {
  const [start, end] = time.split("-");
  return { start, end };
}