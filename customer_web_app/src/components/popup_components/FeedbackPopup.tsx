"use client";

import { useEffect, useState } from "react";
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
  useSetUserOrderIdToNullMutation,
  useFetchOrderTrackingDataQuery,
} from "@/rtk/api/firestoreApi";
import { setRateIsOpen } from "@/rtk/slices/toggleSlice";
import { skipToken } from "@reduxjs/toolkit/query";
import { Button } from "@/components/ui/button";

function FeedbackPopup() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.toggle.rateIsOpen);
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
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [setOrderFeedbackMutation] = useSetOrderFeedbackMutation();
  const [setUserOrderIdToNull] = useSetUserOrderIdToNullMutation();
  const t = useTranslations();

  const resetFeedbackForm = () => {
    setRating(0);
    setComment("");
  };

  const handleSubmit = () => {
    if ((rating <= 5 && rating >= 0) || comment) {
      const uid = user?.uid;
      const resId = user?.trackedOrder?.restaurant;
      setOrderFeedbackMutation({
        orderId: trackedOrderData?.id,
        uid,
        feedback: { rating, comment },
        resId,
      });
    }
    if (user?.uid) {
      setUserOrderIdToNull(user.uid);
    }
    dispatch(setRateIsOpen(false));
    resetFeedbackForm();
  };

  const handleClose = () => {
    if (user?.uid) {
      setUserOrderIdToNull(user.uid);
    }
    dispatch(setRateIsOpen(false));
    resetFeedbackForm();
  };

  useEffect(() => {
    if (!isOpen) {
      resetFeedbackForm();
    }
  }, [isOpen]);

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
          >
            {t("Submit Feedback")}
          </Button>
        </PopupFooter>
      </PopupContent>
    </Popup>
  );
}

export default FeedbackPopup;
