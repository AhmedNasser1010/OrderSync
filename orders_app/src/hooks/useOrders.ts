import { useMemo, useState, useEffect } from "react";
import { Order, FormattedOrder, CartItemType } from "@/types/order";
import { ItemType } from "@/types/menu";
import {
  useFetchUserDataQuery,
  useFetchOpenOrdersDataQuery,
  useFetchMenuDataQuery,
} from "@/lib/rtk/api/firestoreApi";
import { useAppSelector } from '@/lib/rtk/hooks'
import { userUid } from '@/lib/rtk/slices/constantsSlice'

type UseOrders = {
  orders: Order[] | null;
  formattedOrders: FormattedOrder[] | null;
  getOrderMenu: (orderCart: CartItemType[]) => any[];
  getOrder: (id: string) => Order | undefined;
  isLoading: boolean;
};

type FetchOpenOrdersResult = {
  data?: Order[];
  error?: any;
  isLoading?: boolean;
  isError?: boolean;
};

const useOrders = (): UseOrders => {
  const uid = useAppSelector(userUid)
  const { data: userData } = useFetchUserDataQuery(uid, { skip: !uid });
  const { data: openOrdersData, isLoading: ordersIsLoading } = useFetchOpenOrdersDataQuery(
    userData?.accessToken,
    { skip: !userData?.accessToken }
  ) as FetchOpenOrdersResult;
  const { data: menuData, isLoading: menuIsLoading } = useFetchMenuDataQuery(userData?.accessToken, {
    skip: !userData?.accessToken,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    setIsLoading(true)
    if (ordersIsLoading === false && menuIsLoading === false) {
      setIsLoading(false)
    }
  }, [ordersIsLoading, menuIsLoading])

  const getOrder = (id: string) => {
    return openOrdersData?.find((order) => order.id === id);
  }

  const getOrderMenu = (orderCart: CartItemType[]) => {
    return orderCart.map((cartItem) => {
      const menuItem = menuData?.items?.find((menuItem: ItemType) => menuItem.id === cartItem.id);
      return { ...menuItem, ...cartItem };
    });
  };

  const formattedOrders = useMemo<FormattedOrder[] | null>(() => {
    if (openOrdersData) {
      return openOrdersData.map((order) => ({
        id: order.id,
        customer: order.user.name,
        total: `$${order.cartTotalPrice.total.toFixed(2)}`,
        status: order.status,
        accepted: order.accepted,
        items: getOrderMenu(order.cart)
          .map((item) => `${item?.quantity}x ${item?.title}`)
          .join(", "),
      }));
    }
    return null;
  }, [openOrdersData, menuData]);


  return {
    orders: openOrdersData || null,
    formattedOrders: formattedOrders,
    getOrderMenu,
    getOrder,
    isLoading
  };
};

export default useOrders;
