import type { OrderType } from "@ordersync/types";

export type LatLng = [number, number];

export type RouteGroup = {
  orders: OrderType[];
  restaurant: { name: string; latlng: LatLng };
  totalRouteDistance: number;
  individualDistance: number;
  savings: number;
};

const EARTH_RADIUS_M = 6_371_000;
const DELIVERY_CLUSTER_RADIUS_M = 3_000;
const MIN_SAVINGS_M = 500;

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineDistance(a: LatLng, b: LatLng): number {
  const dLat = toRadians(b[0] - a[0]);
  const dLng = toRadians(b[1] - a[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a[0])) *
      Math.cos(toRadians(b[0])) *
      Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function distanceToDelivery(
  driverLoc: LatLng,
  restaurantLoc: LatLng,
  deliveryLoc: LatLng,
): number {
  return (
    haversineDistance(driverLoc, restaurantLoc) +
    haversineDistance(restaurantLoc, deliveryLoc)
  );
}

function clusterByDeliveryProximity(
  orders: OrderType[],
  maxRadius: number,
): OrderType[][] {
  const assigned = new Set<string>();
  const clusters: OrderType[][] = [];

  for (const order of orders) {
    if (assigned.has(order.id)) continue;

    const cluster: OrderType[] = [order];
    assigned.add(order.id);

    for (const candidate of orders) {
      if (assigned.has(candidate.id)) continue;

      const isClose = cluster.some(
        (member) =>
          haversineDistance(member.delivery.latlng, candidate.delivery.latlng) <=
          maxRadius,
      );

      if (isClose) {
        cluster.push(candidate);
        assigned.add(candidate.id);
      }
    }

    clusters.push(cluster);
  }

  return clusters;
}

function greedyRouteDistance(
  restaurantLoc: LatLng,
  deliveryLocs: LatLng[],
): number {
  if (deliveryLocs.length === 0) return 0;

  const unvisited = [...deliveryLocs];
  let total = 0;
  let current = restaurantLoc;

  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const d = haversineDistance(current, unvisited[i]);
      if (d < nearestDist) {
        nearestDist = d;
        nearestIdx = i;
      }
    }

    total += nearestDist;
    current = unvisited.splice(nearestIdx, 1)[0];
  }

  return total;
}

export function findBestRouteGroup(
  driverLoc: LatLng,
  orders: OrderType[],
): RouteGroup | null {
  if (orders.length < 2) return null;

  const byRestaurant = new Map<string, OrderType[]>();
  for (const order of orders) {
    const key = order.businessId;
    const list = byRestaurant.get(key) ?? [];
    list.push(order);
    byRestaurant.set(key, list);
  }

  let bestGroup: RouteGroup | null = null;

  for (const [, restaurantOrders] of byRestaurant) {
    if (restaurantOrders.length < 2) continue;

    const restaurant = {
      name: restaurantOrders[0].business.name,
      latlng: restaurantOrders[0].business.latlng,
    };

    const clusters = clusterByDeliveryProximity(
      restaurantOrders,
      DELIVERY_CLUSTER_RADIUS_M,
    );

    for (const cluster of clusters) {
      if (cluster.length < 2) continue;

      const individualDistance = cluster.reduce(
        (sum, order) =>
          sum + distanceToDelivery(driverLoc, restaurant.latlng, order.delivery.latlng),
        0,
      );

      const deliveryLocs = cluster.map((o) => o.delivery.latlng);
      const batchDistance =
        haversineDistance(driverLoc, restaurant.latlng) +
        greedyRouteDistance(restaurant.latlng, deliveryLocs);

      const savings = individualDistance - batchDistance;

      if (savings >= MIN_SAVINGS_M) {
        if (!bestGroup || savings > bestGroup.savings) {
          bestGroup = {
            orders: cluster,
            restaurant,
            totalRouteDistance: batchDistance,
            individualDistance,
            savings,
          };
        }
      }
    }
  }

  return bestGroup;
}
