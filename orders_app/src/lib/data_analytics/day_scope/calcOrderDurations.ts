import { OrderType } from "@/types/order";
import { OrderDurationsType } from "@/lib/data_analytics/types";
import getAverage from "@/lib/getAverage";

export default function calcOrderDurations(
  order: OrderType
): OrderDurationsType {
  const preparationTimes: number[] = [];
  const deliveryTimes: number[] = [];
  const completionTimes: number[] = [];

  // Calculate order durations
  if (order.orderTimestamps.preparedAt && order.orderTimestamps.placedAt) {
    preparationTimes.push(
      order.orderTimestamps.preparedAt - order.orderTimestamps.placedAt
    );
  }
  if (order.orderTimestamps.completedAt && order.orderTimestamps.preparedAt) {
    completionTimes.push(
      order.orderTimestamps.completedAt - order.orderTimestamps.preparedAt
    );
  }
  if (order.orderTimestamps.completedAt && order.orderTimestamps.placedAt) {
    deliveryTimes.push(
      order.orderTimestamps.completedAt - order.orderTimestamps.placedAt
    );
  }

  return {
    averagePreparationTime: getAverage(preparationTimes),
    averageDeliveryTime: getAverage(deliveryTimes),
    averageCompletionTime: getAverage(completionTimes),
  };
}
