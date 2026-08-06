"use client";

import * as React from "react";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useClickGuard } from "@/hooks/useClickGuard";

/**
 * ButtonGuard
 *
 * A drop-in wrapper around `<Button>` that prevents button abuse:
 * - While an `onClick` handler is in-flight (or within `cooldown` ms), the
 *   button is disabled and further clicks are ignored.
 * - Optionally shows a small spinner via `busyLabel`.
 */
interface ButtonGuardProps
  extends React.ComponentProps<typeof Button> {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => unknown;
  cooldown?: number;
  busyLabel?: string;
  showSpinner?: boolean;
}

function ButtonGuard({
  onClick,
  cooldown = 800,
  busyLabel,
  showSpinner = true,
  disabled,
  className,
  children,
  ...props
}: ButtonGuardProps) {
  const { run, busy } = useClickGuard(
    onClick ?? (async () => undefined),
    { cooldown, resetOnError: true }
  );

  return (
    <Button
      {...props}
      disabled={disabled || busy}
      aria-busy={busy}
      className={cn(className)}
      onClick={(event) => {
        void run(event as never);
      }}
    >
      {showSpinner && busy ? (
        <>
          <Loader2Icon className="size-4 animate-spin" />
          {busyLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

export { ButtonGuard };
