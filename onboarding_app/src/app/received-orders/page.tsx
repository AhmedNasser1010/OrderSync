"use client";

import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ReceivedOrdersTable } from "@/components/dashboard/ReceivedOrdersTable";
import { ReceivedOrdersFilters } from "@/components/dashboard/ReceivedOrdersFilters";
import { ExportButton } from "@/components/dashboard/ExportButton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  useFetchUserDataQuery,
  useFetchBusinessesQuery,
  useFetchReceivedOrdersQuery,
} from "@/rtk/api/firestoreApi";
import type { ExportColumn } from "@/lib/export-utils";

const COOLDOWN_DURATION = 5;
const PAGE_SIZE = 15;

const orderColumns: ExportColumn[] = [
  { header: "Order Number", accessor: "orderNumber" },
  { header: "Customer Name", accessor: "customer.name" },
  { header: "Customer Phone", accessor: "customer.phone" },
  { header: "Restaurant Name", accessor: "business.name" },
  { header: "Restaurant Phone", accessor: "business.phone" },
  { header: "Subtotal", accessor: "pricing.subtotal" },
  { header: "Delivery Fees", accessor: "pricing.deliveryFees" },
  { header: "Total", accessor: "pricing.total" },
  { header: "Commission", accessor: "finance.commissionAmount" },
  { header: "Restaurant Net", accessor: "finance.restaurantShare" },
  { header: "Driver Earnings", accessor: "finance.driverEarnings" },
  { header: "Cash Collected", accessor: "finance.cashCollected" },
  { header: "Created At", accessor: "createdAt" },
];

export default function ReceivedOrdersPage() {
  const authUser = useAuth().user;
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [search, setSearch] = useState("");
  const [restaurantFilter, setRestaurantFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { data: userData } = useFetchUserDataQuery(authUser?.uid ?? "", {
    skip: !authUser?.uid,
  });

  const { data: businesses = [] } = useFetchBusinessesQuery(
    userData?.data?.businesses,
    { skip: !userData?.data?.businesses },
  );

  const {
    data: allOrders = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useFetchReceivedOrdersQuery(userData?.data?.businesses ?? [], {
    skip: !userData?.data?.businesses,
  });

  const handleRefetch = useCallback(() => {
    if (cooldown > 0 || isFetching) return;
    refetch();
    setCooldown(COOLDOWN_DURATION);
  }, [cooldown, isFetching, refetch]);

  useEffect(() => {
    if (cooldown <= 0) {
      if (cooldownRef.current) {
        clearInterval(cooldownRef.current);
        cooldownRef.current = null;
      }
      return;
    }
    if (!cooldownRef.current) {
      cooldownRef.current = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            if (cooldownRef.current) {
              clearInterval(cooldownRef.current);
              cooldownRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (cooldownRef.current) {
        clearInterval(cooldownRef.current);
        cooldownRef.current = null;
      }
    };
  }, [cooldown]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleRestaurantChange = useCallback((value: string) => {
    setRestaurantFilter(value);
    setPage(1);
  }, []);

  const restaurantNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const biz of businesses) {
      map[biz.accessToken] = biz.profile.name;
    }
    return map;
  }, [businesses]);

  const filteredOrders = useMemo(() => {
    return allOrders.filter((order) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        !search ||
        order.customer?.name?.toLowerCase().includes(searchLower) ||
        String(order.orderNumber).includes(search);

      const matchesRestaurant =
        restaurantFilter === "all" ||
        order.businessId === restaurantFilter;

      return matchesSearch && matchesRestaurant;
    });
  }, [allOrders, search, restaurantFilter]);

  const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE);
  const safePage = Math.min(page, totalPages || 1);
  const paginatedOrders = filteredOrders.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const exportData = useMemo(() => {
    return filteredOrders.map((order) => ({
      ...order,
      "customer.name": order.customer?.name || "",
      "customer.phone": order.customer?.phone || "",
      "business.name": order.business?.name || restaurantNameMap[order.businessId] || "",
      "business.phone": order.business?.phone || "",
      "pricing.subtotal": order.pricing?.subtotal ?? 0,
      "pricing.deliveryFees": order.pricing?.deliveryFees ?? 0,
      "pricing.total": order.pricing?.total ?? 0,
      "finance.commissionAmount": order.finance?.commissionAmount ?? 0,
      "finance.restaurantShare": order.finance?.restaurantShare ?? 0,
      "finance.driverEarnings": order.finance?.driverEarnings ?? 0,
      "finance.cashCollected": order.finance?.cashCollected ?? 0,
    }));
  }, [filteredOrders, restaurantNameMap]);

  return (
    <MainLayout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Received Orders
            </h1>
            <p className="text-muted-foreground mt-1">
              Orders waiting for restaurant acceptance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ExportButton
              data={exportData as unknown as Record<string, unknown>[]}
              columns={orderColumns}
              filename="received-orders"
              sheetName="Received Orders"
            />
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleRefetch}
              disabled={cooldown > 0 || isFetching}
            >
              <RefreshCw
                className={cn("h-4 w-4", isFetching && "animate-spin")}
              />
              {isFetching
                ? "Refetching..."
                : cooldown > 0
                  ? `Refetch (${cooldown}s)`
                  : "Refetch"}
            </Button>
          </div>
        </div>

        <ReceivedOrdersFilters
          restaurants={businesses}
          onSearchChange={handleSearchChange}
          onRestaurantChange={handleRestaurantChange}
        />

        <div className="text-sm text-muted-foreground">
          Showing {filteredOrders.length} of {allOrders.length} received orders
        </div>

        <ReceivedOrdersTable
          orders={paginatedOrders}
          restaurantNameMap={restaurantNameMap}
          isLoading={isLoading}
          isError={isError}
        />

        {filteredOrders.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              {(safePage - 1) * PAGE_SIZE + 1}–
              {Math.min(safePage * PAGE_SIZE, filteredOrders.length)} of{" "}
              {filteredOrders.length} orders
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
