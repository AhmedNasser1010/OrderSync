"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { getNextOpeningTime, isOpenNow } from "@ordersync/order-utils";
import { useAppSelector } from "@/rtk/hooks";
import { userUid } from "@/rtk/slices/constantsSlice";
import {
  useFetchUserDataQuery,
  useFetchRestaurantDataQuery,
  useSetOpenNowMutation,
} from "@/rtk/api/firestoreApi";
import { skipToken } from "@reduxjs/toolkit/query";
import type { BusinessDocument } from "@ordersync/types";

function isOutOfWorkingTime(
  openingHours?: BusinessDocument["operations"]["openingHours"],
  openNowUntil?: number,
): boolean {
  if (!openingHours) return false;
  return !isOpenNow(Date.now(), openingHours, openNowUntil);
}

function WorkingHoursBadge() {
  const t = useTranslations("Orders.header");
  const uid = useAppSelector(userUid);
  const [openNowOpen, setOpenNowOpen] = useState(false);
  const { data: userData } = useFetchUserDataQuery(uid ? uid : skipToken);
  const { data: restaurantData } = useFetchRestaurantDataQuery(
    userData?.accessToken ?? skipToken,
    { skip: !userData?.accessToken },
  );
  const [setOpenNow, { isLoading }] = useSetOpenNowMutation();

  const openingHours = restaurantData?.operations?.openingHours;
  const openNowUntil = restaurantData?.operations?.openNowUntil;
  const resId = restaurantData?.accessToken;

  if (!resId || !isOutOfWorkingTime(openingHours, openNowUntil)) {
    return null;
  }

  const handleOpenNow = async () => {
    try {
      const nextOpening = getNextOpeningTime(Date.now(), openingHours);
      const until = nextOpening ?? Date.now() + 60 * 60 * 1000;
      await setOpenNow({
        resId,
        openNowUntil: until,
      }).unwrap();
      setOpenNowOpen(false);
      toast.success(t("openNowSuccess"));
    } catch {
      toast.error(t("openNowError"));
    }
  };

  return (
    <AlertDialog open={openNowOpen} onOpenChange={setOpenNowOpen}>
      <button
        type="button"
        onClick={() => setOpenNowOpen(true)}
        className={cn(
          badgeVariants({ variant: "destructive" }),
          "cursor-pointer select-none gap-1.5",
        )}
      >
        <Clock className="h-3 w-3" />
        {t("outOfWorkingHours")}
      </button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("openNowTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("openNowDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("openNowCancel")}</AlertDialogCancel>
          <Button onClick={handleOpenNow} disabled={isLoading} className="gap-2">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("openNowAction")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default WorkingHoursBadge;
