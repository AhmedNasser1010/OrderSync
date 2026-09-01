"use client";

import { BadgePercent, MessageSquareText, ReceiptText, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";

const BillRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-center justify-between">
    <span className="font-ProximaNovaMed text-color-6">{label}</span>
    <span className="font-ProximaNovaSemiBold text-color-9">{children}</span>
  </div>
);

const BillDetails = ({
  itemTotal,
  deliveryFees,
  orderDiscount,
  orderDiscountAmount,
  walletRedeemed = 0,
  total,
  savings,
  orderNumber,
  comment,
  disabled,
  onCommentChange,
  children,
}: {
  itemTotal: number;
  deliveryFees: number;
  orderDiscount: {
    message?: string;
    code?: string;
  } | null;
  orderDiscountAmount: number;
  walletRedeemed?: number;
  total: number;
  savings: number;
  orderNumber?: string;
  comment: string;
  disabled?: boolean;
  onCommentChange: (value: string) => void;
  children: React.ReactNode;
}) => {
  const t = useTranslations();

  return (
    <div className="rounded-2xl border border-color-7 bg-card p-5 sm:p-6">
      <h3 className="flex items-center gap-2 font-ProximaNovaBold text-lg text-color-1">
        <ReceiptText className="size-5 text-color-2" />
        {t("Bill Details")}
      </h3>

      <div className="mt-5 space-y-3 text-sm">
        <BillRow label={t("Item Total")}>
          <span className="egp">{itemTotal}</span>
        </BillRow>
        <BillRow label={t("Delivery Fees")}>
          <span className="egp">{deliveryFees}</span>
        </BillRow>
        {orderDiscount && orderDiscountAmount > 0 && (
          <div className="flex items-center justify-between text-color-11">
            <span className="flex items-center gap-1.5 font-ProximaNovaSemiBold">
              <BadgePercent className="size-4" />
              {orderDiscount.message || orderDiscount.code}
            </span>
            <span className="egp">-{orderDiscountAmount}</span>
          </div>
        )}
        {walletRedeemed > 0 && (
          <div className="flex items-center justify-between text-color-11">
            <span className="flex items-center gap-1.5 font-ProximaNovaSemiBold">
              <Wallet className="size-4" />
              {t("Cash Back")}
            </span>
            <span className="egp">-{walletRedeemed}</span>
          </div>
        )}
        {orderNumber && (
          <BillRow label={t("Invoice No")}>
            <span dir="ltr">#{orderNumber}</span>
          </BillRow>
        )}
      </div>

      <hr className="my-4 border-t border-dashed border-color-7" />

      <div className="flex items-center justify-between">
        <span className="font-ProximaNovaBold text-lg text-color-1">
          {t("Total Price")}
        </span>
        <span className="egp font-ProximaNovaBold text-lg text-color-1">
          {total}
        </span>
      </div>

      {savings > 0 && (
        <p className="mt-2 font-ProximaNovaMed text-sm text-color-11">
          {t("You saved")}{" "}
          <span className="egp font-ProximaNovaBold">{savings}</span>
        </p>
      )}

      <div className="relative mt-5">
        <MessageSquareText className="absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-color-5" />
        <input
          type="text"
          id="comment"
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          disabled={disabled}
          placeholder={t("Comment, extras")}
          className="w-full rounded-xl border border-color-7 bg-color-7/30 py-3 ps-10 pe-4 font-ProximaNovaMed text-sm text-color-1 transition-colors placeholder:text-color-5 focus:border-color-2 focus:bg-background focus:ring-2 focus:ring-color-2/20 disabled:opacity-50"
        />
      </div>

      <div className="mt-4">{children}</div>
    </div>
  );
};

export default BillDetails;
