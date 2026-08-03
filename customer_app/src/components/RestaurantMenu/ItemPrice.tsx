"use client";

import { useTranslations } from "next-intl";

const ItemPrice = ({
  price,
  finalPrice,
  discountIncluded,
}: {
  price?: number;
  finalPrice?: number;
  discountIncluded?: boolean;
}) => {
  const t = useTranslations();

  const percentOff =
    discountIncluded && price && price > 0 && finalPrice && finalPrice < price
      ? Math.round((1 - finalPrice / price) * 100)
      : 0;

  if (discountIncluded) {
    return (
      <span className="mt-1.5 flex flex-wrap items-center gap-2">
        <span className="egp text-sm font-ProximaNovaMed text-color-5 line-through decoration-color-8/50">
          {price}
        </span>
        <span className="egp text-base font-ProximaNovaBold text-color-11">
          {finalPrice}
        </span>
        {percentOff > 0 && (
          <span className="rounded-full bg-color-11/10 px-2 py-0.5 font-ProximaNovaBold text-xs text-color-11">
            {percentOff}% {t("OFF")}
          </span>
        )}
      </span>
    );
  }

  return (
    <span className="egp text-sm font-ProximaNovaMed text-color-9">{price}</span>
  );
};

export default ItemPrice;
