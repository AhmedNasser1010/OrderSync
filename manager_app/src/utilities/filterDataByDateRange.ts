const filterDataByDateRange = (
  startDate: string,
  endDate: string,
  pathIntoDateValue: string,
  data: any[]
) => {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  
  return data.filter((item) => {

    const itemDate = new Date(item[pathIntoDateValue]).getTime();
    return itemDate >= start && itemDate <= end;
  });
};

export default filterDataByDateRange;