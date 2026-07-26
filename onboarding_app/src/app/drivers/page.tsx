"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import {
  useFetchDriverUsersQuery,
  useDeleteDriverDocumentMutation,
} from "@/rtk/api/firestoreApi";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { DriversTable } from "@/components/dashboard/DriversTable";
import { DriversFilters } from "@/components/dashboard/DriversFilters";
import { AddDriverDialog } from "@/components/dashboard/AddDriverDialog";
import { ExportButton } from "@/components/dashboard/ExportButton";
import { useState, useMemo } from "react";
import type { ExportColumn } from "@/lib/export-utils";

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
  { header: "Current Cash", accessor: "finance.currentCash" },
  { header: "Warning Limit", accessor: "finance.warningLimit" },
  { header: "Block Limit", accessor: "finance.blockLimit" },
  { header: "Live Location Lat", accessor: "liveLocation.lat" },
  { header: "Live Location Lng", accessor: "liveLocation.lng" },
  { header: "Created At", accessor: "createdAt" },
  { header: "Updated At", accessor: "updatedAt" },
];

export default function DriversPage() {
  const partnerUid = useAuth().user?.uid ?? "";
  const {
    data: drivers = [],
    isLoading,
    error,
  } = useFetchDriverUsersQuery(partnerUid, { skip: !partnerUid });

  const [deleteDriver] = useDeleteDriverDocumentMutation();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

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

  return (
    <MainLayout>
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
            <AddDriverDialog />
          </div>
        </div>

        {/* Filters */}
        <DriversFilters
          onSearchChange={setSearch}
          onStatusChange={setStatus}
        />

        {/* Results count */}
        {!isLoading && !error && (
          <div className="text-sm text-muted-foreground">
            Showing {filteredDrivers.length} of {drivers.length} drivers
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-destructive">Failed to load drivers</p>
          </div>
        ) : (
          <DriversTable
            drivers={filteredDrivers}
            onDelete={async (uid) => {
              await deleteDriver(uid);
            }}
          />
        )}
      </div>
    </MainLayout>
  );
}
