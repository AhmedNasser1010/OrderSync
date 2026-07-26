"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import {
  useFetchDriverUsersQuery,
  useDeleteDriverDocumentMutation,
} from "@/rtk/api/firestoreApi";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { DriversTable } from "@/components/dashboard/DriversTable";
import { AddDriverDialog } from "@/components/dashboard/AddDriverDialog";
import { ExportButton } from "@/components/dashboard/ExportButton";
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
    data: drivers,
    isLoading,
    error,
  } = useFetchDriverUsersQuery(partnerUid, { skip: !partnerUid });

  const [deleteDriver] = useDeleteDriverDocumentMutation();

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
              data={(drivers ?? []) as unknown as Record<string, unknown>[]}
              columns={driverColumns}
              filename="drivers"
              sheetName="Drivers"
            />
            <AddDriverDialog />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-destructive">Failed to load drivers</p>
          </div>
        ) : !drivers || drivers.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-muted-foreground">No drivers found</p>
          </div>
        ) : (
          <DriversTable drivers={drivers} onDelete={async (uid) => { await deleteDriver(uid); }} />
        )}
      </div>
    </MainLayout>
  );
}
