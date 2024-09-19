import { OrderType } from "@/types/order";

let highestValueCustomer = { name: "", phone: "", totalOrdersValue: 0 };
export default function getHighestValueCustomer(order: OrderType) {

  // Highest Value Customer
  if (order.customer.totalOrdersValue > highestValueCustomer.totalOrdersValue) {
    highestValueCustomer = {
      name: order.customer.name,
      phone: order.customer.phone,
      totalOrdersValue: order.customer.totalOrdersValue,
    };
  }

  return highestValueCustomer;
}
