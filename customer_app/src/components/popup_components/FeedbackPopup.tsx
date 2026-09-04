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
import {
  setRateIsOpen,
  setRateDismissedOrderId,
  setOrderSidebarIsOpen,
} from "@/rtk/slices/toggleSlice";
import { skipToken } from "@reduxjs/toolkit/query";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { CheckCircleIcon } from "lucide-react";

function FeedbackPopup() {
  const dispatch = useAppDispatch();
  const router = useRouter();
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
  const [submitted, setSubmitted] = useState(false);
  const [setOrderFeedbackMutation] = useSetOrderFeedbackMutation();
  const [clearTrackedOrder] = useClearTrackedOrderMutation();
  const t = useTranslations();
  // In-flight guard against duplicate feedback submissions (double click).
  const submitInFlightRef = useRef(false);

  const resetFeedbackForm = () => {
    setRating(0);
    setComment("");
  };

  const handleSubmit = async () => {
    if (submitInFlightRef.current) return;
    submitInFlightRef.current = true;
    setSubmitting(true);

    try {
      await setOrderFeedbackMutation({
        orderId: trackedOrderData?.id,
        uid: user?.uid,
        feedback: { rating, comment },
        resId: user?.trackedOrder?.restaurant,
      }).unwrap();
      const orderId = trackedOrderData?.id;
      if (orderId) {
        dispatch(setRateDismissedOrderId(orderId));
        if (user?.uid) {
          clearTrackedOrder({ uid: user.uid, orderId });
        }
      }
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting order feedback:", error);
    } finally {
      submitInFlightRef.current = false;
      setSubmitting(false);
    }
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
    setSubmitted(false);
  };

  const handleGoHome = () => {
    dispatch(setOrderSidebarIsOpen(false));
    handleClose();
    router.push("/");
  };

  return (
    <Popup open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <PopupContent>
        <PopupHeader closePopupCallback={handleClose}>
          {submitted ? (
            <>
              <div className="mx-auto mb-1 grid size-14 shrink-0 place-items-center rounded-full bg-color-11/10">
                <CheckCircleIcon className="size-7 text-color-11" />
              </div>
              <PopupTitle>{t("Thank You!")}</PopupTitle>
              <PopupDescription>
                {t("Thank you for your feedback")}
              </PopupDescription>
            </>
          ) : (
            <>
              <PopupTitle>{t("Rate this Restaurant!")}</PopupTitle>
              <PopupDescription>
                {t("feedbackThanksMessage")}
              </PopupDescription>
            </>
          )}
        </PopupHeader>

        {submitted ? (
          <PopupFooter>
            <Button
              className="bg-color-2 hover:bg-color-2/90 text-white h-10 px-6"
              onClick={handleGoHome}
            >
              {t("Go to Home Screen")}
            </Button>
          </PopupFooter>
        ) : (
          <>
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
          </>
        )}
      </PopupContent>
    </Popup>
  );
}

export default FeedbackPopup;
