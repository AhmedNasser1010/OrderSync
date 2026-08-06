"use client";

import { useRef } from "react";

const CheckoutMainButton = ({
  nextLabel = "Next",
  backLabel = "Back",
  nextBtnIsDisable = false,
  nextEventCallback = () => null,
  backEventCallback,
}: {
  nextLabel?: string;
  backLabel?: string;
  nextBtnIsDisable?: boolean;
  nextEventCallback?: () => unknown;
  backEventCallback?: () => void;
}) => {
  // Prevent the next/place button from firing twice on rapid mouseup events
  // (e.g. double-click or mouseup+click sequences) before React re-renders.
  const lastNextAtRef = useRef(0);

  const handleNext = () => {
    const now = Date.now();
    if (now - lastNextAtRef.current < 300) return;
    lastNextAtRef.current = now;
    if (!nextBtnIsDisable) {
      nextEventCallback();
    }
  };

  return (
    <div className="w-full flex items-stretch justify-between gap-2">
      {backEventCallback && (
        <button
          onMouseUp={backEventCallback}
          className="p-[10px] border border-input rounded cursor-pointer w-full text-center flex items-center justify-center transition hover:bg-muted"
        >
          {backLabel}
        </button>
      )}
      <button
        type="submit"
        onMouseUp={handleNext}
        className={`p-[10px] rounded cursor-pointer w-full text-center flex items-center justify-center transition text-white ${
          nextBtnIsDisable ? "bg-black/45" : "bg-color-11 hover:brightness-95"
        }`}
      >
        {nextLabel}
      </button>
    </div>
  );
};

export default CheckoutMainButton;
