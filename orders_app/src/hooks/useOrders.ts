import { useMemo, useCallback } from "react";
import type { OrderType } from "@ordersync/types";
import type { ItemType } from "@ordersync/types";
import type { FormattedOrderType, CartItemType } from "@/types/orders";
import {
  useFetchUserDataQuery,
  useFetchActiveOrdersQuery,
  useFetchMenuDataQuery,
} from "@/rtk/api/firestoreApi";
import { useAppSelector } from "@/rtk/hooks";
import { userUid } from "@/rtk/slices/constantsSlice";
import { activeTab } from "@/rtk/slices/toggleSlice";
import { skipToken } from "@reduxjs/toolkit/query";

type UseOrders = {
  orders: OrderType[] | null;
  formattedOrders: FormattedOrderType[] | null;
  getOrderMenu: (orderCart: CartItemType[]) => (ItemType & CartItemType)[];
  getOrder: (id: string) => OrderType | undefined;
  isLoading: boolean;
};

const useOrders = (): UseOrders => {
  const uid = useAppSelector(userUid);
  const activeTabValue = useAppSelector(activeTab);
  const { data: userData, isLoading: isUserDataLoading } =
    useFetchUserDataQuery(uid ? uid : skipToken);

  const { data: activeOrdersData, isLoading: activeOrdersIsLoading } =
    useFetchActiveOrdersQuery(userData?.accessToken ?? skipToken, {
      skip: !userData?.accessToken,
    }) as { data?: OrderType[]; isLoading?: boolean };

  const { data: menuData, isLoading: menuIsLoading } = useFetchMenuDataQuery(
    userData?.accessToken,
    { skip: !userData?.accessToken },
  );

  const isLoading = isUserDataLoading || activeOrdersIsLoading || menuIsLoading;

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

  const filteredOrders = useMemo<OrderType[] | null>(() => {
    if (!activeOrdersData) return null;

    return activeOrdersData.filter((order) => {
      const status = order.status.current;

      switch (activeTabValue) {
      case "RECEIVED":
        return status === "RECEIVED";
      case "PREPARING":
        return ["ACCEPTED", "PREPARING"].includes(status);
      case "DELIVERY":
          return ["READY", "RESERVED", "PICKED_UP", "ON_ROUTE"].includes(status);
        case "COMPLETED":
          return status === "DELIVERED" || status === "GIVEN_FEEDBACK";
        case "VOIDED":
          return ["CANCELED", "REJECTED", "VOIDED"].includes(status);
        default:
          return false;
      }
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
    getOrderMenu,
    getOrder,
    isLoading,
  };
};

export default useOrders;
