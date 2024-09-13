"use client";

import DeleteOrderPopup from "./DeleteOrderPopup";

const PopupProvider = ({
  children
}: {
  children: React.ReactNode
}) => {

  return (
    <>
      <DeleteOrderPopup />
      {children}
    </>
  );
};

export default PopupProvider;
