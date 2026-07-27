import { useMemo, useCallback } from "react";
import type { OrderType } from "@ordersync/types";
import type { ItemType } from "@ordersync/types";
import type { FormattedOrderType, CartItemType, MainTabTypes } from "@/types/orders";
import {
  useFetchUserDataQuery,
  useFetchActiveOrdersQuery,
  useFetchMenuDataQuery,
} from "@/rtk/api/firestoreApi";
import { useAppSelector } from "@/rtk/hooks";
import { userUid } from "@/rtk/slices/constantsSlice";
import { activeTab } from "@/rtk/slices/toggleSlice";
import { skipToken } from "@reduxjs/toolkit/query";

type TabCounts = Record<MainTabTypes, number>;

type UseOrders = {
  orders: OrderType[] | null;
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
        result[tab]++;
      }
    }

    return result;
  }, [activeOrdersData]);

  const filteredOrders = useMemo<OrderType[] | null>(() => {
    if (!activeOrdersData) return null;

    return activeOrdersData.filter((order) => {
      const tab = getStatusTab(order.status.current);
      return tab === activeTabValue;
    });
  }, [activeOrdersData, activeTabValue]);

  const formattedOrders = useMemo<FormattedOrderType[] | null>(() => {
    return (
      filteredOrders?.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customer: order.customer.name,
        total: `$${order.pricing.total.toFixed(2)}`,
        status: order.status.current,
        items: getOrderMenu(order.cart)
          .map((item) => `${item?.quantity}x ${item?.title}`)
          .join(", "),
        placedAt: order.timeline.placedAt,
      })) || null
    );
  }, [filteredOrders, getOrderMenu]);

  return {
    orders: filteredOrders,
    formattedOrders,
    counts,
    getOrderMenu,
    getOrder,
    isLoading,
    isError,
  };
};

export default useOrders;
