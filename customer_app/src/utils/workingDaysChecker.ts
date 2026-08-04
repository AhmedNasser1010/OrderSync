import { getBusinessDayOfTimestamp } from "@ordersync/order-utils";

const workingDaysChecker = (
  workingDays: unknown,
  isStrictOnline?: boolean,
  openNowUntil?: number
) => {
  if (isStrictOnline === true) return true;

  if (isStrictOnline === false) return false;

  if (openNowUntil && Date.now() < openNowUntil) return true;

  if (!workingDays) return null;

  const businessDay = getBusinessDayOfTimestamp(Date.now(), workingDays as never);

  return businessDay !== null;
};

export default workingDaysChecker;
