import { useState, useEffect } from "react";

const TimestampToHM = ({ timestamp }) => {
  const [ago, setAgo] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeDifference = () => {
      const currentTimestamp = Date.now();
      const timeDifference = currentTimestamp - timestamp;
      const seconds = Math.floor(timeDifference / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      setAgo({ hours, minutes: minutes % 60, seconds: seconds % 60 });
    };
    calculateTimeDifference();
    const intervalId = setInterval(calculateTimeDifference, 60000);
    return () => clearInterval(intervalId);
  }, [timestamp]);

  return <span>{ago.hours}h, {ago.minutes}m</span>;
};
export default TimestampToHM;
