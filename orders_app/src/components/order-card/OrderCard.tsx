import { Card } from "@/components/ui/card";
import type { FormattedOrderType, MainTabTypes } from "@/types/orders";
import { useRouter } from "next/navigation";
import OrderHeader from "./OrderHeader";
import OrderContent from "./OrderContent";
import OrderFooter from "./OrderFooter";

const OrderCard = ({
  order,
  activeTabValue,
}: {
  order: FormattedOrderType;
  activeTabValue: MainTabTypes;
}) => {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/order/${order.id}`);
  };

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md border-border"
      onClick={handleCardClick}
    >
      <OrderHeader
        orderNumber={order.orderNumber}
        status={order.status}
        placedAt={order.placedAt}
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
