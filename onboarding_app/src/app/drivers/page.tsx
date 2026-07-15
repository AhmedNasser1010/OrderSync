"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import {
  useFetchDriverUsersQuery,
  useDeleteDriverDocumentMutation,
} from "@/rtk/api/firestoreApi";
import { useAppSelector } from "@/rtk/hooks";
import { selectUser } from "@/rtk/slices/authSlice";
import { Loader2 } from "lucide-react";
import { DriversTable } from "@/components/dashboard/DriversTable";
import { AddDriverDialog } from "@/components/dashboard/AddDriverDialog";

export default function DriversPage() {
  const partnerUid = useAppSelector(selectUser)?.uid ?? "";
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
          <AddDriverDialog />
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
