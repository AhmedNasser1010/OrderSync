const formatTimeFromTimestamp = (timestamp: number | string | Date): string => {
  const date = new Date(timestamp);

  if (isNaN(date.getTime())) {
    throw new Error("Invalid timestamp");
  }

  let hours: number = date.getHours();
  const minutes: string = date.getMinutes().toString().padStart(2, "0");
  const ampm: string = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12;

  const strTime: string = `${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;

  return strTime;
};

export default formatTimeFromTimestamp;
