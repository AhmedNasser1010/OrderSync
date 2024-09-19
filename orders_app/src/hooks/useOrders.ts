import { useMemo, useState, useEffect, useCallback } from "react";
import { OrderType, FormattedOrderType, CartItemType } from "@/types/order";
import { ItemType } from "@/types/menu";
import {
  useFetchUserDataQuery,
  useFetchOpenOrdersDataQuery,
  useFetchMenuDataQuery,
  useFetchCompletedOrdersDataQuery,
  useFetchVoidedOrdersDataQuery
} from "@/lib/rtk/api/firestoreApi";
import { useAppSelector } from "@/lib/rtk/hooks";
import { userUid } from "@/lib/rtk/slices/constantsSlice";
import { activeTab } from "@/lib/rtk/slices/toggleSlice";

type UseOrders = {
  orders: OrderType[] | null;
  formattedOrders: FormattedOrderType[] | null;
  getOrderMenu: (orderCart: CartItemType[]) => any[];
  getOrder: (id: string) => OrderType | undefined;
  isLoading: boolean;
};

type FetchOrdersType = {
  data?: OrderType[];
  error?: any;
  isLoading?: boolean;
  isError?: boolean;
  refetch?: () => void;
};

const useOrders = (): UseOrders => {
  const uid = useAppSelector(userUid);
  const activeTabValue = useAppSelector(activeTab);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { data: userData } = useFetchUserDataQuery(uid, { skip: !uid });

  const { data: openOrdersData, isLoading: openOrdersIsLoading } =
    useFetchOpenOrdersDataQuery(userData?.accessToken, {
      skip: !userData?.accessToken,
    }) as FetchOrdersType;

  const {
    data: completedOrdersData,
    isLoading: completedOrdersIsLoading,
    refetch: refetchCompletedOrders,
  } = useFetchCompletedOrdersDataQuery(userData?.accessToken, {
    skip: !userData?.accessToken,
  }) as FetchOrdersType;

  const {
    data: voidedOrdersData,
    isLoading: voidedOrdersIsLoading,
    refetch: refetchVoidedOrders,
  } = useFetchVoidedOrdersDataQuery(userData?.accessToken, {
    skip: !userData?.accessToken,
  }) as FetchOrdersType;

  const { data: menuData, isLoading: menuIsLoading } = useFetchMenuDataQuery(
    userData?.accessToken,
    { skip: !userData?.accessToken }
  );

  useEffect(() => {
    if (refetchCompletedOrders && activeTabValue === "COMPLETED") {
      refetchCompletedOrders();
    } else if (refetchVoidedOrders && activeTabValue === "VOIDED") {
      refetchVoidedOrders();
    }
  }, [activeTabValue, refetchCompletedOrders, refetchVoidedOrders]);

  const orders = useMemo<OrderType[] | null>(() => {
    switch (activeTabValue) {
      case "COMPLETED":
        return completedOrdersData || null;
      case "VOIDED":
        return voidedOrdersData || null;
      default:
        return openOrdersData || null;
    }
  }, [activeTabValue, openOrdersData, completedOrdersData, voidedOrdersData]);

  useEffect(() => {
    const allLoading = [
      openOrdersIsLoading,
      menuIsLoading,
      completedOrdersIsLoading,
      voidedOrdersIsLoading
    ].every((loading) => loading === false);
    setIsLoading(!allLoading);
  }, [openOrdersIsLoading, menuIsLoading, completedOrdersIsLoading, voidedOrdersIsLoading]);

  const getOrder = useCallback(
    (id: string) => orders?.find((order) => order.id === id),
    [orders]
  );

  const getOrderMenu = useCallback(
    (orderCart: CartItemType[]) => {
      return orderCart.map((cartItem) => {
        const menuItem = menuData?.items?.find(
          (menuItem: ItemType) => menuItem.id === cartItem.id
        );
        return { ...menuItem, ...cartItem };
      });
    },
    [menuData]
  );

  const formattedOrders = useMemo<FormattedOrderType[] | null>(() => {
    return (
      orders?.map((order) => ({
        id: order.id,
        customer: order.customer.name,
        total: `$${order.cartTotalPrice.total.toFixed(2)}`,
        status: order.status.current,
        accepted: order.status.accepted,
        items: getOrderMenu(order.cart)
          .map((item) => `${item?.quantity}x ${item?.title}`)
          .join(", "),
      })) || null
    );
  }, [orders, getOrderMenu]);

  return {
    orders: orders || null,
    formattedOrders,
    getOrderMenu,
    getOrder,
    isLoading,
  };
};

export default useOrders;
