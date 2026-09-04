"use client";

import { ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const CartEmptyState = () => {
  const t = useTranslations();

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-5 py-10 text-center">
      <div className="grid size-28 place-items-center rounded-full bg-color-7/60">
        <ShoppingCart className="size-12 text-color-5" strokeWidth={1.5} />
      </div>
      <h2 className="mt-6 text-2xl font-ProximaNovaSemiBold text-color-1">
        {t("Your cart is empty")}
      </h2>
      <p className="mt-2 text-sm font-ProximaNovaThin text-color-8">
        {t("You can go to home page to view more restaurants")}
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-color-2 px-8 py-3 font-ProximaNovaSemiBold text-sm uppercase tracking-wide text-white transition-colors hover:bg-color-2/90"
      >
        {t("see restaurants near you")}
      </Link>
    </div>
  );
};

export default CartEmptyState;
