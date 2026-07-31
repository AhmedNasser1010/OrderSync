import type { BusinessDocument } from "@ordersync/types";
import { getSessionRangeForDate } from "@ordersync/order-utils";

type OpeningHours = BusinessDocument["operations"]["openingHours"];

export type AnalyticsRanges = {
  start: number | null;
  end: number | null;
  previousStart: number | null;
  previousEnd: number | null;
};

function localMidnightOf(dateStr: string): number {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).getTime();
}

function shiftDays(ts: number, days: number): number {
  const d = new Date(ts);
  d.setDate(d.getDate() + days);
  return d.getTime();
}

function sessionStartOfDate(ts: number, openingHours?: OpeningHours): number {
  const range = getSessionRangeForDate(new Date(ts), openingHours);
  return range ? range.startMs : ts;
}

function sessionEndOfDate(ts: number, openingHours?: OpeningHours): number {
  const range = getSessionRangeForDate(new Date(ts), openingHours);
  return range ? range.endMs : shiftDays(ts, 1);
}

const getAnalyticsRanges = (
  timeRangeValue: string,
  customRange: { start: string; end: string },
  openingHours?: OpeningHours,
): AnalyticsRanges => {
  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();

  if (timeRangeValue === "all") {
    return {
      start: null,
      end: null,
      previousStart: null,
      previousEnd: null,
    };
  }

  if (timeRangeValue === "custom") {
    if (!customRange.start || !customRange.end) {
      return {
        start: null,
        end: null,
        previousStart: null,
        previousEnd: null,
      };
    }

    const start = sessionStartOfDate(
      localMidnightOf(customRange.start),
      openingHours,
    );
    const end = sessionEndOfDate(
      localMidnightOf(customRange.end),
      openingHours,
    );
    const diff = end - start;

    return {
      start,
      end,
      previousStart: start - diff,
      previousEnd: start,
    };
  }

  const days = Number(timeRangeValue);

  return {
    start: sessionStartOfDate(shiftDays(todayStart, -days), openingHours),
    end: sessionEndOfDate(todayStart, openingHours),
    previousStart: sessionStartOfDate(
      shiftDays(todayStart, -2 * days),
      openingHours,
    ),
    previousEnd: sessionEndOfDate(
      shiftDays(todayStart, -days),
      openingHours,
    ),
  };
};

export default getAnalyticsRanges;
