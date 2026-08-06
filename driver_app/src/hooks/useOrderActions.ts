"use client";

import { useCallback } from "react";
import {
  useClaimOrderMutation,
  useStartDeliveryMutation,
  useCompleteDeliveryMutation,
  useStartRouteMutation,
  useReleaseOrderMutation,
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
  const [releaseOrder, { isLoading: isReleasing }] = useReleaseOrderMutation();

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

  const release = useCallback(
    async (orderId: string, driverUid: string) => {
      const result = await releaseOrder({ orderId, driverUid });
      if ("error" in result) throw new Error("Failed to return order to ready");
    },
    [releaseOrder],
  );

  return {
    claim,
    start,
    startRoute,
    complete,
    release,
    isLoading: isClaiming || isStarting || isCompleting || isStartingRoute || isReleasing,
  };
}
