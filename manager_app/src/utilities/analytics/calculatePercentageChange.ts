export const calculatePercentageChange = (
  current: number,
  previous: number,
) => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return Number((((current - previous) / previous) * 100).toFixed(1));
};
