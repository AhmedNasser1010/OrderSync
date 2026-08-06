"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import {
  Popup,
  PopupContent,
  PopupHeader,
  PopupFooter,
  PopupTitle,
  PopupDescription,
} from "@/components/ui/custom/Popup";
import RatingWithComment from "@/components/RatingWithComment";
import {
  useSetOrderFeedbackMutation,
  useClearTrackedOrderMutation,
  useFetchOrderTrackingDataQuery,
} from "@/rtk/api/firestoreApi";
import { setRateIsOpen, setRateDismissedOrderId } from "@/rtk/slices/toggleSlice";
import { skipToken } from "@reduxjs/toolkit/query";
import { Button } from "@/components/ui/button";

function FeedbackPopup() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.toggle.rateIsOpen);
  const user = useAppSelector((state) => state.user);
  const { currentData: trackedOrderData } = useFetchOrderTrackingDataQuery(
    user?.trackedOrder?.restaurant && user?.trackedOrder?.id && user?.uid
      ? {
          resId: user.trackedOrder.restaurant,
          orderId: user.trackedOrder.id,
          uid: user.uid,
        }
      : skipToken
  );
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [setOrderFeedbackMutation] = useSetOrderFeedbackMutation();
  const [clearTrackedOrder] = useClearTrackedOrderMutation();
  const t = useTranslations();
  // In-flight guard against duplicate feedback submissions (double click).
  const submitInFlightRef = useRef(false);

  const resetFeedbackForm = () => {
    setRating(0);
    setComment("");
  };

  const handleSubmit = () => {
    if (submitInFlightRef.current) return;
    submitInFlightRef.current = true;
    setSubmitting(true);

    if ((rating <= 5 && rating >= 0) || comment) {
      const uid = user?.uid;
      const resId = user?.trackedOrder?.restaurant;
      setOrderFeedbackMutation({
        orderId: trackedOrderData?.id,
        uid,
        feedback: { rating, comment },
        resId,
      })
        .finally(() => {
          submitInFlightRef.current = false;
          setSubmitting(false);
        });
    }
    const orderId = trackedOrderData?.id;
    if (orderId) {
      dispatch(setRateDismissedOrderId(orderId));
      if (user?.uid) {
        clearTrackedOrder({ uid: user.uid, orderId });
      }
    }
    dispatch(setRateIsOpen(false));
    resetFeedbackForm();
  };

  const handleClose = () => {
    const orderId = trackedOrderData?.id;
    if (orderId) {
      dispatch(setRateDismissedOrderId(orderId));
      if (user?.uid) {
        clearTrackedOrder({ uid: user.uid, orderId });
      }
    }
    dispatch(setRateIsOpen(false));
    resetFeedbackForm();
  };

  return (
    <Popup open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <PopupContent>
        <PopupHeader closePopupCallback={handleClose}>
          <PopupTitle>{t("Rate this Restaurant!")}</PopupTitle>
          <PopupDescription>
            {t("feedbackThanksMessage")}
          </PopupDescription>
        </PopupHeader>

        <RatingWithComment
          rating={rating}
          setRating={setRating}
          comment={comment}
          setComment={setComment}
        />

        <PopupFooter>
          <Button
            className="bg-color-2 hover:bg-color-2/90 text-white h-10 px-6"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {t("Submit Feedback")}
          </Button>
        </PopupFooter>
      </PopupContent>
    </Popup>
  );
}

export default FeedbackPopup;
