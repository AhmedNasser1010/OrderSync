import { useMemo, useCallback } from "react";
import type { OrderType, BusinessDocument } from "@ordersync/types";
import type { ItemType } from "@ordersync/types";
import {
  getBusinessDayOfTimestamp,
  localDateKey,
  wasReturnedByDriver,
} from "@ordersync/order-utils";
import type { FormattedOrderType, CartItemType, MainTabTypes } from "@/types/orders";
import {
  useFetchUserDataQuery,
  useFetchActiveOrdersQuery,
  useFetchMenuDataQuery,
  useFetchRestaurantDataQuery,
} from "@/rtk/api/firestoreApi";
import { useAppSelector } from "@/rtk/hooks";
import { userUid } from "@/rtk/slices/constantsSlice";
import { activeTab } from "@/rtk/slices/toggleSlice";
import { skipToken } from "@reduxjs/toolkit/query";

type TabCounts = Record<MainTabTypes, number>;

type OpeningHours = BusinessDocument["operations"]["openingHours"];

type UseOrders = {
  orders: OrderType[] | null;
  receivedOrders: OrderType[];
  preparingOrders: OrderType[];
  formattedOrders: FormattedOrderType[] | null;
  counts: TabCounts;
  getOrderMenu: (orderCart: CartItemType[]) => (ItemType & CartItemType)[];
  getOrder: (id: string) => OrderType | undefined;
  isLoading: boolean;
  isError: boolean;
};

function getStatusTab(status: string): MainTabTypes | null {
  switch (status) {
    case "RECEIVED":
      return "RECEIVED";
    case "ACCEPTED":
    case "PREPARING":
      return "PREPARING";
    case "READY":
    case "RESERVED":
    case "PICKED_UP":
    case "ON_ROUTE":
      return "DELIVERY";
    case "DELIVERED":
    case "GIVEN_FEEDBACK":
      return "COMPLETED";
    case "CANCELED":
    case "REJECTED":
    case "VOIDED":
      return "VOIDED";
    default:
      return null;
  }
}

function businessDayKey(ts: number, openingHours?: OpeningHours): string {
  return (
    getBusinessDayOfTimestamp(ts, openingHours)?.dateKey ??
    localDateKey(new Date(ts))
  );
}

function isTodayOrder(order: OrderType, openingHours?: OpeningHours): boolean {
  return (
    businessDayKey(order.createdAt, openingHours) ===
    businessDayKey(Date.now(), openingHours)
  );
}

const useOrders = (): UseOrders => {
  const uid = useAppSelector(userUid);
  const activeTabValue = useAppSelector(activeTab);
  const { data: userData, isLoading: isUserDataLoading } =
    useFetchUserDataQuery(uid ? uid : skipToken);

  const { data: activeOrdersData, isLoading: activeOrdersIsLoading, isError: activeOrdersIsError } =
    useFetchActiveOrdersQuery(userData?.accessToken ?? skipToken, {
      skip: !userData?.accessToken,
    }) as { data?: OrderType[]; isLoading?: boolean; isError?: boolean };

  const { data: menuData, isLoading: menuIsLoading } = useFetchMenuDataQuery(
    userData?.accessToken,
    { skip: !userData?.accessToken },
  );

  const { data: restaurantData } = useFetchRestaurantDataQuery(
    userData?.accessToken ?? skipToken,
  );
  const openingHours = restaurantData?.operations?.openingHours;

  const isLoading = isUserDataLoading || activeOrdersIsLoading || menuIsLoading;
  const isError = activeOrdersIsError ?? false;

  const getOrder = useCallback(
    (id: string) => activeOrdersData?.find((order) => order.id === id),
    [activeOrdersData],
  );

  const getOrderMenu = useCallback(
    (orderCart: CartItemType[]) => {
      return orderCart.map((cartItem) => {
        const menuItem = menuData?.items?.find(
          (menuItem: ItemType) => menuItem.id === cartItem.id,
        );
        return { ...menuItem, ...cartItem };
      });
    },
    [menuData],
  );

  const counts = useMemo<TabCounts>(() => {
    const result: TabCounts = {
      RECEIVED: 0,
      PREPARING: 0,
      DELIVERY: 0,
      COMPLETED: 0,
      VOIDED: 0,
    };

    if (!activeOrdersData) return result;

    for (const order of activeOrdersData) {
      const tab = getStatusTab(order.status.current);
      if (tab) {
        if (
          (tab === "COMPLETED" || tab === "VOIDED") &&
          !isTodayOrder(order, openingHours)
        ) {
          continue;
        }
        result[tab]++;
      }
    }

    return result;
  }, [activeOrdersData, openingHours]);

  const filteredOrders = useMemo<OrderType[] | null>(() => {
    if (!activeOrdersData) return null;

    const filtered = activeOrdersData.filter((order) => {
      const tab = getStatusTab(order.status.current);
      if (tab !== activeTabValue) return false;
      if (
        (activeTabValue === "COMPLETED" || activeTabValue === "VOIDED") &&
        !isTodayOrder(order, openingHours)
      ) {
        return false;
      }
      return true;
    });

    if (activeTabValue === "RECEIVED") {
      return [...filtered].sort((a, b) => a.timeline.placedAt - b.timeline.placedAt);
    }

    return filtered;
  }, [activeOrdersData, activeTabValue, openingHours]);

  const formattedOrders = useMemo<FormattedOrderType[] | null>(() => {
    return (
      filteredOrders?.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customer: order.customer.name,
        total: order.pricing.total.toFixed(2),
        status: order.status.current,
        items: getOrderMenu(order.cart)
          .map((item) => `${item?.quantity}x ${item?.title}`)
          .join(", "),
        placedAt: order.timeline.placedAt,
        preparingAt: order.timeline.preparingAt,
        isFirstOrder: order.customer.totalOrders === 1,
        note: order.delivery?.note,
        returnedByDriver: wasReturnedByDriver(order),
      })) || null
    );
  }, [filteredOrders, getOrderMenu]);

  const receivedOrders = useMemo<OrderType[]>(() => {
    if (!activeOrdersData) return [];
    return activeOrdersData.filter((order) => order.status.current === "RECEIVED");
  }, [activeOrdersData]);

  const preparingOrders = useMemo<OrderType[]>(() => {
    if (!activeOrdersData) return [];
    return activeOrdersData.filter(
      (order) => order.status.current === "ACCEPTED" || order.status.current === "PREPARING",
    );
  }, [activeOrdersData]);

  return {
    orders: filteredOrders,
    receivedOrders,
    preparingOrders,
    formattedOrders,
    counts,
    getOrderMenu,
    getOrder,
    isLoading,
    isError,
  };
};

export default useOrders;
