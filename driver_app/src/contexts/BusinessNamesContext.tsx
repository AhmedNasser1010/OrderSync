"use client";

import { createContext, useContext, useMemo } from "react";
import { useFetchMarketplaceOrdersQuery, useFetchMyOrdersQuery, useFetchBusinessNamesQuery } from "@/rtk/api/firestoreApi";
import { useAuth } from "@/contexts/AuthContext";

type BusinessNameMap = Record<string, string>;

const BusinessNamesContext = createContext<BusinessNameMap>({});

export function BusinessNamesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const driverUid = user?.uid ?? "";

  const { orders: marketplaceOrders } = useFetchMarketplaceOrdersQuery(driverUid, {
    skip: !driverUid,
    selectFromResult: (res) => ({ orders: res.data ?? [] }),
  });
  const { orders: myOrders } = useFetchMyOrdersQuery(driverUid, {
    skip: !driverUid,
    selectFromResult: (res) => ({ orders: res.data ?? [] }),
  });

  const businessIds = useMemo(() => {
    const allOrders = [...marketplaceOrders, ...myOrders];
    const ids = new Set<string>();
    for (const order of allOrders) {
      if (order.business?.id) ids.add(order.business.id);
    }
    return [...ids];
  }, [marketplaceOrders, myOrders]);

  const { data: nameMap } = useFetchBusinessNamesQuery(businessIds, {
    skip: businessIds.length === 0,
  });

  const flattened = useMemo(() => {
    if (!nameMap) return {};
    const result: BusinessNameMap = {};
    for (const [id, business] of Object.entries(nameMap)) {
      if (business.nameInAr) result[id] = business.nameInAr;
    }
    return result;
  }, [nameMap]);

  return (
    <BusinessNamesContext.Provider value={flattened}>
      {children}
    </BusinessNamesContext.Provider>
  );
}

export function useBusinessDisplayName(businessId?: string, fallbackName?: string): string {
  const nameMap = useContext(BusinessNamesContext);
  if (!businessId) return fallbackName ?? "";
  return nameMap[businessId] ?? fallbackName ?? "";
}

export function useBusinessNamesMap(): BusinessNameMap {
  return useContext(BusinessNamesContext);
}
