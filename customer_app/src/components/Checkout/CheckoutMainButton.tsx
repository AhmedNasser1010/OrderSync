"use client";

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
  const handleNext = () => {
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
