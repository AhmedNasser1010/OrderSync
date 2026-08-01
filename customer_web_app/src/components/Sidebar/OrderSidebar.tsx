"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { XCircleIcon } from "lucide-react";
import {
  SendIcon,
  CheckCircleIcon,
  CheckCheckIcon,
  CookingPotIcon,
  BikeIcon,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import { toggleOrderSidebar } from "@/rtk/slices/toggleSlice";
import { cn } from "@/lib/utils";
import useOrder from "@/hooks/useOrder";
import { useDriverLocation } from "@/hooks/useDriverLocation";
import type { RestaurantDocument } from "@/types/restaurant";

const OrderTrackingMap = dynamic(
  () => import("@/components/Sidebar/OrderTrackingMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] rounded-xl bg-color-7/30 animate-pulse" />
    ),
  }
);

const STEPS = [
  { key: "placed", statuses: ["RECEIVED"], icon: SendIcon, label: "Placed", sublabel: "Order placed successfully" },
  { key: "confirmed", statuses: ["ACCEPTED"], icon: CheckCircleIcon, label: "Confirmed", sublabel: "Restaurant accepted" },
  { key: "preparing", statuses: ["PREPARING"], icon: CookingPotIcon, label: "Preparing", sublabel: "Being prepared" },
  { key: "ontheway", statuses: ["READY", "RESERVED", "PICKED_UP", "ON_ROUTE"], icon: BikeIcon, label: "On the Way", sublabel: "On its way to you" },
  { key: "delivered", statuses: ["DELIVERED", "GIVEN_FEEDBACK"], icon: CheckCheckIcon, label: "Delivered", sublabel: "Arrived at your door" },
];

const ERROR_STATUSES = ["CANCELED", "REJECTED", "VOIDED"];

function StepIndicator({
  step,
  index,
  currentStepIndex,
  totalSteps,
}: {
  step: (typeof STEPS)[number];
  index: number;
  currentStepIndex: number;
  totalSteps: number;
}) {
  const t = useTranslations();
  const isCompleted = index < currentStepIndex;
  const isActive = index === currentStepIndex;
  const isPending = index > currentStepIndex;
  const isLast = index === totalSteps - 1;
  const Icon = step.icon;

  return (
    <div className="flex items-stretch gap-3">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "relative flex items-center justify-center rounded-full transition-all duration-500",
            isCompleted && "w-7 h-7 bg-color-11",
            isActive && "w-8 h-8 bg-color-2 order-pulse",
            isPending && "w-7 h-7 border-2 border-color-7 bg-white"
          )}
        >
          {isCompleted && <CheckCheckIcon className="text-white text-sm" />}
          {isActive && <Icon className="text-white text-sm" />}
          {isPending && <Icon className="text-color-7 text-xs" />}
        </div>
        {!isLast && (
          <div
            className={cn(
              "w-0.5 flex-1 min-h-[32px] transition-all duration-500",
              isCompleted && "bg-color-11",
              isActive && "bg-gradient-to-b from-color-2 to-color-7",
              isPending && "bg-color-7 opacity-40"
            )}
          />
        )}
      </div>

      <div className={`pb-6 ${isLast ? "pb-0" : ""}`}>
        <p
          className={cn(
            "text-sm leading-tight transition-all duration-300",
            isCompleted && "text-color-1 font-ProximaNovaSemiBold",
            isActive && "text-color-2 font-ProximaNovaBold text-base",
            isPending && "text-color-5 font-ProximaNovaMed"
          )}
        >
          {t(step.label)}
        </p>
        {(isCompleted || isActive) && (
          <p className="text-xs text-color-5 font-ProximaNovaThin mt-0.5 leading-tight">
            {t(step.sublabel)}
          </p>
        )}
      </div>
    </div>
  );
}

function ErrorBanner({
  status,
  reason,
}: {
  status: string | undefined;
  reason?: string;
}) {
  const t = useTranslations();
  const labels: Record<string, string> = {
    CANCELED: "Order Canceled",
    REJECTED: "Order Rejected",
    VOIDED: "Order Voided",
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
      <p className="text-red-600 font-ProximaNovaSemiBold text-sm">
        {t(labels[status || ""] || "Order Ended")}
      </p>
      {reason && (
        <p className="text-red-400 font-ProximaNovaThin text-xs mt-1">
          {t(reason)}
        </p>
      )}
    </div>
  );
}

const OrderSidebar = () => {
  const dispatch = useAppDispatch();
  const locale = useLocale();
  const t = useTranslations();
  const user = useAppSelector((state) => state.user);
  const isOrderSidebarOpen = useAppSelector(
    (state) => state.toggle.isOrderSidebarOpen
  );
  const restaurants = useAppSelector((state) => state.restaurants);
  const currentRes = restaurants?.find(
    (res) => res.accessToken === user.trackedOrder?.restaurant
  ) as RestaurantDocument | undefined;
  const { cancelOrder, trackedOrderData } = useOrder();
  const defaultCenter: [number, number] = [29.620106778124843, 31.255811811669496];
  const liveLocation = useDriverLocation(
    trackedOrderData?.assignment?.driverUid,
    trackedOrderData?.status?.current
  );
  const driverLocation: [number, number] | null = liveLocation
    ? [liveLocation.lat, liveLocation.lng]
    : null;
  const mapPoints: ([number, number] | null)[] = [
    (currentRes?.profile?.latlng as [number, number] | undefined) ?? null,
    (trackedOrderData?.delivery?.latlng as [number, number] | undefined) ?? null,
    driverLocation,
  ];

  const currentStatus = trackedOrderData?.status?.current;

  const currentStepIndex = useMemo(() => {
    if (!currentStatus) return 0;
    const idx = STEPS.findIndex((step) => step.statuses.includes(currentStatus));
    return idx >= 0 ? idx : 0;
  }, [currentStatus]);

  const isError = ERROR_STATUSES.includes(currentStatus ?? "");
  const isMapLive = ["READY", "RESERVED", "PICKED_UP", "ON_ROUTE"].includes(
    currentStatus ?? ""
  );
  const isRTL = locale === "ar";

  const handleCloseSidebar = () => {
    dispatch(toggleOrderSidebar());
    document.body.classList.remove("overflow-hidden");
  };

  return (
    <>
      <div
        className={cn(
          "order-sidebar fixed top-0 h-full overflow-y-scroll bg-white transition-all duration-500 z-40 px-5 py-5 w-full sm:py-10 flex flex-col sm:w-[500px]",
          isRTL ? "left-0" : "right-0",
          isOrderSidebarOpen
            ? "translate-x-0"
            : isRTL
              ? "-translate-x-full"
              : "translate-x-full"
        )}
      >
        <button className="text-3xl mb-5" onClick={handleCloseSidebar}>
          <XCircleIcon className="size-7" />
        </button>

        <h2 className="text-color-1 text-3xl font-ProximaNovaMed text-center mb-5">
          {t("Order Tracking")}
        </h2>

        {isError && trackedOrderData && (
          <ErrorBanner
            status={currentStatus}
            reason={trackedOrderData?.status?.cancellationReason}
          />
        )}

        {!isError && (
          <div className="mb-5 px-1">
            {STEPS.map((step, index) => (
              <StepIndicator
                key={step.key}
                step={step}
                index={index}
                currentStepIndex={currentStepIndex}
                totalSteps={STEPS.length}
              />
            ))}
          </div>
        )}

        <div className="relative mb-4">
          <OrderTrackingMap
            center={
              (user?.locations?.home?.latlng as [number, number]) ||
              defaultCenter
            }
            mapPoints={mapPoints}
            isMapLive={isMapLive}
            restaurant={currentRes}
            deliveryLatlng={
              (trackedOrderData?.delivery?.latlng as
                | [number, number]
                | undefined) ?? null
            }
            driverLocation={driverLocation}
          />
          {!isMapLive && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-md">
                <p className="text-color-1 font-ProximaNovaSemiBold text-sm text-center">
                  {t("Live tracking available soon")}
                </p>
                <p className="text-color-5 font-ProximaNovaThin text-xs text-center mt-0.5">
                  {t("You'll see your driver in real time")}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex relative mt-10 mb-10">
          {currentStatus === "RECEIVED" ? (
            <button
              onClick={cancelOrder}
              className="w-full py-4 uppercase text-base text-white font-ProximaNovaSemiBold cursor-pointer bg-red-500 rounded-xl"
            >
              {t("Order Cancel")}
            </button>
          ) : (
            <button className="w-full py-4 uppercase text-base text-white font-ProximaNovaSemiBold cursor-pointer bg-color-5 rounded-xl">
              {t("Cancellations and modifications")}
              <br />
              {currentRes?.business?.contactNumbers &&
                currentRes.business.contactNumbers[0].slice(2)}
            </button>
          )}
        </div>
      </div>

      <div
        className={cn(
          "order-sidebar-overlay z-30 top-0 left-0 right-0 bottom-0 bg-color-1 opacity-[0.7] overflow-hidden",
          isOrderSidebarOpen ? "fixed" : "hidden"
        )}
        onClick={handleCloseSidebar}
      ></div>
    </>
  );
};

export default OrderSidebar;
