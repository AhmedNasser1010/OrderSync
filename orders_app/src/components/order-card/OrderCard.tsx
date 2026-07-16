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

  const handleNavigate = (e: React.MouseEvent<HTMLDivElement>) => {
    const preventedElement = (e.target as HTMLElement).closest(
      ".disabled-click-1"
    );

    if (!preventedElement) {
      router.push(`/order/${order.id}`);
    }
  };

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md border-border"
      onClick={handleNavigate}
    >
      <OrderHeader id={order.id} orderNumber={order.orderNumber} status={order.status} />
      <OrderContent
        total={order.total}
        customer={order.customer}
        items={order.items}
        placedAt={order.placedAt}
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
