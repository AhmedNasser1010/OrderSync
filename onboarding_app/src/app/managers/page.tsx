"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { RefreshCw, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/rtk/hooks";
import { selectUser } from "@/rtk/slices/authSlice";
import {
  useFetchManagersQuery,
  useDeleteManagerMutation,
} from "@/rtk/api/firestoreApi";
import { ManagersTable } from "@/components/dashboard/ManagersTable";
import { useMemo, useState, useCallback, useEffect, useRef } from "react";

const COOLDOWN_DURATION = 5;

export default function ManagersPage() {
  const authUser = useAppSelector(selectUser);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    data: managers = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useFetchManagersQuery(authUser?.uid ?? "", {
    skip: !authUser?.uid,
  });

  const [deleteManager] = useDeleteManagerMutation();

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

  const handleDelete = async (uid: string) => {
    await deleteManager(uid).unwrap();
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Managers</h1>
            <p className="text-muted-foreground mt-1">
              View and manage all your business managers
            </p>
          </div>
          <div className="flex items-center gap-2">
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

        {/* Managers Table */}
        <ManagersTable
          managers={managers}
          onDelete={handleDelete}
          isLoading={isLoading}
          isError={isError}
        />
      </div>
    </MainLayout>
  );
}
