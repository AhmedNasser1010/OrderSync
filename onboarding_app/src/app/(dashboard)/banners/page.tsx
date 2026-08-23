"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { BannerFormDialog } from "@/components/banners/BannerFormDialog";
import { BannerPreview } from "@/components/banners/BannerPreview";
import { Button } from "@/components/ui/button";
import { ButtonGuard } from "@/components/ui/button-guard";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useFetchBannersQuery,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
} from "@/rtk/api/firestoreApi";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Megaphone,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { HeroBanner } from "@ordersync/types";

const COOLDOWN_DURATION = 5;

export default function BannersPage() {
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<HeroBanner | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HeroBanner | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);

  const {
    data: banners = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useFetchBannersQuery();
  const [updateBanner] = useUpdateBannerMutation();
  const [deleteBanner] = useDeleteBannerMutation();

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

  const sortedBanners = useMemo(
    () =>
      [...banners].sort(
        (a, b) => a.sortOrder - b.sortOrder || a.createdAt - b.createdAt
      ),
    [banners]
  );

  const nextSortOrder = useMemo(
    () =>
      sortedBanners.length
        ? Math.max(...sortedBanners.map((b) => b.sortOrder)) + 1
        : 0,
    [sortedBanners]
  );

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (banner: HeroBanner) => {
    setEditing(banner);
    setFormOpen(true);
  };

  const handleToggle = async (banner: HeroBanner) => {
    if (togglingId) return;
    setTogglingId(banner.id);
    try {
      await updateBanner({
        id: banner.id,
        updates: { active: !banner.active },
      }).unwrap();
    } finally {
      setTogglingId(null);
    }
  };

  const handleMove = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= sortedBanners.length || movingId) return;
    const a = sortedBanners[index];
    const b = sortedBanners[target];
    setMovingId(a.id);
    try {
      await updateBanner({
        id: a.id,
        updates: { sortOrder: b.sortOrder },
      }).unwrap();
      await updateBanner({
        id: b.id,
        updates: { sortOrder: a.sortOrder },
      }).unwrap();
    } finally {
      setMovingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBanner(deleteTarget.id).unwrap();
    } finally {
      setDeleteTarget(null);
    }
  };

  const activeCount = banners.filter((b) => b.active).length;

  return (
    <>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Homepage Banners
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage the scrollable offer &amp; announcement cards on the
            customer homepage hero.
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
          <Button className="gap-2" onClick={handleAdd}>
            <Plus className="h-4 w-4" />
            Add Banner
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>
          {banners.length} banner{banners.length === 1 ? "" : "s"} total
        </span>
        <span>·</span>
        <span className="text-foreground font-medium">
          {activeCount} active on homepage
        </span>
      </div>

      {isLoading ? (
        <Card className="p-12 bg-card border-border text-center text-muted-foreground">
          Loading banners...
        </Card>
      ) : isError ? (
        <Card className="p-12 bg-card border-border text-center text-destructive">
          Failed to load banners.
        </Card>
      ) : sortedBanners.length === 0 ? (
        <Card className="p-12 bg-card border-border text-center">
          <Megaphone className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="text-lg font-medium text-foreground mt-3">
            No banners yet
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Add your first banner to replace the default hero on the homepage.
          </p>
          <Button className="mt-4 gap-2" onClick={handleAdd}>
            <Plus className="h-4 w-4" />
            Add Banner
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {sortedBanners.map((banner, index) => {
            const isMoving = movingId === banner.id;
            return (
              <Card
                key={banner.id}
                className={cn(
                  "p-4 bg-card border-border space-y-3",
                  !banner.active && "opacity-60"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">#{banner.sortOrder}</Badge>
                    <Badge variant="secondary">Banner</Badge>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                    {togglingId === banner.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Switch
                        checked={banner.active}
                        onCheckedChange={() => handleToggle(banner)}
                      />
                    )}
                    {banner.active ? "Active" : "Hidden"}
                  </label>
                </div>

                <BannerPreview
                  data={{
                    imageUrl: banner.imageUrl,
                    href: banner.href,
                  }}
                  lang="en"
                  className="w-full"
                />

                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {banner.href || "No link set"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      Tap anywhere on the banner to open this link.
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={isMoving || index === 0}
                      onClick={() => handleMove(index, -1)}
                      title="Move up"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={isMoving || index === sortedBanners.length - 1}
                      onClick={() => handleMove(index, 1)}
                      title="Move down"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:bg-secondary/80"
                      onClick={() => handleEdit(banner)}
                      title="Edit banner"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteTarget(banner)}
                      title="Delete banner"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>

    <BannerFormDialog
      open={formOpen}
      onOpenChange={setFormOpen}
      banner={editing}
      defaultSortOrder={nextSortOrder}
    />

    <Dialog
      open={Boolean(deleteTarget)}
      onOpenChange={(open) => {
        if (!open) setDeleteTarget(null);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>Delete Banner?</DialogTitle>
              <DialogDescription className="mt-1">
                This will permanently remove this banner from the homepage.
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={() => setDeleteTarget(null)}
          >
            Cancel
          </Button>
          <ButtonGuard variant="destructive" onClick={handleDeleteConfirm}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Banner
          </ButtonGuard>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
