"use client";

import { BadgePercent } from "lucide-react";

const DiscountMsg = ({
  discountMsg,
  discountIncluded,
}: {
  discountMsg?: string | null;
  discountIncluded?: boolean;
}) => {
  if (discountMsg) {
    return (
      <span
        className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-ProximaNovaSemiBold text-xs ${
          discountIncluded
            ? "bg-color-11/10 text-color-11"
            : "bg-color-7/60 text-color-9/65"
        }`}
      >
        <BadgePercent className="size-3.5" />
        {discountMsg}
      </span>
    );
  }
  return null;
};

export default DiscountMsg;
