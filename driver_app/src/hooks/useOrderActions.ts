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
import { useActionGuard } from "@/hooks/useActionGuard";
import { useAuth } from "@/contexts/AuthContext";
import { skipToken } from "@reduxjs/toolkit/query";

const keyFor = (action: string, orderId: string) => `${action}:${orderId}`;

export function useOrderActions() {
  const { user } = useAuth();
  const { data: userData } = useFetchUserDataQuery(
    user?.uid ? { uid: user.uid } : skipToken,
  );

  const guard = useActionGuard();

  const [claimOrder, { isLoading: isClaiming }] = useClaimOrderMutation();
  const [startDelivery, { isLoading: isStarting }] = useStartDeliveryMutation();
  const [completeDelivery, { isLoading: isCompleting }] = useCompleteDeliveryMutation();
  const [startRouteMutation, { isLoading: isStartingRoute }] = useStartRouteMutation();
  const [releaseOrder, { isLoading: isReleasing }] = useReleaseOrderMutation();

  const skipStartRoute = userData?.skipStartRoute !== false;

  const claim = useCallback(
    async (orderId: string, driverUid: string) => {
      const key = keyFor("claim", orderId);
      if (!guard.begin(key)) return; // duplicate / already in-flight
      try {
        const result = await claimOrder({ orderId, driverUid });
        if ("error" in result) throw new Error("Failed to claim order");
      } finally {
        guard.end(key);
      }
    },
    [guard, claimOrder],
  );

  const start = useCallback(
    async (orderId: string, driverUid: string) => {
      const key = keyFor("start", orderId);
      if (!guard.begin(key)) return;
      try {
        const result = await startDelivery({ orderId, driverUid, skipStartRoute });
        if ("error" in result) throw new Error("Failed to start delivery");
      } finally {
        guard.end(key);
      }
    },
    [guard, startDelivery, skipStartRoute],
  );

  const startRoute = useCallback(
    async (orderId: string, driverUid: string) => {
      const key = keyFor("startRoute", orderId);
      if (!guard.begin(key)) return;
      try {
        const result = await startRouteMutation({ orderId, driverUid });
        if ("error" in result) throw new Error("Failed to start route");
      } finally {
        guard.end(key);
      }
    },
    [guard, startRouteMutation],
  );

  const complete = useCallback(
    async (orderId: string, driverUid: string) => {
      const key = keyFor("complete", orderId);
      if (!guard.begin(key)) return;
      try {
        const result = await completeDelivery({ orderId, driverUid });
        if ("error" in result) throw new Error("Failed to complete delivery");
      } finally {
        guard.end(key);
      }
    },
    [guard, completeDelivery],
  );

  const release = useCallback(
    async (orderId: string, driverUid: string) => {
      const key = keyFor("release", orderId);
      if (!guard.begin(key)) return;
      try {
        const result = await releaseOrder({ orderId, driverUid });
        if ("error" in result) throw new Error("Failed to return order to ready");
      } finally {
        guard.end(key);
      }
    },
    [guard, releaseOrder],
  );

  return {
    claim,
    start,
    startRoute,
    complete,
    release,
    /** True while ANY order action is in-flight (backward-compatible aggregate). */
    isLoading: isClaiming || isStarting || isCompleting || isStartingRoute || isReleasing || guard.isAnyLocked,
    /** Reactive: is any order-state action currently locked for this order? */
    isLocked: guard.isLocked,
  };
}

