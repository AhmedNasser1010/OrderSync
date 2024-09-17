"use client";

import DeleteOrderPopup from "../components/popups/DeleteOrderPopup";
import CloseDayPopup from "../components/popups/CloseDayPopup";

const PopupProvider = ({
  children
}: {
  children: React.ReactNode
}) => {

  return (
    <>
      <DeleteOrderPopup />
      <CloseDayPopup />
      {children}
    </>
  );
};

export default PopupProvider;
