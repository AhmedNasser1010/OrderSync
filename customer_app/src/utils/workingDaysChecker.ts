import { getBusinessDayOfTimestamp } from "@ordersync/order-utils";

const workingDaysChecker = (workingDays: unknown, isStrictOnline?: boolean) => {
  if (!workingDays) return null;

  if (isStrictOnline === true) return true;

  if (isStrictOnline === false) return false;

  const businessDay = getBusinessDayOfTimestamp(Date.now(), workingDays as never);

  return businessDay !== null;
};

export default workingDaysChecker;
