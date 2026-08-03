"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const Popup = DialogPrimitive.Root;

function PopupTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="popup-trigger" {...props} />;
}

function PopupClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="popup-close" {...props} />;
}

function PopupPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="popup-portal" {...props} />;
}

function PopupOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="popup-overlay"
      className={cn(
        "fixed inset-0 isolate z-[60] bg-black/40 duration-100 supports-backdrop-filter:backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  );
}

function PopupContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <PopupPortal>
      <PopupOverlay />
      <DialogPrimitive.Content
        data-slot="popup-content"
        className={cn(
          "popup-anim fixed top-1/2 left-1/2 z-[61] grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-card p-5 text-sm text-color-1 shadow-2xl outline-none sm:max-w-sm",
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </PopupPortal>
  )
}

function PopupHeader({
  className,
  closePopupCallback,
  children,
  ...props
}: React.ComponentProps<"div"> & { closePopupCallback?: () => void }) {
  return (
    <div
      data-slot="popup-header"
      className={cn("relative flex flex-col gap-2 text-center", className)}
      {...props}
    >
      {closePopupCallback && (
        <button
          type="button"
          onClick={closePopupCallback}
          className="absolute -top-1 -right-2 cursor-pointer text-3xl text-color-6 hover:text-color-1"
          aria-label="Close"
        >
          <XIcon className="size-6" />
        </button>
      )}
      {children}
    </div>
  );
}

function PopupTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="popup-title"
      className={cn(
        "font-ProximaNovaSemiBold text-lg text-color-1 leading-snug",
        className
      )}
      {...props}
    />
  );
}

function PopupDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="popup-description"
      className={cn(
        "font-ProximaNovaRegular text-sm text-color-6 leading-relaxed",
        className
      )}
      {...props}
    />
  );
}

function PopupFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popup-footer"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

export {
  Popup,
  PopupTrigger,
  PopupClose,
  PopupPortal,
  PopupOverlay,
  PopupContent,
  PopupHeader,
  PopupTitle,
  PopupDescription,
  PopupFooter,
};
