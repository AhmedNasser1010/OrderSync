"use client";

import { useState, useCallback, useMemo } from "react";
import {
  OrderLookupFilters,
  type LookupFieldKey,
} from "@/components/dashboard/OrderLookupFilters";
import { OrderLookupTable } from "@/components/dashboard/OrderLookupTable";
import { OrderDetailsDialog } from "@/components/dashboard/OrderDetailsDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SearchX, Inbox } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import {
  patchOrderLookup,
  type OrderLookupCandidate,
  type OrderLookupState,
} from "@/rtk/slices/uiSlice";import {
  useFetchUserDataQuery,
  useFetchBusinessesQuery,
  useLazyFetchDriverUsersQuery,
  useLazyFetchCustomersQuery,
  useSearchOrdersQuery,
  type OrderLookupField,
  type SearchOrdersInput,
} from "@/rtk/api/firestoreApi";
import type { CustomerType, Driver, OrderType } from "@ordersync/types";

const PAGE_SIZE = 15;

function resolveNameCandidates<T>(
  items: T[],
  query: string,
  getName: (item: T) => string | undefined,
  getUid: (item: T) => string,
  getPhone: (item: T) => string | undefined,
  targetField: OrderLookupField,
): OrderLookupCandidate[] {
  const q = query.toLowerCase();
  return items
    .filter((item) => getName(item)?.toLowerCase().includes(q))
    .map((item) => ({
      uid: getUid(item),
      name: getName(item) || "Unnamed",
      phone: getPhone(item),
      targetField,
    }));
}

export default function OrderLookupPage() {
  const authUser = useAuth().user;
  const authUid = authUser?.uid ?? "";
  const dispatch = useAppDispatch();
  const lookup = useAppSelector((state) => state.ui.orderLookup);
  const { field, inputValue, search, candidates, notice } = lookup;

  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
  const [page, setPage] = useState(1);

  const patch = useCallback(
    (partial: Partial<OrderLookupState>) => dispatch(patchOrderLookup(partial)),
    [dispatch],
  );

  const { data: userData } = useFetchUserDataQuery(authUid, {
    skip: !authUid,
  });

  const businessIds = useMemo(
    () => userData?.data?.businesses ?? [],
    [userData],
  );

  const { data: businesses = [] } = useFetchBusinessesQuery(
    businessIds.length ? businessIds : undefined,
    { skip: !businessIds.length },
  );

  const [fetchDrivers, { isFetching: driversFetching }] =
    useLazyFetchDriverUsersQuery();
  const [fetchCustomers, { isFetching: customersFetching }] =
    useLazyFetchCustomersQuery();

  const {
    data: results = [],
    isLoading,
    isError,
    isFetching,
  } = useSearchOrdersQuery(search ?? { field: "orderId", value: "", businessIds: [] }, {
    skip: !search,
  });

  const restaurantOptions = useMemo(
    () =>
      businesses.map((biz) => ({
        value: biz.accessToken,
        label: biz.profile?.name
          ? `${biz.profile.name} (${biz.accessToken})`
          : biz.accessToken,
      })),
    [businesses],
  );

  const runSearch = useCallback(
    (nextSearch: SearchOrdersInput) => {
      patch({
        search: nextSearch,
        candidates: [],
        notice: null,
      });
      setPage(1);
    },
    [patch],
  );

  const handleSubmit = useCallback(async () => {
    const value = inputValue.trim();
    if (!value) return;

    if (!businessIds.length) {
      patch({ notice: "No businesses are linked to your account yet.", search: null });
      return;
    }

    if (field === "orderNumber" && !/^\d+$/.test(value)) {
      patch({ notice: "Order number must contain digits only." });
      return;
    }

    if (field === "driverName" || field === "customerName") {
      try {
        const response =
          field === "driverName"
            ? await fetchDrivers(authUid, true)
            : await fetchCustomers(authUid, true);
        const items = (response.data ?? []) as (Driver | CustomerType)[];
        const matches =
          field === "driverName"
            ? resolveNameCandidates(
                items as Driver[],
                value,
                (driver) => driver.userInfo?.name,
                (driver) => driver.uid,
                (driver) => driver.userInfo?.phone,
                "driverUid",
              )
            : resolveNameCandidates(
                items as CustomerType[],
                value,
                (customer) => customer.userInfo?.name,
                (customer) => customer.uid,
                (customer) => customer.userInfo?.phone,
                "customerUid",
              );
        if (matches.length === 0) {
          patch({
            search: null,
            candidates: [],
            notice: `No ${field === "driverName" ? "drivers" : "customers"} found matching "${value}".`,
          });
          return;
        }
        if (matches.length > 1) {
          patch({ search: null, candidates: matches, notice: null });
          return;
        }
        runSearch({
          field: matches[0].targetField,
          value: matches[0].uid,
          businessIds,
        });
      } catch {
        patch({
          search: null,
          candidates: [],
          notice:
            field === "driverName"
              ? "Failed to load your drivers. Please try again."
              : "Failed to load your customers. Please try again.",
        });
      }
      return;
    }

    runSearch({ field: field as OrderLookupField, value, businessIds });
  }, [
    inputValue,
    field,
    businessIds,
    authUid,
    fetchDrivers,
    fetchCustomers,
    runSearch,
    patch,
  ]);

  const handleFieldChange = useCallback(
    (nextField: LookupFieldKey) => {
      patch({
        field: nextField,
        inputValue: "",
        search: null,
        candidates: [],
        notice: null,
      });
      setPage(1);
    },
    [patch],
  );

  const totalPages = Math.ceil(results.length / PAGE_SIZE);
  const safePage = Math.min(page, totalPages || 1);
  const paginatedResults = results.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Order Lookup</h1>
        <p className="text-muted-foreground mt-1">
          Find orders by any identifier across your restaurants
        </p>
      </div>

      <OrderLookupFilters
        field={field}
        onFieldChange={handleFieldChange}
        value={inputValue}
        onValueChange={(value) => patch({ inputValue: value })}
        onSubmit={handleSubmit}
        isSearching={isFetching || driversFetching || customersFetching}
        restaurantOptions={restaurantOptions}
      />

      {notice && (
        <p className="text-sm text-destructive flex items-center gap-2">
          <SearchX className="h-4 w-4 flex-shrink-0" />
          {notice}
        </p>
      )}

      {candidates.length > 0 && (
        <Card className="p-4 bg-card border-border space-y-3">
          <p className="text-sm font-medium text-foreground">
            Multiple matches found — pick one:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {candidates.map((candidate) => (
              <Button
                key={`${candidate.targetField}-${candidate.uid}`}
                variant="outline"
                className="justify-start h-auto py-2 px-3"
                onClick={() =>
                  runSearch({
                    field: candidate.targetField,
                    value: candidate.uid,
                    businessIds,
                  })
                }
              >
                <div className="text-left min-w-0">
                  <p className="text-sm font-medium truncate">
                    {candidate.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate font-mono">
                    {candidate.uid}
                    {candidate.phone ? ` · ${candidate.phone}` : ""}
                  </p>
                </div>
              </Button>
            ))}
          </div>
        </Card>
      )}

      {!search && candidates.length === 0 && !notice && (
        <Card className="p-12 bg-card border-border text-center">
          <div className="text-muted-foreground">
            <Inbox className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">Look up an order</p>
            <p className="text-sm mt-1 max-w-md mx-auto">
              Choose an identifier type above, enter its value, then press
              Search. Results are limited to your restaurants.
            </p>
          </div>
        </Card>
      )}

      {search && (
        <>
          <div className="text-sm text-muted-foreground">
            Found {results.length} order{results.length === 1 ? "" : "s"}
            {isFetching ? " · searching..." : ""}
          </div>

          <OrderLookupTable
            orders={paginatedResults}
            isLoading={isLoading}
            isError={isError}
            onView={setSelectedOrder}
          />

          {results.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(safePage - 1) * PAGE_SIZE + 1}–
                {Math.min(safePage * PAGE_SIZE, results.length)} of{" "}
                {results.length} orders
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
        </>
      )}

      <OrderDetailsDialog
        order={selectedOrder}
        open={selectedOrder !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedOrder(null);
        }}
      />
    </div>
  );
}
