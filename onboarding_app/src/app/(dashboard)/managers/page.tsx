"use client";

import { ExportButton } from "@/components/dashboard/ExportButton";
import { ManagersFilters } from "@/components/dashboard/ManagersFilters";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  useFetchManagersQuery,
  useDeleteManagerMutation,
} from "@/rtk/api/firestoreApi";
import { ManagersTable } from "@/components/dashboard/ManagersTable";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import type { ExportColumn } from "@/lib/export-utils";

const COOLDOWN_DURATION = 5;
const PAGE_SIZE = 15;

const managerColumns: ExportColumn[] = [
  { header: "UID", accessor: "uid" },
  { header: "Name", accessor: "userInfo.name" },
  { header: "Email", accessor: "userInfo.email" },
  { header: "Phone", accessor: "userInfo.phone" },
  { header: "Second Phone", accessor: "userInfo.secondPhone" },
  { header: "Access Token", accessor: "accessToken" },
  { header: "Provider", accessor: "userInfo.provider" },
  { header: "Created At", accessor: "createdAt" },
  { header: "Updated At", accessor: "updatedAt" },
];

export default function ManagersPage() {
  const authUser = useAuth().user;
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);

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

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleRoleChange = useCallback((value: string) => {
    setRole(value);
    setPage(1);
  }, []);

  const filteredManagers = useMemo(() => {
    return managers.filter((manager) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        !search ||
        manager.userInfo?.name?.toLowerCase().includes(searchLower) ||
        manager.userInfo?.email?.toLowerCase().includes(searchLower) ||
        manager.userInfo?.phone?.includes(search);

      const matchesRole =
        !role || role === "all" || manager.userInfo?.role === role;

      return matchesSearch && matchesRole;
    });
  }, [managers, search, role]);

  const totalPages = Math.ceil(filteredManagers.length / PAGE_SIZE);
  const safePage = Math.min(page, totalPages || 1);
  const paginatedManagers = filteredManagers.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const handleDelete = async (uid: string) => {
    await deleteManager(uid).unwrap();
  };

  return (
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
          <ExportButton
            data={filteredManagers as unknown as Record<string, unknown>[]}
            columns={managerColumns}
            filename="managers"
            sheetName="Managers"
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

      {/* Filters */}
      <ManagersFilters
        onSearchChange={handleSearchChange}
        onRoleChange={handleRoleChange}
      />

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredManagers.length} of {managers.length} managers
      </div>

      {/* Managers Table */}
      <ManagersTable
        managers={paginatedManagers}
        onDelete={handleDelete}
        isLoading={isLoading}
        isError={isError}
      />

      {/* Pagination */}
      {filteredManagers.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            {(safePage - 1) * PAGE_SIZE + 1}–
            {Math.min(safePage * PAGE_SIZE, filteredManagers.length)} of{" "}
            {filteredManagers.length} managers
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
