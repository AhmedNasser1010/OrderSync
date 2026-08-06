"use client";

import { useEffect } from "react";
import {
  SerwistProvider as BaseSerwistProvider,
  useSerwist,
} from "@serwist/turbopack/react";

export function SerwistProvider({
  disable,
  reloadOnOnline,
  ...props
}: React.ComponentProps<typeof BaseSerwistProvider>) {
  useEffect(() => {
    if (!disable) return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        if (registrations.length) {
          return Promise.all(
            registrations.map((registration) => registration.unregister())
          );
        }
      })
      .catch(() => {});
  }, [disable]);

  return (
    <BaseSerwistProvider
      disable={disable}
      reloadOnOnline={disable ? false : reloadOnOnline}
      {...props}
    />
  );
}

export { useSerwist };
