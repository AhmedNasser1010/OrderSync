"use client";

import * as React from "react";
import { X } from "lucide-react";

interface DialogProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
  hideCloseButton?: boolean;
}

interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

const DialogContext = React.createContext<{
  open: boolean;
  onOpenChange?: (open: boolean) => void;
} | null>(null);

function Dialog({ children, open, onOpenChange }: DialogProps) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

function DialogContent({
  children,
  className = "",
  hideCloseButton = false,
}: DialogContentProps) {
  const context = React.useContext(DialogContext);
  const { open, onOpenChange } = context || {};

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className={`w-full max-w-md bg-card border border-border rounded-lg p-6 shadow-lg mx-4 ${className}`}
      >
        {!hideCloseButton && onOpenChange && (
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 p-1 hover:bg-muted rounded-md transition-colors"
          >
            <X size={18} />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

function DialogHeader({ children, className = "" }: DialogHeaderProps) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

function DialogFooter({ children, className = "" }: DialogFooterProps) {
  return (
    <div className={`flex items-center mt-6 pt-4 border-t border-border ${className}`}>
      {children}
    </div>
  );
}

function DialogTitle({ children, className = "" }: DialogTitleProps) {
  return (
    <h2 className={`text-lg font-semibold text-foreground ${className}`}>
      {children}
    </h2>
  );
}

function DialogDescription({ children, className = "" }: DialogDescriptionProps) {
  return (
    <p className={`text-sm text-muted-foreground ${className}`}>
      {children}
    </p>
  );
}

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};