import { OrderType } from "@/types/order";
import { OrderSourcesType } from "@/analytics/types";

export default function getOrderSources(order: OrderType) {
  const orderSources: OrderSourcesType = {};
  
  // Order Sources
  if (!orderSources[order.orderSource]) {
    orderSources[order.orderSource] = 0;
  }
  orderSources[order.orderSource]++;

  return orderSources
}
