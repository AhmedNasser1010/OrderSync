import { OrderType } from "@/types/order";
import { OrderSourcesType } from "@/lib/data_analytics/types";

export default function getOrderSources(order: OrderType) {
  let orderSources: OrderSourcesType = {};
  
  // Order Sources
  if (!orderSources[order.orderSource]) {
    orderSources[order.orderSource] = 0;
  }
  orderSources[order.orderSource]++;

  return orderSources
}
