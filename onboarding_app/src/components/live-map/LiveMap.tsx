"use client";

import { useState, useMemo, useCallback } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { useAuth } from "@/contexts/AuthContext";
import { useAppSelector } from "@/rtk/hooks";
import {
  useFetchUserDataQuery,
  useFetchBusinessesQuery,
  useFetchDriverUsersQuery,
  useFetchCustomersQuery,
  useFetchActiveOrdersQuery,
} from "@/rtk/api/firestoreApi";
import { useLiveDriverLocations } from "@/hooks/useLiveDriverLocations";
import { FitBounds } from "./FitBounds";
import { MapMarkers } from "./MapMarkers";
import { FilterPanel, type FilterVisibility } from "./FilterPanel";
import { MapLegend } from "./MapLegend";
import { MapStatsBar } from "./MapStatsBar";

const DEFAULT_CENTER: [number, number] = [30.0444, 31.2357];
const DEFAULT_ZOOM = 12;

export function LiveMap() {
  const partnerUid = useAuth().user?.uid ?? "";
  const isDark = useAppSelector((state) => state.ui.isDark);

  const [visible, setVisible] = useState<FilterVisibility>({
    drivers: true,
    customers: true,
    restaurants: true,
    orders: true,
  });

  const { data: userData } = useFetchUserDataQuery(partnerUid, {
    skip: !partnerUid,
  });

  const businessTokens = userData?.data?.businesses ?? [];

  const { data: businesses = [], refetch: refetchBusinesses } =
    useFetchBusinessesQuery(businessTokens, { skip: !businessTokens.length });

  const { data: drivers = [], refetch: refetchDrivers } =
    useFetchDriverUsersQuery(partnerUid, { skip: !partnerUid });

  const { data: customers = [], refetch: refetchCustomers } =
    useFetchCustomersQuery(partnerUid, { skip: !partnerUid });

  const { data: orders = [], refetch: refetchOrders } =
    useFetchActiveOrdersQuery(businessTokens, { skip: !businessTokens.length });

  const driverLocations = useLiveDriverLocations(partnerUid);

  const counts = useMemo(
    () => ({
      drivers: driverLocations.size || drivers.length,
      customers: customers.length,
      restaurants: businesses.length,
      orders: orders.length,
    }),
    [driverLocations.size, drivers.length, customers.length, businesses.length, orders.length]
  );

  const onlineDrivers = useMemo(
    () =>
      drivers.filter((d) => d.online?.byUser || d.online?.byManager).length,
    [drivers]
  );

  const fitPoints = useMemo(() => {
    const points: [number, number][] = [];

    if (visible.drivers) {
      driverLocations.forEach((loc) => {
        points.push([loc.lat, loc.lng]);
      });
    }
    if (visible.customers) {
      customers.forEach((c) => {
        const ll = (c?.locations?.home as Record<string, unknown>)?.latlng as [number, number] | undefined
          ?? c?.locations?.home?.latlang;
        if (ll && ll[0] !== 0 && ll[1] !== 0) points.push(ll);
      });
    }
    if (visible.restaurants) {
      businesses.forEach((b) => {
        const ll = b?.profile?.latlng;
        if (ll && ll[0] !== 0 && ll[1] !== 0) points.push(ll);
      });
    }
    if (visible.orders) {
      orders.forEach((o) => {
        const ll = o?.delivery?.latlng;
        if (ll && ll[0] !== 0 && ll[1] !== 0) points.push(ll);
      });
    }

    return points;
  }, [
    visible.drivers,
    visible.customers,
    visible.restaurants,
    visible.orders,
    driverLocations,
    customers,
    businesses,
    orders,
  ]);

  const handleToggle = useCallback((key: keyof FilterVisibility) => {
    setVisible((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handlePresetChange = useCallback((filters: FilterVisibility) => {
    setVisible(filters);
  }, []);

  const handleRefresh = useCallback(() => {
    refetchBusinesses();
    refetchDrivers();
    refetchCustomers();
    refetchOrders();
  }, [refetchBusinesses, refetchDrivers, refetchCustomers, refetchOrders]);

  const tileUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const tileAttribution = isDark
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        zoomControl={false}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer url={tileUrl} attribution={tileAttribution} />
        {fitPoints.length > 0 && <FitBounds points={fitPoints} />}
        <MapMarkers
          drivers={drivers}
          driverLocations={driverLocations}
          customers={customers}
          restaurants={businesses}
          orders={orders}
          visible={visible}
        />
      </MapContainer>

      <FilterPanel
        visible={visible}
        onToggle={handleToggle}
        onPresetChange={handlePresetChange}
        counts={counts}
        onlineDrivers={onlineDrivers}
        activeOrders={orders.length}
        onRefresh={handleRefresh}
      />

      <MapLegend />
      <MapStatsBar counts={counts} />
    </div>
  );
}
