"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";

interface AlertDialogProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface AlertDialogContentProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertDialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertDialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertDialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertDialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

const AlertDialogContext = React.createContext<{
  open: boolean;
  onOpenChange?: (open: boolean) => void;
} | null>(null);

function AlertDialog({ children, open, onOpenChange }: AlertDialogProps) {
  return (
    <AlertDialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </AlertDialogContext.Provider>
  );
}

function AlertDialogContent({
  children,
  className = "",
}: AlertDialogContentProps) {
  const context = React.useContext(AlertDialogContext);
  const { open, onOpenChange } = context || {};

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
      onClick={() => onOpenChange?.(false)}
    >
      <div
        className={`relative w-full max-w-md bg-card border border-border rounded-lg p-6 shadow-lg mx-4 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

function AlertDialogHeader({
  children,
  className = "",
}: AlertDialogHeaderProps) {
  return <div className={`mb-2 ${className}`}>{children}</div>;
}

function AlertDialogFooter({
  children,
  className = "",
}: AlertDialogFooterProps) {
  return (
    <div
      className={`flex items-center justify-end gap-2 mt-6 pt-4 border-t border-border ${className}`}
    >
      {children}
    </div>
  );
}

function AlertDialogTitle({ children, className = "" }: AlertDialogTitleProps) {
  return (
    <h2 className={`text-lg font-semibold text-foreground ${className}`}>
      {children}
    </h2>
  );
}

function AlertDialogDescription({
  children,
  className = "",
}: AlertDialogDescriptionProps) {
  return (
    <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>
  );
}

function AlertDialogCancel({
  children,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const context = React.useContext(AlertDialogContext);
  return (
    <Button
      variant="outline"
      onClick={(e) => {
        onClick?.(e);
        context?.onOpenChange?.(false);
      }}
      {...props}
    >
      {children}
    </Button>
  );
}

function AlertDialogAction({
  children,
  onClick,
  variant = "destructive",
  ...props
}: React.ComponentProps<typeof Button> & { variant?: React.ComponentProps<typeof Button>["variant"] }) {
  const context = React.useContext(AlertDialogContext);
  return (
    <Button
      variant={variant}
      onClick={(e) => {
        onClick?.(e);
        context?.onOpenChange?.(false);
      }}
      {...props}
    >
      {children}
    </Button>
  );
}

export {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
};
