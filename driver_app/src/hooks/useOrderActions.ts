"use client";

import { useCallback } from "react";
import {
  useClaimOrderMutation,
  useStartDeliveryMutation,
  useCompleteDeliveryMutation,
  useCancelOrderMutation,
} from "@/rtk/api/firestoreApi";

export function useOrderActions() {
  const [claimOrder, { isLoading: isClaiming }] = useClaimOrderMutation();
  const [startDelivery, { isLoading: isStarting }] = useStartDeliveryMutation();
  const [completeDelivery, { isLoading: isCompleting }] = useCompleteDeliveryMutation();
  const [cancelOrder, { isLoading: isCanceling }] = useCancelOrderMutation();

  const claim = useCallback(
    async (orderId: string, driverUid: string) => {
      const result = await claimOrder({ orderId, driverUid });
      if ("error" in result) throw new Error("Failed to claim order");
    },
    [claimOrder],
  );

  const start = useCallback(
    async (orderId: string, driverUid: string) => {
      const result = await startDelivery({ orderId, driverUid });
      if ("error" in result) throw new Error("Failed to start delivery");
    },
    [startDelivery],
  );

  const complete = useCallback(
    async (orderId: string, driverUid: string) => {
      const result = await completeDelivery({ orderId, driverUid });
      if ("error" in result) throw new Error("Failed to complete delivery");
    },
    [completeDelivery],
  );

  const cancel = useCallback(
    async (orderId: string, driverUid: string) => {
      const result = await cancelOrder({ orderId, driverUid });
      if ("error" in result) throw new Error("Failed to cancel order");
    },
    [cancelOrder],
  );

  return {
    claim,
    start,
    complete,
    cancel,
    isLoading: isClaiming || isStarting || isCompleting || isCanceling,
  };
}
