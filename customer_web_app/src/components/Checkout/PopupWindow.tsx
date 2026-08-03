"use client";

import { useState } from "react";

const PopupWindow = ({
  children,
  isOpen,
  onWindowClose,
}: {
  children: React.ReactNode;
  isOpen: boolean;
  onWindowClose: () => void;
}) => {
  const [windowIsOpen, setWindowIsOpen] = useState(isOpen);

  const handleOnClose = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).classList.contains("wrapper")) {
      onWindowClose();
      setWindowIsOpen(false);
    }
  };

  return (
    <>
      {windowIsOpen && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black/20 wrapper"
          onMouseUp={handleOnClose}
        >
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card p-5 rounded-lg">
            {children}
          </div>
        </div>
      )}
    </>
  );
};

export default PopupWindow;
