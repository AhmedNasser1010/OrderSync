"use client";

import { useState, useEffect, useMemo } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  useFetchRestaurantDataQuery,
  useFetchUserDataQuery,
} from "@/lib/rtk/api/firestoreApi";
import { useAppSelector } from "@/lib/rtk/hooks";
import { userUid } from "@/lib/rtk/slices/constantsSlice";
import { skipToken } from "@reduxjs/toolkit/query";
import type { BusinessDocument, OrderType } from "@ordersync/types";
import {
  getActiveSessionBounds,
  getBusinessDayOfTimestamp,
  getOrderRestaurantNet,
  localDateKey,
} from "@ordersync/order-utils";
import type { TodayData } from "@/lib/types/types";

type OpeningHours = BusinessDocument["operations"]["openingHours"];

function getTodayBounds(openingHours?: OpeningHours): {
  startMs: number;
  endMs: number;
  dateStr: string;
} {
  const now = new Date();
  const { startMs, endMs } = getActiveSessionBounds(now.getTime(), openingHours);
  return {
    startMs,
    endMs,
    dateStr:
      getBusinessDayOfTimestamp(now.getTime(), openingHours)?.dateKey ??
      localDateKey(now),
  };
}

const ACTIVE_STATUSES = new Set([
  "RECEIVED",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "RESERVED",
  "PICKED_UP",
  "ON_ROUTE",
]);

const useTodayOrders = () => {
  const uid = useAppSelector(userUid);
  const { data: user } = useFetchUserDataQuery(uid ?? skipToken);
  const resId = user?.accessToken;

  const { data: restaurantData } = useFetchRestaurantDataQuery(
    resId ?? skipToken,
  );
  const openingHours = restaurantData?.operations?.openingHours;

  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!resId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { startMs, endMs } = getTodayBounds(openingHours);

    const ordersRef = collection(db, "orders");
    const q = query(
      ordersRef,
      where("businessId", "==", resId),
      where("createdAt", ">=", startMs),
      where("createdAt", "<", endMs),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const todayOrders = snapshot.docs.map(
          (doc) => doc.data() as OrderType,
        );
        setOrders(todayOrders);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching today's orders:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [resId, openingHours]);

  const todayData = useMemo<TodayData>(() => {
    const { dateStr } = getTodayBounds(openingHours);

    if (orders.length === 0) {
      return {
        date: dateStr,
        totalRevenue: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        cancellationRate: 0,
        activeOrders: 0,
        statusBreakdown: {},
        paymentMethods: {},
        topItems: [],
        customerInsights: {
          totalCustomers: 0,
          returningCustomers: 0,
          newCustomers: 0,
        },
        operations: { avgPrepTime: 0, avgDeliveryTime: 0 },
      };
    }

    const totalRevenue = orders.reduce(
      (sum, o) => sum + getOrderRestaurantNet(o),
      0,
    );
    const totalOrders = orders.length;
    const avgOrderValue = totalRevenue / totalOrders;

    const cancelledCount = orders.filter(
      (o) => o.status.current === "CANCELED",
    ).length;
    const cancellationRate =
      totalOrders > 0
        ? Number(((cancelledCount / totalOrders) * 100).toFixed(1))
        : 0;

    const activeOrders = orders.filter((o) =>
      ACTIVE_STATUSES.has(o.status.current),
    ).length;

    const statusBreakdown: Record<string, number> = {};
    orders.forEach((o) => {
      statusBreakdown[o.status.current] =
        (statusBreakdown[o.status.current] || 0) + 1;
    });

    const paymentMethods: Record<string, number> = {};
    orders.forEach((o) => {
      const method = o.payment.method || "Unknown";
      paymentMethods[method] = (paymentMethods[method] || 0) + 1;
    });

    const itemsMap = new Map<string, { quantity: number; revenue: number }>();
    orders.forEach((o) => {
      o.cart.forEach((item) => {
        const existing = itemsMap.get(item.name);
        itemsMap.set(item.name, {
          quantity: (existing?.quantity ?? 0) + item.quantity,
          revenue:
            (existing?.revenue ?? 0) +
            item.quantity * (getOrderRestaurantNet(o) / o.cart.length),
        });
      });
    });
    const topItems = [...itemsMap.entries()]
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    const customerMap = new Map<
      string,
      { totalOrders: number }
    >();
    orders.forEach((o) => {
      const existing = customerMap.get(o.customerUid);
      customerMap.set(o.customerUid, {
        totalOrders: (existing?.totalOrders ?? 0) + 1,
      });
    });
    const totalCustomers = customerMap.size;
    let returningCustomers = 0;
    let newCustomers = 0;
    customerMap.forEach((data) => {
      if (data.totalOrders > 1) returningCustomers++;
      else newCustomers++;
    });

    let totalPrepTime = 0;
    let totalDeliveryTime = 0;
    let prepCount = 0;
    let deliveryCount = 0;
    orders.forEach((o) => {
      if (o.timeline.preparingAt && o.timeline.readyAt) {
        totalPrepTime += o.timeline.readyAt - o.timeline.preparingAt;
        prepCount++;
      }
      if (o.timeline.pickedUpAt && o.timeline.deliveredAt) {
        totalDeliveryTime += o.timeline.deliveredAt - o.timeline.pickedUpAt;
        deliveryCount++;
      }
    });
    const avgPrepTime =
      prepCount > 0 ? Math.round(totalPrepTime / prepCount / 60000) : 0;
    const avgDeliveryTime =
      deliveryCount > 0
        ? Math.round(totalDeliveryTime / deliveryCount / 60000)
        : 0;

    return {
      date: dateStr,
      totalRevenue,
      totalOrders,
      avgOrderValue: Number(avgOrderValue.toFixed(2)),
      cancellationRate,
      activeOrders,
      statusBreakdown,
      paymentMethods,
      topItems,
      customerInsights: {
        totalCustomers,
        returningCustomers,
        newCustomers,
      },
      operations: { avgPrepTime, avgDeliveryTime },
    };
  }, [orders, openingHours]);

  return { todayData, loading, hasData: orders.length > 0 };
};

export default useTodayOrders;
