"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/rtk/hooks";
import { initRestaurants } from "@/rtk/slices/restaurantsSlice";
import { useFetchBusinessesQuery } from "@/rtk/api/firestoreApi";
import type { BusinessDocument } from "@ordersync/types";

const useRestaurants = () => {
  const dispatch = useAppDispatch();
  const { data, isLoading, isFetching } = useFetchBusinessesQuery();

  useEffect(() => {
    if (Array.isArray(data) && data.length) {
      dispatch(initRestaurants(data as BusinessDocument[]));
    }
  }, [data, dispatch]);

  return { isLoading, isFetching };
};

export default useRestaurants;
