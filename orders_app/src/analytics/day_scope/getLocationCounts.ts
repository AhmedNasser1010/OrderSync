import type { OrderType } from '@ordersync/types';
import { LocationCountsType } from '@/analytics/types'

export default function getLocationCounts(order: OrderType) {
  const locationCounts: LocationCountsType = {};

  // Location Counts - using delivery address from the new architecture
  const locationKey = `${order.delivery.address}:${order.delivery.latlng.join(
    ","
  )}`;
  if (!locationCounts[locationKey]) {
    locationCounts[locationKey] = {
      address: order.delivery.address,
      latlng: order.delivery.latlng,
      ordersCount: 0,
    };
  }
  locationCounts[locationKey].ordersCount++;

  return locationCounts;
}
