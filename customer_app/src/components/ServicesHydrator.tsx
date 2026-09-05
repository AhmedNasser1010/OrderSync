"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/rtk/hooks";
import { initServices } from "@/rtk/slices/servicesSlice";
import { initWallet } from "@/rtk/slices/walletSlice";
import {
  useFetchServicesQuery,
  useFetchWalletBalanceQuery,
} from "@/rtk/api/firestoreApi";
import { useAuthSession } from "@/hooks/useAuthSession";

/**
 * App-wide hydration of platform config that used to live in `Header`.
 * After the homepage redesign the layout renders `HomeHeader`, so the old
 * `Header` (the only place dispatching `initServices`) is never mounted and
 * the services slice stays `{}` — making the client price delivery fees with
 * hardcoded fallbacks while the server uses the real `services/platform`
 * document, which every order is rejected with PRICE_MISMATCH.
 */
function ServicesHydrator() {
  const dispatch = useAppDispatch();
  const { uid, isAuthenticated } = useAuthSession();

  const { data: servicesConfig } = useFetchServicesQuery();

  const { data: walletBalance } = useFetchWalletBalanceQuery(uid ?? "", {
    skip: !uid,
  });

  useEffect(() => {
    if (servicesConfig) {
      dispatch(
        initServices({
          deliveryFees: servicesConfig.deliveryFees,
          minDeliveryFees: servicesConfig.minDeliveryFees,
          maxWorkDistanceKm: servicesConfig.maxWorkDistanceKm,
          cashback: servicesConfig.cashback,
          maintenance: servicesConfig.maintenance,
        })
      );
    }
  }, [servicesConfig, dispatch]);

  useEffect(() => {
    if (isAuthenticated && uid) {
      dispatch(initWallet({ balance: walletBalance ?? 0 }));
    }
  }, [isAuthenticated, uid, walletBalance, dispatch]);

  return null;
}

export default ServicesHydrator;