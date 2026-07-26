"use client";

import { useSyncExternalStore } from "react";

function getServerSnapshot() {
  return false;
}

function getSnapshot() {
  return localStorage.getItem("theme") === "dark";
}

function subscribe() {
  return () => {};
}

export function useHydrationSafeTheme() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
