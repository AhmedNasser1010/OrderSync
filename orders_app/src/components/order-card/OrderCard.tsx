import { Card } from "@/components/ui/card";
import { FormattedOrderType } from "@/types/order";
import { MainTabTypes } from "@/types/components";
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
      className={`cursor-pointer transition-shadow hover:shadow-md border-border ${
        order.accepted ? "" : "bg-green-100 dark:bg-green-900"
      }`}
      onClick={handleNavigate}
    >
      <OrderHeader id={order.id} status={order.status} />
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
