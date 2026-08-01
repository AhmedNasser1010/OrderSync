"use client";

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
        className={`text-sm font-ProximaNovaMed block ${
          discountIncluded ? "text-color-2" : "text-[#3e4152a1]"
        } mt-2`}
      >
        {discountMsg}
      </span>
    );
  }
  return null;
};

export default DiscountMsg;
