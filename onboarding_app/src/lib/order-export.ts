import type { OrderType } from "@ordersync/types";
import type { ExportColumn } from "@/lib/export-utils";
import {
  ORDER_STATUS_CONFIG,
  formatCurrency,
  formatOrderDate,
} from "@/components/dashboard/OrderLookupTable";

export const ORDER_EXPORT_COLUMNS: ExportColumn[] = [
  { header: "Order Number", accessor: "orderNumber" },
  { header: "Status", accessor: "statusLabel" },
  { header: "Customer Name", accessor: "customer.name" },
  { header: "Customer Phone", accessor: "customer.phone" },
  { header: "Restaurant Name", accessor: "business.name" },
  { header: "Restaurant Phone", accessor: "business.phone" },
  { header: "Restaurant ID", accessor: "businessId" },
  { header: "Payment Method", accessor: "payment.method" },
  { header: "Payment Status", accessor: "payment.status" },
  { header: "Subtotal", accessor: "pricing.subtotal" },
  { header: "Discount", accessor: "pricing.discount" },
  { header: "Delivery Fees", accessor: "pricing.deliveryFees" },
  { header: "Total", accessor: "pricing.total" },
  { header: "Commission", accessor: "finance.commissionAmount" },
  { header: "Restaurant Net", accessor: "finance.restaurantShare" },
  { header: "Driver Earnings", accessor: "finance.driverEarnings" },
  { header: "Cash Collected", accessor: "finance.cashCollected" },
  { header: "Wallet Redeemed", accessor: "pricing.walletRedeemed" },
  { header: "Cashback Earned", accessor: "pricing.cashbackEarned" },
  { header: "Created At", accessor: "createdAt" },
];

export function flattenOrderForExport(
  order: OrderType,
): Record<string, unknown> {
  return {
    ...order,
    statusLabel: order.status?.current
      ? (ORDER_STATUS_CONFIG[order.status.current]?.label ??
        order.status.current)
      : "",
    "customer.name": order.customer?.name || "",
    "customer.phone": order.customer?.phone || "",
    "business.name": order.business?.name || order.businessId || "",
    "business.phone": order.business?.phone || "",
    "payment.method": order.payment?.method || "",
    "payment.status": order.payment?.status || "",
    "pricing.subtotal": order.pricing?.subtotal ?? 0,
    "pricing.discount": order.pricing?.discount ?? 0,
    "pricing.deliveryFees": order.pricing?.deliveryFees ?? 0,
    "pricing.total": order.pricing?.total ?? 0,
    "finance.commissionAmount": order.finance?.commissionAmount ?? 0,
    "finance.restaurantShare": order.finance?.restaurantShare ?? 0,
    "finance.driverEarnings": order.finance?.driverEarnings ?? 0,
    "finance.cashCollected": order.finance?.cashCollected ?? 0,
    "pricing.walletRedeemed": order.pricing?.walletRedeemed ?? 0,
    "pricing.cashbackEarned": order.pricing?.cashbackEarned ?? 0,
  };
}

const TIMELINE_LABELS: Record<string, string> = {
  placedAt: "Placed At",
  acceptedAt: "Accepted At",
  preparingAt: "Preparing At",
  readyAt: "Ready At",
  reservedAt: "Reserved At",
  pickedUpAt: "Picked Up At",
  onRouteAt: "On Route At",
  deliveredAt: "Delivered At",
  feedbackAt: "Feedback At",
  canceledAt: "Canceled At",
  rejectedAt: "Rejected At",
  voidedAt: "Voided At",
};

export const ORDER_DETAIL_COLUMNS: ExportColumn[] = [
  { header: "Section", accessor: "section" },
  { header: "Field", accessor: "field" },
  { header: "Value", accessor: "value" },
];

export function buildOrderDetailRows(
  order: OrderType,
): Record<string, unknown>[] {
  const rows: { section: string; field: string; value: string }[] = [];
  const push = (section: string, field: string, value?: unknown) => {
    if (value === null || value === undefined) return;
    rows.push({ section, field, value: String(value) });
  };

  const statusLabel = order.status?.current
    ? (ORDER_STATUS_CONFIG[order.status.current]?.label ?? order.status.current)
    : "";

  push("General", "Order Number", `#${order.orderNumber}`);
  push("General", "Status", statusLabel);
  push("General", "Order ID", order.id);
  push("Cancellation Reason", "Reason", order.status?.cancellationReason);

  push("Customer", "Name", order.customer?.name);
  push("Customer", "Phone", order.customer?.phone);
  push("Customer", "Second Phone", order.customer?.secondPhone);
  push("Customer", "Customer UID", order.customerUid);
  if (order.customer?.firstOrderDate) {
    push("Customer", "First Order", formatOrderDate(order.customer.firstOrderDate));
  }
  push("Customer", "Lifetime Orders", order.customer?.totalOrders ?? 0);
  push(
    "Customer",
    "Lifetime Value",
    formatCurrency(order.customer?.totalOrdersValue ?? 0),
  );

  push("Restaurant", "Name", order.business?.name || order.businessId);
  push("Restaurant", "Name (AR)", order.business?.nameInAr);
  push("Restaurant", "Phone", order.business?.phone);
  push("Restaurant", "Address", order.business?.address);
  push("Restaurant", "Business ID", order.businessId);

  push("Delivery", "Address", order.delivery?.address);
  push("Delivery", "Note", order.delivery?.note);
  if (order.delivery?.latlng) {
    push(
      "Delivery",
      "Coordinates",
      `${order.delivery.latlng[0]}, ${order.delivery.latlng[1]}`,
    );
  }

  push(
    "Assignment & Payment",
    "Driver UID",
    order.assignment?.driverUid || "Unassigned",
  );
  if (order.assignment?.reservedUntil) {
    push(
      "Assignment & Payment",
      "Reserved Until",
      formatOrderDate(order.assignment.reservedUntil),
    );
  }
  push("Assignment & Payment", "Payment Method", order.payment?.method);
  push("Assignment & Payment", "Payment Status", order.payment?.status);
  push("Assignment & Payment", "Order Source", order.metadata?.orderSource);

  push("Pricing", "Subtotal", formatCurrency(order.pricing?.subtotal ?? 0));
  push("Pricing", "Discount", formatCurrency(order.pricing?.discount ?? 0));
  push(
    "Pricing",
    "Delivery Fees",
    formatCurrency(order.pricing?.deliveryFees ?? 0),
  );
  push("Pricing", "Total", formatCurrency(order.pricing?.total ?? 0));

  push(
    "Finance",
    `Commission (${order.finance?.commissionPercent ?? 0}%)`,
    formatCurrency(order.finance?.commissionAmount ?? 0),
  );
  push(
    "Finance",
    "Restaurant Share",
    formatCurrency(order.finance?.restaurantShare ?? 0),
  );
  push(
    "Finance",
    "Company Share",
    formatCurrency(order.finance?.companyShare ?? 0),
  );
  push(
    "Finance",
    "Cash Collected",
    formatCurrency(order.finance?.cashCollected ?? 0),
  );
  push(
    "Finance",
    "Driver Earnings",
    formatCurrency(order.finance?.driverEarnings ?? 0),
  );
  push(
    "Finance",
    "Wallet Redeemed",
    formatCurrency(order.pricing?.walletRedeemed ?? 0),
  );
  push(
    "Finance",
    "Cashback Earned",
    formatCurrency(order.pricing?.cashbackEarned ?? 0),
  );

  if (order.cart?.length) {
    order.cart.forEach((item, index) => {
      push(
        "Cart Items",
        `${index + 1}. ${item.name}${
          item.selectedSize ? ` (${item.selectedSize})` : ""
        }`,
        `Qty ${item.quantity}${item.discountCode ? ` · Discount: ${item.discountCode}` : ""}`,
      );
    });
  } else {
    push("Cart Items", "Items", "None");
  }

  const history = [...(order.status?.history ?? [])].reverse();
  if (history.length) {
    history.forEach((entry, index) => {
      push(
        "Status History",
        `${index + 1}. ${
          ORDER_STATUS_CONFIG[entry.status]?.label ?? entry.status
        }`,
        `${formatOrderDate(entry.timestamp)} · by ${entry.by}`,
      );
    });
  } else {
    push("Status History", "History", "None recorded");
  }

  Object.entries(order.timeline ?? {})
    .filter(([, ts]) => typeof ts === "number" && ts > 0)
    .forEach(([key, ts]) => {
      push("Lifecycle Timeline", TIMELINE_LABELS[key] ?? key, formatOrderDate(ts));
    });

  if (order.customerFeedback) {
    push("Customer Feedback", "Rating", `${order.customerFeedback.rating} / 5`);
    push("Customer Feedback", "Comment", order.customerFeedback.comment);
  }

  push("Notes & Metadata", "Order Note", order.notes?.order);
  push("Notes & Metadata", "Created At", formatOrderDate(order.createdAt));
  push("Notes & Metadata", "Updated At", formatOrderDate(order.updatedAt));

  return rows;
}
