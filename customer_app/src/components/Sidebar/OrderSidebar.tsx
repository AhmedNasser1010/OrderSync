"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import {
  XIcon,
  SendIcon,
  CheckCircleIcon,
  CheckCheckIcon,
  CookingPotIcon,
  BikeIcon,
  StoreIcon,
  PhoneIcon,
  ClockIcon,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import { toggleOrderSidebar } from "@/rtk/slices/toggleSlice";
import { cn } from "@/lib/utils";
import useOrder from "@/hooks/useOrder";
import { useDriverLocation } from "@/hooks/useDriverLocation";
import { useEta } from "@/hooks/useEta";
import type { RestaurantDocument } from "@/types/restaurant";

const OrderTrackingMap = dynamic(
  () => import("@/components/Sidebar/OrderTrackingMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-56 sm:h-64 bg-color-7/50 animate-pulse" />
    ),
  }
);

const STEPS = [
  {
    key: "placed",
    statuses: ["RECEIVED"],
    icon: SendIcon,
    label: "Placed",
    sublabel: "Order placed successfully",
    timelineKey: "placedAt",
  },
  {
    key: "confirmed",
    statuses: ["ACCEPTED"],
    icon: CheckCircleIcon,
    label: "Confirmed",
    sublabel: "Restaurant accepted",
    timelineKey: "acceptedAt",
  },
  {
    key: "preparing",
    statuses: ["PREPARING"],
    icon: CookingPotIcon,
    label: "Preparing",
    sublabel: "Currently being prepared",
    timelineKey: "preparingAt",
  },
  {
    key: "ontheway",
    statuses: ["READY", "RESERVED", "PICKED_UP", "ON_ROUTE"],
    icon: BikeIcon,
    label: "On the Way",
    sublabel: "On its way to you",
    timelineKey: null,
  },
  {
    key: "delivered",
    statuses: ["DELIVERED", "GIVEN_FEEDBACK"],
    icon: CheckCheckIcon,
    label: "Delivered",
    sublabel: "Arrived at your door",
    timelineKey: "deliveredAt",
  },
];

const ERROR_STATUSES = ["CANCELED", "REJECTED", "VOIDED"];

function StepIndicator({
  step,
  index,
  currentStepIndex,
  totalSteps,
  timestamp,
  locale,
}: {
  step: (typeof STEPS)[number];
  index: number;
  currentStepIndex: number;
  totalSteps: number;
  timestamp?: number;
  locale: string;
}) {
  const t = useTranslations();
  const isCompleted = index < currentStepIndex;
  const isActive = index === currentStepIndex;
  const isPending = index > currentStepIndex;
  const isLast = index === totalSteps - 1;
  const Icon = step.icon;

  const timeLabel = timestamp
    ? new Date(timestamp).toLocaleTimeString(
        locale === "ar" ? "ar-EG" : "en-US",
        { hour: "2-digit", minute: "2-digit" }
      )
    : "";

  const segmentColor = (seg: number) => {
    if (seg < currentStepIndex) return "bg-color-11";
    if (seg === currentStepIndex)
      return cn(
        "bg-gradient-to-r",
        locale === "ar" && "bg-gradient-to-l",
        "from-color-2 via-color-2/50 to-color-7"
      );
    return "bg-color-7 opacity-60";
  };

  return (
    <div className="flex flex-col items-center flex-1 min-w-0">
      <div className="flex w-full items-center">
        <div
          className={cn(
            "h-0.5 flex-1 rounded-full transition-all duration-500",
            index === 0 ? "bg-transparent" : segmentColor(index - 1)
          )}
        />
        <div
          className={cn(
            "relative flex items-center justify-center rounded-full shrink-0 z-10 transition-all duration-500",
            isCompleted && "size-7 bg-color-11",
            isActive && "size-8 bg-color-2 order-pulse",
            isPending && "size-7 border-2 border-color-7 bg-white dark:bg-transparent"
          )}
        >
          {isCompleted && <CheckCheckIcon className="text-white text-sm" />}
          {isActive && <Icon className="text-white text-sm" />}
          {isPending && (
            <Icon className="text-color-5 dark:text-color-6 text-xs" />
          )}
        </div>
        <div
          className={cn(
            "h-0.5 flex-1 rounded-full transition-all duration-500",
            isLast ? "bg-transparent" : segmentColor(index)
          )}
        />
      </div>

      <div className="flex flex-col items-center min-w-0 mt-6">
        <p
          className={cn(
            "leading-tight text-center whitespace-nowrap transition-all duration-300",
            locale === "ar" ? "rotate-45" : "-rotate-45",
            isCompleted && "text-color-1 font-ProximaNovaSemiBold text-sm",
            isActive && "text-color-2 font-ProximaNovaBold text-[15px]",
            isPending && "text-color-5 dark:text-color-8 font-ProximaNovaMed text-sm"
          )}
        >
          {t(step.label)}
        </p>
        {timeLabel && (
          <span
            className={cn(
              "text-[11px] font-ProximaNovaThin tabular-nums text-center mt-6",
              isActive ? "text-color-2" : "text-color-5 dark:text-color-8"
            )}
          >
            {timeLabel}
          </span>
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
    CANCELED: "Your Order Has Been Canceled!",
    REJECTED: "Your Order Has Been Rejected!",
    VOIDED: "Your Order Has Been Voided!",
  };

  return (
    <div className="border border-red-200 bg-red-50 rounded-2xl p-4 mb-4 flex items-start gap-3">
      <span className="size-9 grid place-items-center rounded-full bg-red-100 shrink-0">
        <XIcon className="size-4.5 text-red-500" />
      </span>
      <div className="min-w-0">
        <p className="text-red-600 font-ProximaNovaSemiBold text-sm">
          {t(labels[status || ""] || "Your Order Has Been Canceled!")}
        </p>
        {reason && (
          <p className="text-red-400 dark:text-red-500 font-ProximaNovaThin text-xs mt-1">
            {reason}
          </p>
        )}
      </div>
    </div>
  );
}

function LivePill() {
  const t = useTranslations();
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-color-11/10 border border-color-11/30 px-2.5 py-1">
      <span className="size-2 rounded-full bg-color-11 animate-pulse" />
      <span className="text-[11px] font-ProximaNovaSemiBold text-color-11">
        {t("Live")}
      </span>
    </span>
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
  const {
    liveLocation,
    driverName,
    driverPhone,
  } = useDriverLocation(
    trackedOrderData?.assignment?.driverUid,
    trackedOrderData?.status?.current
  );
  const driverLocation: [number, number] | null = liveLocation
    ? [liveLocation.lat, liveLocation.lng]
    : null;
  const deliveryLatlng =
    (trackedOrderData?.delivery?.latlng as [number, number] | undefined) ?? null;
  const restaurantLatlng =
    (currentRes?.profile?.latlng as [number, number] | undefined) ?? null;
  const eta = useEta({
    status: trackedOrderData?.status?.current,
    timeline: (trackedOrderData?.timeline ?? null) as {
      placedAt?: number;
      preparingAt?: number;
      readyAt?: number;
      onRouteAt?: number;
      deliveredAt?: number;
    } | null,
    driverLocation: liveLocation,
    deliveryLatlng,
    restaurantLatlng,
    prepTimeMin: currentRes?.operations?.cookTime?.[0],
    prepTimeMax: currentRes?.operations?.cookTime?.[1],
  });
  const mapPoints: ([number, number] | null)[] = [
    restaurantLatlng,
    deliveryLatlng,
    driverLocation,
  ];

  const currentStatus = trackedOrderData?.status?.current;

  const currentStepIndex = useMemo(() => {
    if (!currentStatus) return 0;
    const idx = STEPS.findIndex((step) => step.statuses.includes(currentStatus));
    return idx >= 0 ? idx : 0;
  }, [currentStatus]);

  const stepTimes = useMemo(() => {
    const timeline = trackedOrderData?.timeline;
    if (!timeline) return [];
    return STEPS.map((step) => {
      if (step.timelineKey) {
        const field = timeline[step.timelineKey as keyof typeof timeline];
        return typeof field === "number" ? field : undefined;
      }
      return (
        timeline.pickedUpAt ??
        timeline.onRouteAt ??
        timeline.readyAt ??
        timeline.reservedAt ??
        undefined
      );
    });
  }, [trackedOrderData?.timeline]);

  const isError = ERROR_STATUSES.includes(currentStatus ?? "");
  const isMapLive = ["READY", "RESERVED", "PICKED_UP", "ON_ROUTE"].includes(
    currentStatus ?? ""
  );
  const isRTL = locale === "ar";

  const activeStep = STEPS[Math.max(0, currentStepIndex)];

  const items = trackedOrderData?.cart ?? [];
  const orderNumber = trackedOrderData?.orderNumber;
  const total = trackedOrderData?.pricing?.total;
  const deliveryAddress = trackedOrderData?.delivery?.address;
  const resName =
    locale === "ar"
      ? currentRes?.profile?.nameInAr ||
        trackedOrderData?.business?.nameInAr ||
        currentRes?.profile?.name
      : currentRes?.profile?.name || trackedOrderData?.business?.name;
  const resAddress = currentRes?.profile?.address;
  const resIcon = currentRes?.branding?.icon;
  const resPhones = useMemo(() => {
    const phones = new Set<string>();
    currentRes?.business?.contactNumbers?.forEach((p) => p && phones.add(p));
    const orderPhone = trackedOrderData?.business?.phone;
    if (orderPhone) phones.add(orderPhone);
    if (currentRes?.owner?.phone) phones.add(currentRes.owner.phone);
    if (currentRes?.owner?.secondPhone) phones.add(currentRes.owner.secondPhone);
    return [...phones].map((p) => p.trim()).filter(Boolean);
  }, [currentRes, trackedOrderData?.business?.phone]);

  const handleCloseSidebar = () => {
    dispatch(toggleOrderSidebar());
    document.body.classList.remove("overflow-hidden");
  };

  return (
    <>
      <div
        className={cn(
          "order-sidebar fixed top-0 h-full overflow-y-scroll bg-card transition-all duration-500 z-40 px-5 py-5 w-full sm:py-6 flex flex-col sm:w-[500px]",
          isRTL ? "left-0" : "right-0",
          isOrderSidebarOpen
            ? "translate-x-0"
            : isRTL
              ? "-translate-x-full"
              : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleCloseSidebar}
            aria-label="Close"
            className="size-9 grid place-items-center rounded-full bg-color-7/60 hover:bg-color-7 transition-colors cursor-pointer"
          >
            <XIcon className="size-5 text-color-1" />
          </button>
          <div className="flex items-center gap-2.5">
            <h2 className="text-color-1 text-xl font-ProximaNovaBold">
              {t("Order Tracking")}
            </h2>
            {isMapLive && <LivePill />}
          </div>
          <div className="size-9" />
        </div>

        {/* Restaurant card */}
        {resName && (
          <div className="flex items-center gap-3 rounded-2xl border border-color-7 bg-card p-3.5 shadow-sm mb-4">
            <div className="size-12 grid place-items-center rounded-xl bg-color-7/50 overflow-hidden shrink-0">
              {resIcon ? (
                <Image
                  src={resIcon}
                  alt={resName}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              ) : (
                <StoreIcon className="size-6 text-color-5 dark:text-color-6" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-color-1 font-ProximaNovaSemiBold text-sm truncate">
                {resName}
              </p>
              {resAddress && (
                <p className="text-color-5 font-ProximaNovaThin text-xs truncate mt-0.5">
                  {resAddress}
                </p>
              )}
            </div>
            {orderNumber && (
              <div className="text-right shrink-0">
                <p className="text-[10px] uppercase tracking-wide text-color-5 font-ProximaNovaThin">
                  {t("Order number")}
                </p>
                <p className="text-color-1 font-ProximaNovaBold text-sm">
                  #{orderNumber}
                </p>
              </div>
            )}
          </div>
        )}

        {isError && trackedOrderData && (
          <ErrorBanner
            status={currentStatus}
            reason={trackedOrderData?.status?.cancellationReason}
          />
        )}

        {!isError && (
          <>
            {/* Status hero */}
            <div className="relative rounded-2xl p-4 mb-4 text-white bg-linear-to-br from-color-2 to-[#ffab4a] shadow-sm">
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                <div className="absolute -right-8 -top-10 size-28 rounded-full bg-white/15" />
                <div className="absolute -right-1 top-2 size-14 rounded-full bg-white/10" />
              </div>
              <div className="relative">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[11px] font-ProximaNovaThin uppercase tracking-widest opacity-90">
                    {t("Order Tracking")}
                  </p>
                  {!eta.isArrived && eta.minutes !== null && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-ProximaNovaSemiBold whitespace-nowrap">
                      <ClockIcon className="size-3.5 shrink-0" />
                      {eta.isEnRoute && eta.minutes <= 5
                        ? t("Arriving soon")
                        : `${t("Estimated arrival")}: ${
                            eta.minutesMax !== null &&
                            eta.minutesMax !== eta.minutes
                              ? `${eta.minutes}-${eta.minutesMax}`
                              : eta.minutes
                          } ${t("min")}`}
                    </span>
                  )}
                </div>
                <p className="font-ProximaNovaBold text-lg leading-tight mt-0.5">
                  {t(activeStep.sublabel)}
                </p>
                <p className="font-ProximaNovaThin text-sm opacity-90 mt-1">
                  {t(activeStep.label)}
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="rounded-2xl border border-color-7 bg-card p-4 shadow-sm mb-4 flex items-start">
              {STEPS.map((step, index) => (
                <StepIndicator
                  key={step.key}
                  step={step}
                  index={index}
                  currentStepIndex={currentStepIndex}
                  totalSteps={STEPS.length}
                  timestamp={stepTimes[index]}
                  locale={locale}
                />
              ))}
            </div>

            {/* Driver contact */}
            {driverPhone && (
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-color-7 bg-card p-4 shadow-sm mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-11 shrink-0 grid place-items-center rounded-full bg-color-2/10">
                    <BikeIcon className="size-5 text-color-2" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-wider text-color-5 font-ProximaNovaSemiBold">
                      {t("Your driver")}
                    </p>
                    {driverName && (
                      <p className="text-color-1 font-ProximaNovaSemiBold text-sm truncate mt-0.5">
                        {driverName}
                      </p>
                    )}
                  </div>
                </div>
                <a
                  href={`tel:${driverPhone}`}
                  dir="ltr"
                  aria-label={t("Call your driver")}
                  className="inline-flex items-center gap-2 rounded-full bg-color-2 px-4 py-2.5 text-white font-ProximaNovaSemiBold text-sm shrink-0 hover:bg-color-2/90 transition-colors cursor-pointer"
                >
                  <PhoneIcon className="size-4 shrink-0" />
                  <span className="tabular-nums">{driverPhone}</span>
                </a>
              </div>
            )}
          </>
        )}

        {/* Map */}
        <div className="relative shrink-0 overflow-hidden rounded-2xl border border-color-7 bg-card shadow-sm mb-4">
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
            className="h-56 sm:h-64"
          />
          {isMapLive && (
            <div className="absolute top-3 inset-s-3 pointer-events-none z-900">
              {eta.isEnRoute && eta.minutes !== null ? (
                <div className="flex items-center gap-1.5 rounded-full bg-white/95 dark:bg-card/95 backdrop-blur-sm shadow-md px-3 py-1.5">
                  <ClockIcon className="size-3.5 text-color-2" />
                  <span className="text-xs font-ProximaNovaSemiBold text-color-1">
                    {eta.minutes <= 5
                      ? t("Arriving soon")
                      : `${t("Estimated arrival")}: ${eta.minutes} ${t("min")}`}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-full bg-white/95 dark:bg-card/95 backdrop-blur-sm shadow-md px-3 py-1.5">
                  <span className="relative flex size-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-color-2 opacity-75" />
                    <span className="relative inline-flex size-2.5 rounded-full bg-color-2" />
                  </span>
                  <span className="text-xs font-ProximaNovaSemiBold text-color-1">
                    {t("Driver on the way")}
                  </span>
                </div>
              )}
            </div>
          )}
          {!isMapLive && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20 backdrop-blur-[1.5px]">
              <div className="bg-white/95 dark:bg-card/95 backdrop-blur-sm rounded-2xl px-5 py-3.5 shadow-lg text-center">
                <p className="text-color-1 font-ProximaNovaSemiBold text-sm text-center">
                  {t("Available in the delivery phase")}
                </p>
                <p className="text-color-5 dark:text-color-8 font-ProximaNovaThin text-xs text-center mt-0.5">
                  {t("You'll see the driver in real time")}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Order summary */}
        {trackedOrderData && (
          <div className="rounded-2xl border border-color-7 bg-card p-4 shadow-sm mb-4">
            <p className="text-[11px] uppercase tracking-wider text-color-5 font-ProximaNovaSemiBold mb-3">
              {t("Order summary")}
            </p>

            {items.length > 0 && (
              <div className="mb-3">
                {items.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 text-sm mb-2 last:mb-0"
                  >
                    <span className="text-color-6 font-ProximaNovaThin flex-1 min-w-0 truncate">
                      {item.name}
                      {item.selectedSize && (
                        <span className="text-color-5">
                          {" "}
                          ({item.selectedSize})
                        </span>
                      )}
                    </span>
                    <span className="text-color-1 font-ProximaNovaSemiBold shrink-0">
                      × {item.quantity}
                    </span>
                  </div>
                ))}
                {items.length > 4 && (
                  <p className="text-xs text-color-5 font-ProximaNovaThin mt-2">
                    +{items.length - 4}
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-color-6 font-ProximaNovaThin">
                {t("Order number")}
              </span>
              <span className="text-color-1 font-ProximaNovaSemiBold">
                #{orderNumber}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-color-6 font-ProximaNovaThin">
                {t("Items")}
              </span>
              <span className="text-color-1 font-ProximaNovaSemiBold">
                {items.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>

            {deliveryAddress && (
              <div className="mb-2">
                <span className="text-color-6 font-ProximaNovaThin text-xs">
                  {t("Deliver to")}
                </span>
                <p className="text-color-1 font-ProximaNovaSemiBold text-sm mt-0.5 leading-snug">
                  {deliveryAddress}
                </p>
              </div>
            )}

            {typeof total === "number" && (
              <>
                <div className="h-px bg-color-7 my-3" />
                <div className="flex items-center justify-between">
                  <span className="text-color-1 font-ProximaNovaSemiBold text-sm">
                    {t("Total")}
                  </span>
                  <span className="egp text-color-2 font-ProximaNovaBold text-base">
                    {total}
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Footer actions */}
        <div className="mt-auto pt-3">
          {currentStatus === "RECEIVED" ? (
            <button
              onClick={cancelOrder}
              className="w-full py-4 rounded-2xl text-base text-white font-ProximaNovaSemiBold cursor-pointer bg-red-500 hover:bg-red-600 transition-colors"
            >
              {t("Order Cancel")}
            </button>
          ) : (
            <button className="w-full rounded-2xl border border-color-7 bg-card p-3.5 hover:bg-color-7/40 transition-colors cursor-pointer">
              <span className="flex items-center justify-center gap-2">
                <PhoneIcon className="size-4 text-color-2" />
                <span className="text-color-1 font-ProximaNovaSemiBold text-sm">
                  {t("Cancellations and modifications")}
                </span>
              </span>
              {resPhones.length > 0 && (
                <span className="flex items-center justify-center gap-2 mt-0.5">
                  {resPhones.map((phone) => (
                    <a
                      key={phone}
                      href={`tel:${phone}`}
                      dir="ltr"
                      className="text-color-2 font-ProximaNovaBold text-base underline-offset-4 hover:underline"
                    >
                      {phone}
                    </a>
                  ))}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      <div
        className={cn(
          "order-sidebar-overlay z-30 top-0 left-0 right-0 bottom-0 bg-black/70 transition-opacity overflow-hidden",
          isOrderSidebarOpen ? "fixed" : "hidden"
        )}
        onClick={handleCloseSidebar}
      ></div>
    </>
  );
};

export default OrderSidebar;
