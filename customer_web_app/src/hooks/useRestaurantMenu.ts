"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/rtk/hooks";
import { initMenu } from "@/rtk/slices/menuSlice";
import type { MenuState } from "@/rtk/slices/menuSlice";
import { useFetchMenuDataQuery } from "@/rtk/api/firestoreApi";
import { skipToken } from "@reduxjs/toolkit/query";

const useRestaurantMenu = (resId?: string | null) => {
  const dispatch = useAppDispatch();
  const { data } = useFetchMenuDataQuery(resId ? resId : skipToken);

  useEffect(() => {
    if (data) {
      dispatch(initMenu(data as unknown as MenuState));
    }
  }, [data, dispatch]);

  return data;
};

export default useRestaurantMenu;
