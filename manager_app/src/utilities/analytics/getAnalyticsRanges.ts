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

const getAnalyticsRanges = (
  timeRangeValue: string,
  customRange: { start: string; end: string },
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

    const start = localMidnightOf(customRange.start);
    const end = shiftDays(localMidnightOf(customRange.end), 1);
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
    start: shiftDays(todayStart, -days),
    end: shiftDays(todayStart, 1),
    previousStart: shiftDays(todayStart, -2 * days),
    previousEnd: shiftDays(todayStart, -days + 1),
  };
};

export default getAnalyticsRanges;
