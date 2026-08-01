"use client";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "@/rtk/store";
import { hydrateCart } from "@/rtk/slices/cartSlice";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [store] = useState<AppStore>(() => makeStore());

  useEffect(() => {
    store.dispatch(hydrateCart());
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
