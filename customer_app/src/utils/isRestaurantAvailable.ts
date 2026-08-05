import workingDaysChecker from "@/utils/workingDaysChecker";
import type { BusinessDocument } from "@ordersync/types";

type OpeningHours = BusinessDocument["operations"]["openingHours"];

export interface RestaurantAvailability {
  status?: string;
  openingHours?: OpeningHours;
  openNowUntil?: number;
}

const isRestaurantAvailable = ({
  status,
  openingHours,
  openNowUntil,
}: RestaurantAvailability): boolean => {
  if (status === "busy") return true;
  if (status !== "active") return false;
  return workingDaysChecker(openingHours, undefined, openNowUntil) !== false;
};

export default isRestaurantAvailable;
