import type { TimeRules } from "./types";

export const isWithinTimeRules = (timeRules: TimeRules | null | undefined): boolean => {
  if (!timeRules?.enabled) return true;

  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  if (!timeRules.days.includes(currentDay)) return false;
  if (currentTime < timeRules.startTime || currentTime > timeRules.endTime)
    return false;

  return true;
};
