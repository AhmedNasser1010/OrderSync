"use client";

import { useMemo, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { CircleAlertIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import { addCheckout } from "@/rtk/slices/checkoutSlice";
import { applyOrderDiscount, removeOrderDiscount } from "@/rtk/slices/cartSlice";
import { calculateDiscountAmount, priceAfterDiscount, resolveItemDiscount } from "@ordersync/order-utils";
import usePlace from "@/hooks/usePlace";
import { useClickGuard } from "@/hooks/useClickGuard";
import Divider from "@/components/Checkout/Divider";
import Tip from "@/components/Checkout/Tip";
import CheckoutMainButton from "@/components/Checkout/CheckoutMainButton";
import CheckoutPageTitle from "@/components/Checkout/CheckoutPageTitle";
import type { DiscountObject } from "@ordersync/types";

const RadioInputWrapper = ({
  htmlFor,
  selected,
  disabled,
  children,
}: {
  htmlFor: string;
  selected: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) => (
  <label
    htmlFor={htmlFor}
    className="flex flex-col items-center gap-4 border border-input rounded-[6px] py-8 w-[calc(100%/2-10px)] cursor-pointer transition-colors"
    style={{
      borderColor: selected ? "blue" : undefined,
      opacity: disabled ? 0.55 : undefined,
      cursor: disabled ? "not-allowed" : "pointer",
    }}
  >
    {children}
  </label>
);

const CheckoutUserPayment = ({
  handleCurrentState,
  deliveryFees,
}: {
  handleCurrentState: (status: string) => void;
  deliveryFees: number;
}) => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const { placeOrder } = usePlace();

  const cartItems = useAppSelector((state) => state.cart.items);
  const accessToken = useAppSelector((state) => state.cart.restaurant);
  const menuItems = useAppSelector((state) => state.menu.items);
  const categories = useAppSelector((state) => state.menu.categories);
  const orderDiscounts = useAppSelector(
    (state) => state.menu.orderDiscounts || []
  );
  const appliedOrderDiscount = useAppSelector(
    (state) => state.cart.appliedOrderDiscount
  ) as DiscountObject | null;
  const user = useAppSelector((state) => state.user);
  const checkout = useAppSelector((state) => state.checkout);

  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [buttonIsDisable, setButtonIsDisable] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  // Ref-based in-flight guard so duplicate "Place Order" clicks are dropped
  // even before React commits the disabled state.
  const placeOrderPendingRef = useRef(false);

  const totals = useMemo(() => {
    let total = 0;
    let totalWithDiscount = 0;

    cartItems?.forEach((cartItem) => {
      const menuItem = menuItems?.find((mi) => mi.id === cartItem.id);
      if (!menuItem) return;
      const sizePrice = cartItem.selectedSize
        ? menuItem.sizes?.find((s) => s.size === cartItem.selectedSize)?.price
        : undefined;
      const price = Number(sizePrice ?? menuItem.price);
      const subtotal = price * cartItem.quantity;
      const category = categories?.find((cat) => cat.id === menuItem.category);
      const effectiveDiscount = resolveItemDiscount(menuItem, category);
      const subTotalDiscounted = effectiveDiscount
        ? priceAfterDiscount(price, effectiveDiscount, user, accessToken)
            .finalPrice * cartItem.quantity
        : subtotal;
      total += subtotal;
      totalWithDiscount += subTotalDiscounted;
    });

    let finalTotal = totalWithDiscount + deliveryFees;
    if (appliedOrderDiscount) {
      const orderDiscountAmount = calculateDiscountAmount(
        totalWithDiscount,
        appliedOrderDiscount
      );
      finalTotal =
        Math.max(0, totalWithDiscount - orderDiscountAmount) + deliveryFees;
    }

    return { total: total + deliveryFees, totalWithDiscount: finalTotal };
  }, [
    cartItems,
    menuItems,
    categories,
    user,
    accessToken,
    deliveryFees,
    appliedOrderDiscount,
  ]);

  const handleOnRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentMethod(e.target.value);
    dispatch(addCheckout({ payment: { method: e.target.value } }));
  };

  const handlePlaceOrder = () => {
    if (placeOrderPendingRef.current) return;
    placeOrderPendingRef.current = true;
    setButtonIsDisable(true);
    placeOrder(checkout?.comment as string)
      .then((placed) => {
        if (!placed) {
          placeOrderPendingRef.current = false;
          setButtonIsDisable(false);
          return;
        }
      })
      .catch(() => {
        placeOrderPendingRef.current = false;
        setButtonIsDisable(false);
      });
  };

  const handleApplyPromoCode = () => {
    setPromoError("");
    setPromoSuccess("");

    if (!promoCodeInput.trim()) {
      setPromoError("Please enter a promo code");
      return;
    }

    const code = promoCodeInput.trim().toUpperCase();
    const foundDiscount = orderDiscounts.find(
      (d) => d.code.toUpperCase() === code && d.active
    );

    if (!foundDiscount) {
      setPromoError("Invalid promo code");
      return;
    }

    if (foundDiscount.expireAt && Date.now() > foundDiscount.expireAt) {
      setPromoError("This promo code has expired");
      return;
    }

    if (foundDiscount.startAt && Date.now() < foundDiscount.startAt) {
      setPromoError("This promo code is not active yet");
      return;
    }

    if (
      foundDiscount.usageLimit != null &&
      foundDiscount.usageCount &&
      foundDiscount.usageCount >= foundDiscount.usageLimit
    ) {
      setPromoError("This promo code has reached its usage limit");
      return;
    }

    const cartSubtotal =
      cartItems?.reduce((sum, cartItem) => {
        const menuItem = menuItems?.find((mi) => mi.id === cartItem.id);
        return sum + (menuItem?.price || 0) * cartItem.quantity;
      }, 0) || 0;

    if (
      foundDiscount.minOrderTotal &&
      cartSubtotal < foundDiscount.minOrderTotal
    ) {
      setPromoError(`Minimum order total is ${foundDiscount.minOrderTotal}LE`);
      return;
    }

    if (foundDiscount.minCartItems) {
      const totalItems =
        cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      if (totalItems < foundDiscount.minCartItems) {
        setPromoError(`Minimum ${foundDiscount.minCartItems} items required`);
        return;
      }
    }

    dispatch(
      applyOrderDiscount(
        foundDiscount as unknown as Record<string, unknown>
      )
    );
    setPromoSuccess(`Code "${foundDiscount.code}" applied! ${foundDiscount.message}`);
    setPromoCodeInput("");
  };

  const handleRemovePromoCode = () => {
    dispatch(removeOrderDiscount());
    setPromoSuccess("");
    setPromoError("");
  };

  // Guard the promo-code Apply/Remove buttons against rapid repeated dispatches.
  const { run: runApplyPromoCode } = useClickGuard(handleApplyPromoCode, {
    cooldown: 500,
  });
  const { run: runRemovePromoCode } = useClickGuard(handleRemovePromoCode, {
    cooldown: 500,
  });

  return (
    <div>
      <CheckoutPageTitle title={t("Payment")} />
      <div className="flex row-gap-4 flex-wrap justify-between select-none my-8">
        <RadioInputWrapper htmlFor="cash" selected={paymentMethod === "CASH"}>
          <input
            id="cash"
            type="radio"
            name="cash"
            value="CASH"
            checked={paymentMethod === "CASH"}
            onChange={handleOnRadioChange}
          />
          <span className="text-[22px] font-light">{t("Cash Payment")}</span>
          <p className="text-[13px] w-4/5 text-center text-color-8">
            {t("payToDeliveryCaptain")}
          </p>
        </RadioInputWrapper>
        <RadioInputWrapper
          htmlFor="visa"
          selected={paymentMethod === "ONLINE"}
          disabled
        >
          <input
            id="visa"
            type="radio"
            name="visa"
            value="ONLINE"
            disabled
            checked={paymentMethod === "ONLINE"}
            onChange={handleOnRadioChange}
          />
          <span className="text-[22px] font-light">{t("Online Payment")}</span>
          <p className="text-[13px] w-4/5 text-center text-color-8">
            {t("Online Payment Coming Soon")}
          </p>
        </RadioInputWrapper>
      </div>
      <Divider />
      <Tip
        message={`${t("Delivery Tax Will Be Included")} ${deliveryFees}LE + ${t(
          "Total Price"
        )}`}
        icon={<CircleAlertIcon className="size-5" />}
      />
      {!appliedOrderDiscount && (
        <div className="flex gap-2 items-center my-4">
          <input
            type="text"
            value={promoCodeInput}
            onChange={(e) => setPromoCodeInput(e.target.value)}
            placeholder={t("Enter promo code")}
            onKeyDown={(e) => e.key === "Enter" && handleApplyPromoCode()}
            className="flex-1 px-3 py-2.5 border border-input rounded-[6px] text-sm uppercase tracking-wider focus:outline-none focus:border-[#2196F3]"
          />
          <button
            onClick={() => void runApplyPromoCode()}
            className="px-4 py-2.5 bg-[#4CAF50] text-white border-0 rounded-[6px] text-sm font-semibold cursor-pointer whitespace-nowrap hover:brightness-95"
          >
            {t("Apply")}
          </button>
        </div>
      )}
      {appliedOrderDiscount && (
        <div className="flex gap-2 items-center my-4">
          <input
            type="text"
            value={appliedOrderDiscount.code}
            disabled
            className="flex-1 px-3 py-2.5 border border-input rounded-[6px] text-sm uppercase tracking-wider bg-muted text-[#4CAF50] font-semibold"
          />
          <button
            onClick={() => void runRemovePromoCode()}
            className="px-4 py-2.5 bg-[#F44336] text-white border-0 rounded-[6px] text-sm font-semibold cursor-pointer whitespace-nowrap hover:brightness-95"
          >
            {t("Remove")}
          </button>
        </div>
      )}
      {promoError && (
        <p className="text-xs text-[#F44336] mt-1">{promoError}</p>
      )}
      {promoSuccess && <p className="text-xs text-[#4CAF50] mt-1">{promoSuccess}</p>}
      <h3 className="flex items-center justify-between text-[35px] font-black tracking-[2px] mb-[50px] text-center">
        <span>{t("Total")}</span>
        {!totals.totalWithDiscount && <span>{totals.total}LE</span>}
        {totals.totalWithDiscount && (
          <span>
            <span className="text-[20px] mr-[10px] text-[#F44336]">
              {totals.total}LE
            </span>
            <span className="text-color-11 bg-transparent">
              {totals.totalWithDiscount}LE
            </span>
          </span>
        )}
      </h3>
      <Divider />
      <CheckoutMainButton
        nextLabel={t("Place Order")}
        backLabel={t("Back To Address")}
        nextBtnIsDisable={buttonIsDisable}
        nextEventCallback={handlePlaceOrder}
        backEventCallback={() => handleCurrentState("ON_USER_ADDRESS")}
      />
    </div>
  );
};

export default CheckoutUserPayment;
