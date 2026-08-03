"use client";

const MenuPopup = ({
  title,
  description,
  visibility,
  closeCallback,
  callbackFunc = null,
  noLabel = "CLOSE",
  yesLabel = "OKAY",
}: {
  title: string;
  description: string;
  visibility: boolean;
  closeCallback: () => void;
  callbackFunc?: (() => void) | null;
  noLabel?: string;
  yesLabel?: string | null;
}) => {
  if (!visibility) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm popup-anim"
        onClick={closeCallback}
      />
      <div className="popup-anim relative flex w-full max-w-md flex-col rounded-2xl bg-card p-6 shadow-2xl">
        <h3 className="font-ProximaNovaSemiBold text-xl text-color-1">
          {title}
        </h3>
        <p className="py-3 font-ProximaNovaThin text-sm leading-relaxed text-color-6">
          {description}
        </p>
        <div className="mt-2 flex justify-end gap-3 font-ProximaNovaSemiBold text-sm">
          <button
            onClick={closeCallback}
            className="rounded-xl border border-color-7 px-6 py-2.5 text-color-6 transition-colors hover:bg-color-7/40 cursor-pointer"
          >
            {noLabel}
          </button>
          {callbackFunc && (
            <button
              onClick={callbackFunc}
              className="rounded-xl bg-color-11 px-6 py-2.5 text-white transition-colors hover:bg-color-11/90 cursor-pointer"
            >
              {yesLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuPopup;
