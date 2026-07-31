import type { BusinessDocument } from "@ordersync/types";

export type OpeningHours = BusinessDocument["operations"]["openingHours"];

export type BusinessDay = {
  dateKey: string;
  startMs: number;
  endMs: number;
};

export type SessionRange = {
  startMs: number;
  endMs: number;
  startMinutes: number;
  endMinutes: number;
  spansNextDay: boolean;
};

const MINUTES_PER_DAY = 24 * 60;

const WEEKDAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

export function localDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function getSessionMinutes(
  date: Date,
  openingHours?: OpeningHours,
): { start: number; end: number } | null {
  if (!openingHours) return null;

  const dayKey = WEEKDAY_KEYS[date.getDay()];
  const dayData = openingHours[dayKey];
  if (!dayData || dayData.closed) return null;

  const start = parseTimeToMinutes(dayData.start);
  let end = parseTimeToMinutes(dayData.end);

  if (end === 0) end = MINUTES_PER_DAY;
  if (end < start) end += MINUTES_PER_DAY;
  if (start === end) return null;

  return { start, end };
}

export function getSessionRangeForDate(
  date: Date,
  openingHours?: OpeningHours,
): SessionRange | null {
  const minutes = getSessionMinutes(date, openingHours);
  if (!minutes) return null;

  const dayStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();

  return {
    startMs: dayStart + minutes.start * 60_000,
    endMs: dayStart + minutes.end * 60_000,
    startMinutes: minutes.start,
    endMinutes: minutes.end,
    spansNextDay: minutes.end > MINUTES_PER_DAY,
  };
}

export function getBusinessDayOfTimestamp(
  ts: number,
  openingHours?: OpeningHours,
): BusinessDay | null {
  const date = new Date(ts);
  const currentSession = getSessionRangeForDate(date, openingHours);

  if (
    currentSession &&
    ts >= currentSession.startMs &&
    ts < currentSession.endMs
  ) {
    return {
      dateKey: localDateKey(date),
      startMs: currentSession.startMs,
      endMs: currentSession.endMs,
    };
  }

  const previousDate = new Date(date);
  previousDate.setDate(previousDate.getDate() - 1);
  const previousSession = getSessionRangeForDate(previousDate, openingHours);

  if (
    previousSession &&
    previousSession.spansNextDay &&
    ts >= previousSession.startMs &&
    ts < previousSession.endMs
  ) {
    return {
      dateKey: localDateKey(previousDate),
      startMs: previousSession.startMs,
      endMs: previousSession.endMs,
    };
  }

  return null;
}

export function getActiveSessionBounds(
  ts: number,
  openingHours?: OpeningHours,
): { startMs: number; endMs: number } {
  const businessDay = getBusinessDayOfTimestamp(ts, openingHours);
  if (businessDay) {
    return { startMs: businessDay.startMs, endMs: businessDay.endMs };
  }

  const date = new Date(ts);
  const startMs = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
  return { startMs, endMs: startMs + MINUTES_PER_DAY * 60_000 };
}
