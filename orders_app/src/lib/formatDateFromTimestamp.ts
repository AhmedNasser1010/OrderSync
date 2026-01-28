const formatDateFromTimestamp = (
  timestamp: number | string | Date,
  separator: string = "-",
): string => {
  const date = new Date(timestamp);

  if (isNaN(date.getTime())) {
    throw new Error("Invalid timestamp");
  }

  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}${separator}${month}${separator}${day}`;
};

export default formatDateFromTimestamp;
