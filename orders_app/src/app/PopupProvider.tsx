"use client";

import ReasonDialog from "../components/popups/ReasonDialog";
import CloseDayPopup from "../components/popups/CloseDayPopup";

const PopupProvider = ({
  children
}: {
  children: React.ReactNode
}) => {

  return (
    <>
      <ReasonDialog />
      <CloseDayPopup />
      {children}
    </>
  );
};

export default PopupProvider;
