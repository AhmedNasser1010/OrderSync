import { OrderType } from "@/types/order";
import { PaymentMethodsType } from "@/lib/data_analytics/types";

export default function getPaymentMethods(order: OrderType) {
  const paymentMethods: PaymentMethodsType = {};

  // Payment Methods
  if (!paymentMethods[order.payment.method]) {
    paymentMethods[order.payment.method] = 0;
  }
  paymentMethods[order.payment.method]++;

  return paymentMethods;
}
