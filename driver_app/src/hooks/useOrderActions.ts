"use client";

import { useCallback } from "react";
import { useSetOrderStatusMutation } from "@/rtk/api/firestoreApi";

export function useOrderActions() {
  const [setOrderStatus, { isLoading }] = useSetOrderStatusMutation();

  const pickUpOrder = useCallback(
    async (orderId: string, compositeOrderId: string, accessToken: string, driverUid: string) => {
      const result = await setOrderStatus({
        orderId,
        compositeOrderId,
        accessToken,
        status: "ON_ROUTE",
        driverUid,
      });
      if ("error" in result) {
        throw new Error("Failed to pick up order");
      }
    },
    [setOrderStatus],
  );

  return { pickUpOrder, isLoading };
}
