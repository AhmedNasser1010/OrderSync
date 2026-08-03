"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import {
  useFetchOrderTrackingDataQuery,
  useCancelOrderMutation,
  useSetOrderFeedbackMutation,
  useSetUserOrderIdToNullMutation,
  useFinalizePendingLoyaltyMutation,
} from "@/rtk/api/firestoreApi";
import {
  setRateIsOpen,
  setCancellationNoticeIsOpen,
} from "@/rtk/slices/toggleSlice";
import { clearCart } from "@/rtk/slices/cartSlice";
import { skipToken } from "@reduxjs/toolkit/query";

const useOrder = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);

  const { data: trackedOrderData } = useFetchOrderTrackingDataQuery(
    user?.trackedOrder?.restaurant && user?.trackedOrder?.id && user?.uid
      ? {
          resId: user.trackedOrder.restaurant,
          orderId: user.trackedOrder.id,
          uid: user.uid,
        }
      : skipToken
  );
  const hasOrder = useAppSelector((state) => state.toggle.hasOrder);
  const [cancelOrderMutation] = useCancelOrderMutation();
  const [setOrderFeedbackMutation] = useSetOrderFeedbackMutation();
  const [setUserOrderIdToNull] = useSetUserOrderIdToNullMutation();
  const [finalizePendingLoyalty] = useFinalizePendingLoyaltyMutation();
  const loyaltyMarkAttemptRef = useRef<string | null>(null);
  const feedbackDismissedOrderIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (
      trackedOrderData &&
      trackedOrderData?.status?.current === "DELIVERED"
    ) {
      const orderId = user?.trackedOrder?.id;
      dispatch(clearCart());

      if (orderId && loyaltyMarkAttemptRef.current !== orderId) {
        loyaltyMarkAttemptRef.current = orderId;
        finalizePendingLoyalty({
          uid: user?.uid,
          orderId,
        }).then(() => {
          loyaltyMarkAttemptRef.current = null;
        });
      }

      if (orderId && feedbackDismissedOrderIdRef.current !== orderId) {
        dispatch(setRateIsOpen(true));
      }
    } else {
      loyaltyMarkAttemptRef.current = null;
    }
  }, [trackedOrderData, user, dispatch, finalizePendingLoyalty]);

  useEffect(() => {
    if (
      trackedOrderData &&
      ["CANCELED", "REJECTED", "VOIDED"].includes(
        trackedOrderData?.status?.current ?? ""
      )
    ) {
      dispatch(clearCart());
      dispatch(setCancellationNoticeIsOpen(true));
      setUserOrderIdToNull(user?.uid);
    }
  }, [trackedOrderData, user, dispatch, setUserOrderIdToNull]);

  useEffect(() => {
    const pendingLoyalty = user?.trackedOrder?.pendingLoyalty;
    const orderId = pendingLoyalty?.orderId;

    if (hasOrder === false && orderId) {
      if (loyaltyMarkAttemptRef.current !== orderId) {
        loyaltyMarkAttemptRef.current = orderId as string;
        dispatch(clearCart());
        finalizePendingLoyalty({
          uid: user?.uid,
          orderId: orderId as string,
        }).finally(() => {
          loyaltyMarkAttemptRef.current = null;
        });
      }
      return;
    }

    if (hasOrder === false && user.trackedOrder?.id && !pendingLoyalty) {
      setUserOrderIdToNull(user?.uid);
    }
  }, [dispatch, finalizePendingLoyalty, hasOrder, user, setUserOrderIdToNull]);

  const cancelOrder = () => {
    if (trackedOrderData?.status?.current === "RECEIVED") {
      cancelOrderMutation({
        orderId: trackedOrderData?.id ?? "",
        uid: user?.uid,
      });
    }
  };

  const setOrderFeedback = (feedback: {
    rating: number;
    comment?: string;
  }) => {
    if ((feedback.rating <= 5 && feedback.rating >= 0) || feedback.comment) {
      const uid = user.uid;
      const resId = user?.trackedOrder?.restaurant;
      const orderData = trackedOrderData;
      setOrderFeedbackMutation({
        orderId: orderData?.id,
        uid,
        feedback,
        resId,
      });
    }
  };

  const dismissFeedback = async (orderId: string) => {
    if (orderId) {
      feedbackDismissedOrderIdRef.current = orderId;
    }

    if (user?.uid) {
      await setUserOrderIdToNull(user.uid);
    }

    dispatch(setRateIsOpen(false));
  };

  return {
    cancelOrder,
    trackedOrderData,
    setOrderFeedback,
    dismissFeedback,
  };
};

export default useOrder;
