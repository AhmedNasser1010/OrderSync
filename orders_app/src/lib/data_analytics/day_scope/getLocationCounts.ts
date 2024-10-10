import { OrderType } from "@/types/order";
import { LocationCountsType } from '@/lib/data_analytics/types'

export default function getLocationCounts(order: OrderType) {
  const locationCounts: LocationCountsType = {};

  // Location Counts
  const locationKey = `${order.location.address}:${order.location.latlng.join(
    ","
  )}`;
  if (!locationCounts[locationKey]) {
    locationCounts[locationKey] = {
      address: order.location.address,
      latlng: order.location.latlng,
      ordersCount: 0,
    };
  }
  locationCounts[locationKey].ordersCount++;

  return locationCounts;
}
