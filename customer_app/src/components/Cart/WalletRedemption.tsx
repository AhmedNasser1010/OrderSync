"use client";

import { useTranslations } from "next-intl";
import { Wallet, Check } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import { useFetchWalletBalanceQuery } from "@/rtk/api/firestoreApi";
import { addCheckout } from "@/rtk/slices/checkoutSlice";

const WalletRedemption = () => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const checkout = useAppSelector((state) => state.checkout);
  const uid = user?.uid;

  const { data: balance = 0 } = useFetchWalletBalanceQuery(uid ?? "", {
    skip: !uid,
  });

  const useWallet = checkout?.useWallet === true;
  const walletRedeemed = Number(checkout?.walletRedeemed ?? 0);
  const hasBalance = balance > 0;

  const applyWallet = (apply: boolean, amount?: number) => {
    dispatch(
      addCheckout({
        useWallet: apply,
        walletRedeemed: apply ? amount ?? balance : 0,
      })
    );
  };

  if (!hasBalance) return null;

  return (
    <div className="rounded-2xl border border-color-7 bg-card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-emerald-600 text-white">
            <Wallet className="size-4" />
          </span>
          <div>
            <h3 className="font-ProximaNovaSemiBold text-sm text-color-1">
              {t("Cash Back Wallet")}
            </h3>
            <p className="text-xs font-ProximaNovaThin text-color-8">
              {balance} {t("EGP")} {t("available")}
            </p>
          </div>
        </div>
        <span
          aria-hidden="true"
          className="grid size-5 shrink-0 place-items-center rounded-full bg-emerald-600 text-white"
        >
          {useWallet ? <Check className="size-3" /> : null}
        </span>
      </div>

      <button
        type="button"
        onClick={() => applyWallet(!useWallet)}
        className={`mt-4 flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors cursor-pointer ${
          useWallet
            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950"
            : "border-color-7 bg-color-7/30"
        }`}
      >
        <span className="font-ProximaNovaSemiBold text-sm text-color-1">
          {t("Apply to order")}
        </span>
        <span className="font-ProximaNovaBold text-sm text-emerald-600">
          {useWallet ? `-${walletRedeemed} ${t("EGP")}` : `-${balance} ${t("EGP")}`}
        </span>
      </button>
    </div>
  );
};

export default WalletRedemption;
