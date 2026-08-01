"use client";

import { useTranslations } from "next-intl";
import Info from "@/components/Cart/Info";

const OrderInfo = ({
  deliveryFees,
  orderNumber,
}: {
  deliveryFees: number;
  orderNumber?: string;
}) => {
  const t = useTranslations();

  return (
    <div className="order-info text-sm">
      <hr className="border-1 border-dashed border-b-[#d3d3d3] my-4" />
      <div className="flex flex-col gap-2 px-2">
        <Info label={t("Delivery Fees")}>
          <span className="egp text-sm">{deliveryFees}</span>
        </Info>

        {orderNumber && (
          <Info label={t("Invoice No")}>
            <span>#{orderNumber}</span>
          </Info>
        )}
      </div>
      <hr className="border-1 border-dashed border-b-[#d3d3d3] my-4" />
    </div>
  );
};

export default OrderInfo;
