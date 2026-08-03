"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

const ImageViewer = ({
  src,
  alt,
  open,
  onClose,
}: {
  src?: string;
  alt?: string;
  open: boolean;
  onClose: () => void;
}) => {
  const t = useTranslations();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.classList.add("overflow-hidden");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("overflow-hidden");
    };
  }, [open, onClose]);

  if (!open || !src) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt || t("Menu")}
      onClick={onClose}
      className="fixed inset-0 z-[60] grid cursor-zoom-out place-items-center bg-black/95 p-4 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={t("Close")}
        className="absolute top-4 end-4 grid size-11 cursor-pointer place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-white/60 outline-none"
      >
        <X className="size-6" />
      </button>
      <img
        src={src}
        alt={alt || "menu-img"}
        onClick={(e) => e.stopPropagation()}
        className="max-h-full max-w-full cursor-default rounded-xl object-contain shadow-2xl animate-in zoom-in-95 duration-200"
      />
    </div>
  );
};

export default ImageViewer;
