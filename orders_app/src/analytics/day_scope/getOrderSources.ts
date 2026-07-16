import type { OrderType } from '@ordersync/types';
import { OrderSourcesType } from "@/analytics/types";

export default function getOrderSources(order: OrderType) {
  const orderSources: OrderSourcesType = {};
  
  // Order Sources - using metadata.orderSource from the new architecture
  if (!orderSources[order.metadata.orderSource]) {
    orderSources[order.metadata.orderSource] = 0;
  }
  orderSources[order.metadata.orderSource]++;

  return orderSources
}
