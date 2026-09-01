"use client";

import { useTranslations } from "next-intl";
import { Wallet } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import { useFetchWalletBalanceQuery } from "@/rtk/api/firestoreApi";
import { addCheckout } from "@/rtk/slices/checkoutSlice";

const WalletRedemption = ({ maxAmount = 0 }: { maxAmount?: number }) => {
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
  const hasApplicableCredit = balance > 0 && maxAmount > 0;

  const clampedAmount = Math.min(
    Math.max(Math.round(Number(walletRedeemed) || 0), 0),
    maxAmount
  );

  const applyWallet = (apply: boolean, amount?: number) => {
    dispatch(
      addCheckout({
        useWallet: apply,
        walletRedeemed: apply ? amount ?? maxAmount : 0,
      })
    );
  };

  const setAmount = (amount: number) => {
    const clamped = Math.min(Math.max(Math.round(amount) || 0, 0), maxAmount);
    applyWallet(clamped > 0, clamped);
  };

  if (!hasApplicableCredit) return null;

  return (
    <div className="rounded-2xl border border-color-7 bg-card p-5 sm:p-6">
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

      <div
        className={`mt-4 rounded-xl border transition-colors ${
          useWallet
            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950"
            : "border-color-7 bg-color-7/30"
        }`}
      >
        <label className="block cursor-pointer select-none p-4">
          <input
            type="checkbox"
            className="peer sr-only"
            checked={useWallet}
            onChange={(e) => applyWallet(e.target.checked)}
          />
          <div className="flex items-center justify-between">
            <span className="font-ProximaNovaSemiBold text-sm text-color-1">
              {t("Apply to order")}
            </span>
            <span className="font-ProximaNovaBold text-sm text-emerald-600">
              {useWallet ? `-${clampedAmount} ${t("EGP")}` : `-${maxAmount} ${t("EGP")}`}
            </span>
          </div>
        </label>

        {useWallet && (
          <div className="space-y-3 border-t border-emerald-200 px-4 pb-4 pt-3 dark:border-emerald-800">
            <input
              type="range"
              min={0}
              max={maxAmount}
              step={1}
              value={clampedAmount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full accent-emerald-600"
              aria-label={t("Amount to spend")}
            />
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setAmount(Math.max(0, clampedAmount - 10))}
                className="font-ProximaNovaSemiBold text-xs text-color-8"
              >
                −10
              </button>
              <input
                type="number"
                min={0}
                max={maxAmount}
                step={1}
                value={clampedAmount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-20 rounded-lg border border-color-7 bg-card px-2 py-1 text-center font-ProximaNovaBold text-sm text-color-1"
                aria-label={t("Amount to spend")}
              />
              <button
                type="button"
                onClick={() => setAmount(Math.min(maxAmount, clampedAmount + 10))}
                className="font-ProximaNovaSemiBold text-xs text-color-8"
              >
                +10
              </button>
            </div>
            <div className="flex items-center justify-between text-xs font-ProximaNovaThin text-color-8">
              <span>0 {t("EGP")}</span>
              <span>{maxAmount} {t("EGP")}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletRedemption;
