"use client";

import { Banknote, CreditCard, Check } from "lucide-react";
import { useTranslations } from "next-intl";

const PaymentMethod = () => {
  const t = useTranslations();

  return (
    <div className="rounded-2xl border border-color-7 bg-card p-5 sm:p-6">
      <h3 className="font-ProximaNovaBold text-lg text-color-1">
        {t("Payment Method")}
      </h3>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-color-2/40 bg-color-2/10 p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-color-2 text-white">
              <Banknote className="size-4" />
            </span>
            <div>
              <p className="font-ProximaNovaSemiBold text-sm text-color-1">
                {t("Cash on Delivery")}
              </p>
              <p className="text-xs font-ProximaNovaThin text-color-8">
                {t("payToDeliveryCaptain")}
              </p>
            </div>
          </div>
          <span className="grid size-5 shrink-0 place-items-center rounded-full bg-color-2 text-white">
            <Check className="size-3" />
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-xl border border-color-7 bg-color-7/30 p-4 opacity-60">
          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-color-5 text-white">
              <CreditCard className="size-4" />
            </span>
            <div>
              <p className="font-ProximaNovaSemiBold text-sm text-color-1">
                {t("Online Payment")}
              </p>
              <p className="text-xs font-ProximaNovaThin text-color-8">
                {t("Online Payment Coming Soon")}
              </p>
            </div>
          </div>
          <span
            aria-hidden="true"
            className="rounded-full bg-color-5 px-2.5 py-1 text-[10px] font-ProximaNovaSemiBold uppercase tracking-wide text-white"
          >
            {t("Soon")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethod;
