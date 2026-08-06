import type { DeliveryFeesConfig } from "@ordersync/types";

const DEFAULT_PER_KM = 3.5;
const DEFAULT_MIN = 5;

function getDeliveryFees(
  userDistanceFromRes: number | undefined,
  config?: Partial<DeliveryFeesConfig>
) {
  const perKm = config?.perKm ?? DEFAULT_PER_KM;
  const minFees = config?.min ?? DEFAULT_MIN;
  let fees = perKm * (userDistanceFromRes ?? 0);

  if (fees < minFees) fees = minFees;

  return Math.round(fees);
}

export default getDeliveryFees;
