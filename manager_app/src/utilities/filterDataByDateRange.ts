const filterDataByDateRange = <T,>(
  startDate: string,
  endDate: string,
  pathIntoDateValue: keyof T,
  data: T[],
) => {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  return data.filter((item) => {
    const itemDate = new Date(
      item[pathIntoDateValue] as string | number | Date,
    ).getTime();
    return itemDate >= start && itemDate <= end;
  });
};

export default filterDataByDateRange;