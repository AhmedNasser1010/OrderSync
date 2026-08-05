"use client";

import { useCallback } from "react";
import {
  useClaimOrderMutation,
  useStartDeliveryMutation,
  useCompleteDeliveryMutation,
  useStartRouteMutation,
  useCancelOrderMutation,
  useFetchUserDataQuery,
} from "@/rtk/api/firestoreApi";
import { useAuth } from "@/contexts/AuthContext";
import { skipToken } from "@reduxjs/toolkit/query";

export function useOrderActions() {
  const { user } = useAuth();
  const { data: userData } = useFetchUserDataQuery(
    user?.uid ? { uid: user.uid } : skipToken,
  );

  const [claimOrder, { isLoading: isClaiming }] = useClaimOrderMutation();
  const [startDelivery, { isLoading: isStarting }] = useStartDeliveryMutation();
  const [completeDelivery, { isLoading: isCompleting }] = useCompleteDeliveryMutation();
  const [startRouteMutation, { isLoading: isStartingRoute }] = useStartRouteMutation();
  const [cancelOrder, { isLoading: isCanceling }] = useCancelOrderMutation();

  const skipStartRoute = userData?.skipStartRoute !== false;

  const claim = useCallback(
    async (orderId: string, driverUid: string) => {
      const result = await claimOrder({ orderId, driverUid });
      if ("error" in result) throw new Error("Failed to claim order");
    },
    [claimOrder],
  );

  const start = useCallback(
    async (orderId: string, driverUid: string) => {
      const result = await startDelivery({ orderId, driverUid, skipStartRoute });
      if ("error" in result) throw new Error("Failed to start delivery");
    },
    [startDelivery, skipStartRoute],
  );

  const startRoute = useCallback(
    async (orderId: string, driverUid: string) => {
      const result = await startRouteMutation({ orderId, driverUid });
      if ("error" in result) throw new Error("Failed to start route");
    },
    [startRouteMutation],
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
    startRoute,
    complete,
    cancel,
    isLoading: isClaiming || isStarting || isCompleting || isStartingRoute || isCanceling,
  };
}
