"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/rtk/hooks";
import { initRestaurants } from "@/rtk/slices/restaurantsSlice";
import type { BusinessDocument } from "@ordersync/types";

/**
 * Hydrates the Redux `restaurants` slice from server-fetched data so that
 * client-only consumers on the homepage (RestaurantSearch, OrderSidebar,
 * ReorderSection) keep working without triggering their own Firestore fetch.
 * Renders nothing.
 */
function RestaurantsHydrator({
  restaurants,
}: {
  restaurants: BusinessDocument[];
}) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (restaurants.length > 0) {
      dispatch(initRestaurants(restaurants));
    }
  }, [dispatch, restaurants]);

  return null;
}

export default RestaurantsHydrator;
