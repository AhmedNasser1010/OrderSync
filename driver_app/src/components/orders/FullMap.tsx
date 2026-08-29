"use client";

import { useState, useMemo, useCallback } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { FitMapToMarkers } from "./FitMapToMarkers";
import { RouteControl } from "./RouteControl";
import {
  driverIcon,
  createDriverHeadingIcon,
  createOrderStatusIcon,
  restaurantIcon,
} from "./mapCustomMarker";
import { MapFilterPanel } from "./MapFilterPanel";
import { MapOrderPopup } from "./MapOrderPopup";
import { MapRestaurantPopup } from "./MapRestaurantPopup";
import { MapSearch } from "./MapSearch";
import { SmoothDriverMarker } from "./SmoothDriverMarker";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { MapFilters } from "@/app/[locale]/orders/map/page";
import type { OrderType } from "@ordersync/types";
import type { DriverPosition } from "@/hooks/useDriverLocation";
import "leaflet/dist/leaflet.css";

interface FullMapProps {
  marketplaceOrders: OrderType[];
  myOrders: OrderType[];
  driverPosition: DriverPosition | null;
  filters: MapFilters;
  onFiltersChange: (filters: MapFilters) => void;
}

export function FullMap({
  marketplaceOrders,
  myOrders,
  driverPosition,
  filters,
  onFiltersChange,
}: FullMapProps) {
  const t = useTranslations("mapPage");
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<{
    id: string;
    name: string;
    address?: string;
    latlng: [number, number];
    orders: OrderType[];
  } | null>(null);
  const [activeRoute, setActiveRoute] = useState<{
    destination: [number, number];
    label: string;
  } | null>(null);

  const allOrders = useMemo(
    () => [...marketplaceOrders, ...myOrders],
    [marketplaceOrders, myOrders],
  );

  const visibleOrders = useMemo(
    () => (filters.orders ? allOrders : []),
    [filters.orders, allOrders],
  );

  const orderPoints = useMemo(
    () =>
      visibleOrders
        .filter(
          (o) =>
            o.delivery?.latlng &&
            o.delivery.latlng[0] &&
            o.delivery.latlng[1],
        )
        .map((o) => o.delivery.latlng as [number, number]),
    [visibleOrders],
  );

  const restaurants = useMemo(() => {
    if (!filters.restaurants) return [];
    const map = new Map<
      string,
      {
        id: string;
        name: string;
        address?: string;
        latlng: [number, number];
        orders: OrderType[];
      }
    >();
    for (const order of visibleOrders) {
      const id = order.business?.id;
      const ll = order.business?.latlng;
      if (!id || !ll || !ll[0] || !ll[1]) continue;
      if (map.has(id)) {
        map.get(id)!.orders.push(order);
      } else {
        map.set(id, {
          id,
          name: order.business?.nameInAr ?? order.business?.name ?? "",
          address: order.business?.address,
          latlng: ll,
          orders: [order],
        });
      }
    }
    return Array.from(map.values());
  }, [filters.restaurants, visibleOrders]);

  const restaurantPoints = useMemo(
    () => restaurants.map((r) => r.latlng),
    [restaurants],
  );

  const driverPoint: [number, number] | null = useMemo(
    () =>
      filters.driverLocation && driverPosition
        ? [driverPosition.lat, driverPosition.lng]
        : null,
    [filters.driverLocation, driverPosition],
  );

  const roundedHeading =
    driverPosition?.heading != null
      ? Math.round(driverPosition.heading / 5) * 5
      : null;
  const driverMarkerIcon = useMemo(
    () => (roundedHeading != null ? createDriverHeadingIcon(roundedHeading) : driverIcon),
    [roundedHeading],
  );

  const fitPoints = useMemo(() => {
    const pts: [number, number][] = [...orderPoints, ...restaurantPoints];
    if (driverPoint) pts.push(driverPoint);
    return pts;
  }, [orderPoints, restaurantPoints, driverPoint]);

  const defaultCenter: [number, number] =
    driverPoint ?? orderPoints[0] ?? restaurantPoints[0] ?? [24.7136, 46.6753];

  const handleMarkerClick = useCallback(
    (order: OrderType) => {
      setSelectedOrder(order);
      setSelectedRestaurant(null);
    },
    [],
  );

  const handleClosePopup = useCallback(() => {
    setSelectedOrder(null);
    setSelectedRestaurant(null);
  }, []);

  const handleRestaurantClick = useCallback(
    (restaurant: (typeof restaurants)[number]) => {
      setSelectedOrder(null);
      setSelectedRestaurant(restaurant);
    },
    [],
  );

  const handleSelectOrderFromRestaurant = useCallback(
    (order: OrderType) => {
      setSelectedRestaurant(null);
      setSelectedOrder(order);
    },
    [],
  );

  const handleSearchSelectRestaurant = useCallback(
    (_name: string, latlng: [number, number]) => {
      const map = new Map<string, { id: string; name: string; address?: string; latlng: [number, number]; orders: OrderType[] }>();
      for (const order of allOrders) {
        const id = order.business?.id;
        const ll = order.business?.latlng;
        if (!id || !ll || !ll[0] || !ll[1]) continue;
        if (map.has(id)) {
          map.get(id)!.orders.push(order);
        } else {
          map.set(id, {
            id,
          name: order.business?.name ?? "",
            address: order.business?.address,
            latlng: ll,
            orders: [order],
          });
        }
      }
      const match = Array.from(map.values()).find(
        (r) => r.latlng[0] === latlng[0] && r.latlng[1] === latlng[1],
      );
      if (match) {
        setSelectedOrder(null);
        setSelectedRestaurant(match);
      }
    },
    [allOrders],
  );

  const handleNavigate = useCallback(
    (destination: [number, number], label: string) => {
      setActiveRoute({ destination, label });
    },
    [],
  );

  const handleClearRoute = useCallback(() => {
    setActiveRoute(null);
  }, []);

  return (
    <div className="relative h-dvh w-full">
      <MapContainer
        center={defaultCenter}
        zoom={14}
        scrollWheelZoom={true}
        zoomControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <FitMapToMarkers points={fitPoints} />

        {activeRoute && driverPoint && (
          <RouteControl
            driverPosition={driverPoint}
            destination={activeRoute.destination}
            onError={handleClearRoute}
          />
        )}

        {driverPoint && (
          <SmoothDriverMarker position={driverPoint} icon={driverMarkerIcon} />
        )}

        {visibleOrders.map((order) => {
          const ll = order.delivery?.latlng;
          if (!ll || !ll[0] || !ll[1]) return null;
          const icon = createOrderStatusIcon(
            order.status?.current ?? "READY",
            order.timeline?.readyAt ?? order.createdAt,
          );
          return (
            <Marker
              key={order.id}
              position={ll}
              icon={icon}
              eventHandlers={{
                click: () => handleMarkerClick(order),
              }}
            />
          );
        })}

        {filters.restaurants &&
          restaurants.map((restaurant) => (
            <Marker
              key={`rest-${restaurant.id}`}
              position={restaurant.latlng}
              icon={restaurantIcon}
              eventHandlers={{
                click: () => handleRestaurantClick(restaurant),
              }}
            />
          ))}
      </MapContainer>

      <MapFilterPanel
        filters={filters}
        onFiltersChange={onFiltersChange}
        orderCount={visibleOrders.length}
        restaurantCount={restaurantPoints.length}
      />

      <MapSearch
        allOrders={allOrders}
        onSelectOrder={handleMarkerClick}
        onSelectRestaurant={handleSearchSelectRestaurant}
      />

      {activeRoute && (
        <button
          type="button"
          onClick={handleClearRoute}
          className="fixed bottom-24 left-4 right-4 z-[1100] flex items-center justify-center gap-2 rounded-2xl border border-border/50 bg-card px-4 py-3 text-sm font-medium shadow-xl transition-colors hover:bg-muted"
        >
          <X className="h-4 w-4" />
          {t("clearRoute", { label: activeRoute.label })}
        </button>
      )}

      {selectedOrder && (
        <MapOrderPopup order={selectedOrder} onClose={handleClosePopup} onNavigate={handleNavigate} />
      )}

      {selectedRestaurant && (
        <MapRestaurantPopup
          businessId={selectedRestaurant.id}
          restaurantName={selectedRestaurant.name}
          restaurantAddress={selectedRestaurant.address}
          restaurantLatlng={selectedRestaurant.latlng}
          orders={selectedRestaurant.orders}
          onClose={handleClosePopup}
          onSelectOrder={handleSelectOrderFromRestaurant}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}
