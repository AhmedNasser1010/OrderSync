"use client";

import { Marker, Popup } from "react-leaflet";
import {
  driverOnlineIcon,
  driverOfflineIcon,
  customerIcon,
  restaurantIcon,
  orderIcon,
} from "./mapIcons";
import { DriverPopup, CustomerPopup, RestaurantPopup, OrderPopup } from "./MapPopup";
import type { BusinessDocument, Driver, CustomerType, OrderType } from "@ordersync/types";
import type { LiveLocation } from "@/hooks/useLiveDriverLocations";

interface MapMarkersProps {
  drivers: Driver[];
  driverLocations: Map<string, LiveLocation>;
  customers: CustomerType[];
  restaurants: BusinessDocument[];
  orders: OrderType[];
  visible: {
    drivers: boolean;
    customers: boolean;
    restaurants: boolean;
    orders: boolean;
  };
}

export function MapMarkers({
  drivers,
  driverLocations,
  customers,
  restaurants,
  orders,
  visible,
}: MapMarkersProps) {
  const driverMap = new Map(drivers.map((d) => [d.uid, d]));

  return (
    <>
      {visible.drivers &&
        Array.from(driverLocations.entries()).map(([uid, loc]) => {
          const driver = driverMap.get(uid);
          const isOnline = driver?.online?.byUser || driver?.online?.byManager;
          return (
            <Marker
              key={`driver-${uid}`}
              position={[loc.lat, loc.lng]}
              icon={isOnline ? driverOnlineIcon : driverOfflineIcon}
            >
              <Popup>
                <DriverPopup
                  name={driver?.userInfo?.name ?? "Unknown Driver"}
                  phone={driver?.userInfo?.phone ?? "N/A"}
                  isOnline={!!isOnline}
                  plate={
                    driver?.licensePlate
                      ? `${driver.licensePlate.letters} ${driver.licensePlate.numbers}`
                      : undefined
                  }
                  lastSeen={loc.updatedAt}
                  cash={(driver?.finance?.dailyAdvance ?? 0) + (driver?.finance?.earnings ?? 0)}
                />
              </Popup>
            </Marker>
          );
        })}

      {visible.customers &&
        customers.map((customer) => {
          const latlng = (customer?.locations?.home as Record<string, unknown>)?.latlng as [number, number] | undefined
            ?? customer?.locations?.home?.latlang;
          if (!latlng || latlng[0] === 0 || latlng[1] === 0) return null;
          return (
            <Marker
              key={`customer-${customer.uid}`}
              position={latlng}
              icon={customerIcon}
            >
              <Popup>
                <CustomerPopup
                  name={customer.userInfo?.name ?? "Unknown"}
                  phone={customer.userInfo?.phone ?? "N/A"}
                  city={customer.locations?.city ?? "N/A"}
                  totalOrders={
                    customer.restaurants?.reduce(
                      (sum, r) => sum + (r.totalOrders ?? 0),
                      0
                    ) ?? 0
                  }
                />
              </Popup>
            </Marker>
          );
        })}

      {visible.restaurants &&
        restaurants.map((biz) => {
          const latlng = biz?.profile?.latlng;
          if (!latlng || latlng[0] === 0 || latlng[1] === 0) return null;
          return (
            <Marker
              key={`restaurant-${biz.accessToken}`}
              position={latlng}
              icon={restaurantIcon}
            >
              <Popup>
                <RestaurantPopup
                  name={biz.profile?.name ?? "Unknown"}
                  phone={biz.owner?.phone ?? "N/A"}
                  address={biz.profile?.address ?? "N/A"}
                  status={biz.status ?? "active"}
                  rating={biz.reviewSummary?.averageRating ?? 0}
                />
              </Popup>
            </Marker>
          );
        })}

      {visible.orders &&
        orders.map((order) => {
          const deliveryLatlng = order?.delivery?.latlng;
          if (
            !deliveryLatlng ||
            deliveryLatlng[0] === 0 ||
            deliveryLatlng[1] === 0
          )
            return null;
          return (
            <Marker
              key={`order-${order.id}`}
              position={deliveryLatlng}
              icon={orderIcon}
            >
              <Popup>
                <OrderPopup order={order} />
              </Popup>
            </Marker>
          );
        })}
    </>
  );
}
