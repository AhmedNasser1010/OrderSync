"use client";

import {
  useFetchDriverUsersQuery,
  useDeleteDriverDocumentMutation,
} from "@/rtk/api/firestoreApi";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, RefreshCw } from "lucide-react";
import { DriversTable } from "@/components/dashboard/DriversTable";
import { DriversFilters } from "@/components/dashboard/DriversFilters";
import { AddDriverDialog } from "@/components/dashboard/AddDriverDialog";
import { ExportButton } from "@/components/dashboard/ExportButton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import type { ExportColumn } from "@/lib/export-utils";

const COOLDOWN_DURATION = 5;
const PAGE_SIZE = 15;

const driverColumns: ExportColumn[] = [
  { header: "UID", accessor: "uid" },
  { header: "Name", accessor: "userInfo.name" },
  { header: "Email", accessor: "userInfo.email" },
  { header: "Phone", accessor: "userInfo.phone" },
  { header: "Second Phone", accessor: "userInfo.secondPhone" },
  { header: "License Plate Letters", accessor: "licensePlate.letters" },
  { header: "License Plate Numbers", accessor: "licensePlate.numbers" },
  { header: "Online (Manager)", accessor: "online.byManager" },
  { header: "Online (User)", accessor: "online.byUser" },
  { header: "Daily Advance", accessor: "finance.dailyAdvance" },
  { header: "Current Cash", accessor: "finance.currentCash" },
  { header: "Earnings", accessor: "finance.earnings" },
  { header: "Live Location Lat", accessor: "liveLocation.lat" },
  { header: "Live Location Lng", accessor: "liveLocation.lng" },
  { header: "Created At", accessor: "createdAt" },
  { header: "Updated At", accessor: "updatedAt" },
];

export default function DriversPage() {
  const authUser = useAuth().user;
  const partnerUid = authUser?.uid ?? "";
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    data: drivers = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useFetchDriverUsersQuery(partnerUid, { skip: !partnerUid });

  const [deleteDriver] = useDeleteDriverDocumentMutation();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

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

  const handleStatusChange = useCallback((value: string) => {
    setStatus(value);
    setPage(1);
  }, []);

  const filteredDrivers = useMemo(() => {
    return drivers.filter((driver) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        !search ||
        driver.userInfo?.name?.toLowerCase().includes(searchLower) ||
        driver.userInfo?.email?.toLowerCase().includes(searchLower) ||
        driver.userInfo?.phone?.includes(search);

      let matchesStatus = true;
      if (status && status !== "all") {
        const isOnline = driver.online?.byManager ?? false;
        matchesStatus =
          (status === "online" && isOnline) ||
          (status === "offline" && !isOnline);
      }

      return matchesSearch && matchesStatus;
    });
  }, [drivers, search, status]);

  const totalPages = Math.ceil(filteredDrivers.length / PAGE_SIZE);
  const safePage = Math.min(page, totalPages || 1);
  const paginatedDrivers = filteredDrivers.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Drivers</h1>
          <p className="text-muted-foreground text-sm">
            Manage your drivers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton
            data={filteredDrivers as unknown as Record<string, unknown>[]}
            columns={driverColumns}
            filename="drivers"
            sheetName="Drivers"
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
          <AddDriverDialog />
        </div>
      </div>

      {/* Filters */}
      <DriversFilters
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
      />

      {/* Results count */}
      {!isLoading && !isError && (
        <div className="text-sm text-muted-foreground">
          Showing {filteredDrivers.length} of {drivers.length} drivers
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-destructive">Failed to load drivers</p>
        </div>
      ) : (
        <DriversTable
          drivers={paginatedDrivers}
          onDelete={async (uid) => {
            if (!authUser) return;
            const idToken = await authUser.getIdToken();
            await deleteDriver({ uid, idToken });
          }}
        />
      )}

      {/* Pagination */}
      {filteredDrivers.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            {(safePage - 1) * PAGE_SIZE + 1}–
            {Math.min(safePage * PAGE_SIZE, filteredDrivers.length)} of{" "}
            {filteredDrivers.length} drivers
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
  );
}
