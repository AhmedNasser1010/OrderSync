import { Card } from "@/components/ui/card";
import type { FormattedOrderType, MainTabTypes } from "@/types/orders";
import { useRouter } from "@/i18n/routing";
import OrderHeader from "./OrderHeader";
import OrderContent from "./OrderContent";
import OrderFooter from "./OrderFooter";
import useOrderUrgency from "@/hooks/useOrderUrgency";
import { cn } from "@/lib/utils";

const URGENCY_STYLES: Record<string, string> = {
  normal: "",
  warning: "border-amber-300 dark:border-amber-600 shadow-amber-200/50 dark:shadow-amber-900/30",
  critical: "border-red-400 dark:border-red-600 shadow-red-200/50 dark:shadow-red-900/30 animate-pulse",
};

const OrderCard = ({
  order,
  activeTabValue,
}: {
  order: FormattedOrderType;
  activeTabValue: MainTabTypes;
}) => {
  const router = useRouter();
  const isPreparing = order.status === "ACCEPTED" || order.status === "PREPARING";
  const urgency = useOrderUrgency(order.placedAt, isPreparing ? order.preparingAt : undefined);

  const handleCardClick = () => {
    router.push(`/order/${order.id}`);
  };

  const showUrgency = activeTabValue === "RECEIVED" || activeTabValue === "PREPARING";
  const urgencyClass = showUrgency ? urgency : "normal";

  return (
    <Card
      className={cn(
        "cursor-pointer transition-shadow hover:shadow-md border-border",
        URGENCY_STYLES[urgencyClass]
      )}
      onClick={handleCardClick}
    >
      <OrderHeader
        orderNumber={order.orderNumber}
        status={order.status}
        placedAt={order.placedAt}
        isFirstOrder={order.isFirstOrder}
      />
      <OrderContent
        total={order.total}
        customer={order.customer}
        items={order.items}
      />
      <OrderFooter
        id={order.id}
        activeTabValue={activeTabValue}
        status={order.status}
      />
    </Card>
  );
};

export default OrderCard;
