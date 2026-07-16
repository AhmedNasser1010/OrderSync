import type { OrderType } from '@ordersync/types';
import { OrderDurationsType } from "@/analytics/types";
import getAverage from "@/lib/getAverage";

export default function calcOrderDurations(
  order: OrderType
): OrderDurationsType {
  const preparationTimes: number[] = [];
  const deliveryTimes: number[] = [];
  const completionTimes: number[] = [];

  // Calculate order durations using timeline fields
  if (order.timeline.preparingAt && order.timeline.placedAt) {
    preparationTimes.push(
      order.timeline.preparingAt - order.timeline.placedAt
    );
  }
  if (order.timeline.deliveredAt && order.timeline.preparingAt) {
    completionTimes.push(
      order.timeline.deliveredAt - order.timeline.preparingAt
    );
  }
  if (order.timeline.deliveredAt && order.timeline.placedAt) {
    deliveryTimes.push(
      order.timeline.deliveredAt - order.timeline.placedAt
    );
  }

  return {
    averagePreparationTime: getAverage(preparationTimes),
    averageDeliveryTime: getAverage(deliveryTimes),
    averageCompletionTime: getAverage(completionTimes),
  };
}
