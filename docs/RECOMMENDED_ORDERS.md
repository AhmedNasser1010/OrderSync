# Recommended Orders System — How It Works Under the Hood

## Overview

The Recommended Orders system identifies groups of marketplace orders that can be delivered together along an efficient route, saving the driver travel time and distance. It runs entirely on the client side using the driver's real-time GPS position and Firestore data.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Browser (Client Side)                                  │
│                                                         │
│  ┌──────────────┐    ┌───────────────────────────────┐  │
│  │ useDriverLoc  │───▶│ LocationProvider (context)     │  │
│  │ (GPS watch)   │    │  └─ position: { lat, lng }    │  │
│  └──────────────┘    └──────────┬────────────────────┘  │
│                                 │                        │
│  ┌──────────────┐    ┌──────────▼────────────────────┐  │
│  │ Firestore RT  │───▶│ useRecommendedOrders (hook)    │  │
│  │ onSnapshot    │    │  └─ findBestRouteGroup()       │  │
│  │ (READY orders)│    └──────────┬────────────────────┘  │
│  └──────────────┘               │                        │
│                                 ▼                        │
│                    ┌──────────────────────────────┐      │
│                    │ RecommendedOrders (component) │      │
│                    │  ├─ Bundle summary + Claim All │      │
│                    │  ├─ Divider                    │      │
│                    │  └─ Individual order cards     │      │
│                    │      with Claim buttons        │      │
│                    └──────────────────────────────┘      │
│                                 │                        │
│                    ┌────────────▼───────────────────┐    │
│                    │ claimOrder / claimOrdersBatch   │    │
│                    │ (Firestore transactions)        │    │
│                    └────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. Driver Position

The driver's GPS position is tracked by `useDriverLocation` (`src/hooks/useDriverLocation.ts`):

- Uses `navigator.geolocation.watchPosition()` to continuously track the driver
- Writes position to Firestore (`drivers/{uid}.liveLocation`) at intervals (4–25 seconds depending on state)
- Exposes the current `{ lat, lng }` via `LocationProvider` context
- Components access it via the `useDriverPosition()` hook

### 2. Marketplace Orders

Orders with `status.current === "READY"` are fetched via a Firestore real-time listener in `src/rtk/api/firestoreApi.ts`:

```typescript
const q = query(
  collection(db, "orders"),
  where("status.current", "==", "READY"),
  orderBy("createdAt", "desc"),
);
```

The `useMarketplaceOrders()` hook (`src/hooks/useOrders.ts`) provides these orders to the component tree.

### 3. Recommendation Computation

The `useRecommendedOrders` hook (`src/hooks/useRecommendedOrders.ts`) combines the driver's position with the marketplace orders and calls the route optimizer:

```typescript
const recommended = useMemo(() => {
  if (!position || orders.length < 2) return null;
  return findBestRouteGroup([position.lat, position.lng], orders);
}, [position, orders]);
```

This recomputes automatically whenever the driver moves or orders change.

---

## The Route Optimization Algorithm

File: `src/utilities/routeOptimizer.ts`

### Constants

| Name | Value | Purpose |
|---|---|---|
| `EARTH_RADIUS_M` | 6,371,000 | Earth radius for Haversine calculation |
| `DELIVERY_CLUSTER_RADIUS_M` | 3,000 (3 km) | Max distance between delivery points to consider them in the same cluster |
| `MIN_SAVINGS_M` | 500 (0.5 km) | Minimum distance savings required to show a recommendation |

### Step-by-Step

#### Step 1: Group by Restaurant

Orders are grouped by `businessId`. Only groups with 2+ orders are considered (no benefit to batching a single order).

```
Orders: [A(restaurant1), B(restaurant1), C(restaurant1), D(restaurant2)]
Groups: { restaurant1: [A, B, C], restaurant2: [D] }
→ Skip restaurant2 (only 1 order)
```

#### Step 2: Cluster by Delivery Proximity

Within each restaurant group, orders are clustered by how close their delivery destinations are to each other. Uses a greedy union-find approach: an order joins an existing cluster if it's within 3 km of any member already in that cluster.

```
Restaurant1 orders: [A(delivery: 1km away), B(delivery: 1.2km away), C(delivery: 8km away)]
→ Cluster 1: [A, B] (A and B are within 3km of each other)
→ Cluster 2: [C] (too far from A and B)
→ Skip Cluster 2 (only 1 order)
```

#### Step 3: Compute Individual Distance

For each cluster, calculate the total distance if the driver delivered each order separately:

```
individualDistance = Σ (driver→restaurant + restaurant→delivery_i)
```

This is the sum of each order's round-trip from the driver's current position.

#### Step 4: Compute Batch Route Distance

Calculate the optimal batch route using a **greedy nearest-neighbor** heuristic:

```
batchDistance = driver→restaurant + greedyRoute(restaurant, [delivery_1, delivery_2, ...])
```

The greedy algorithm:
1. Start at the restaurant
2. Find the nearest unvisited delivery
3. Travel there, mark as visited
4. Repeat until all deliveries are visited

#### Step 5: Calculate Savings

```
savings = individualDistance - batchDistance
```

If `savings >= 500 meters`, this cluster is a valid recommendation candidate.

#### Step 6: Pick the Best Group

Across all restaurants and all clusters, the group with the **highest savings** is selected as the recommendation.

---

## Example

**Scenario:** Driver is at point D. Three READY orders from the same restaurant:

| Order | Restaurant | Delivery | Distance (individual) |
|---|---|---|---|
| #101 | R | 0.5 km from R | D→R (1km) + R→D1 (0.5km) = 1.5 km |
| #102 | R | 0.7 km from R | D→R (1km) + R→D2 (0.7km) = 1.7 km |
| #103 | R | 0.3 km from R | D→R (1km) + R→D3 (0.3km) = 1.3 km |

**Individual total:** 1.5 + 1.7 + 1.3 = **4.5 km**

**Batch route:** D→R (1km) → D3 (0.3km) → D1 (0.4km) → D2 (0.6km) = **2.3 km**

**Savings:** 4.5 - 2.3 = **2.2 km** ✓ (above 500m threshold)

→ This group appears as a recommendation.

---

## UI Structure

The `RecommendedOrders` component (`src/components/orders/RecommendedOrders.tsx`) renders three sections:

### 1. Bundle Summary Card (green accent)

- Restaurant name
- Route distance and savings
- Total items and price
- **"Claim All X Orders"** button → calls `claimOrdersBatch` (single Firestore transaction)

### 2. Divider

```
─────── or claim individually ───────
```

### 3. Individual Order Cards

Each order in the recommended group is shown separately with:
- Delivery address and order number
- Item count and price
- **"Claim"** button → calls `claimOrder` (single order transaction)

### Claim All Behavior

The `claimOrdersBatch` mutation (`src/rtk/api/firestoreApi.ts`) runs a single Firestore `runTransaction`:

1. Reads all order documents
2. Validates each is `STATUS === "READY"` and unclaimed
3. Updates each order: `status → RESERVED`, adds history entry, sets `timeline.reservedAt`, assigns `driverUid`
4. Updates the driver document: sets `accessToken` (restaurant ID), adds all `customerUid`s to `trackingCustomerIds`

### Individual Claim Behavior

Each `IndividualOrder` uses the existing `claimOrder` mutation, which does the same thing for a single order.

### Dynamic Updates

When any order is claimed (individually or batch):
- Firestore status changes from `READY` → `RESERVED`
- The `onSnapshot` marketplace listener fires, removing it from the list
- `useRecommendedOrders` recomputes with the updated order set
- The recommendation card updates automatically (or disappears if no valid group remains)

---

## File Reference

| File | Purpose |
|---|---|
| `src/utilities/routeOptimizer.ts` | Haversine distance, clustering, greedy routing, `findBestRouteGroup()` |
| `src/hooks/useRecommendedOrders.ts` | Hook combining orders + position → best route group |
| `src/components/orders/RecommendedOrders.tsx` | UI: bundle card + divider + individual order cards |
| `src/hooks/useDriverLocation.ts` | GPS tracking, exposes driver position |
| `src/components/LocationProvider.tsx` | React context providing position to component tree |
| `src/rtk/api/firestoreApi.ts` | `claimOrdersBatch` and `claimOrder` Firestore mutations |
| `src/app/orders/marketplace/page.tsx` | Marketplace page rendering the recommendation above the order list |

---

## Tuning Parameters

These constants in `routeOptimizer.ts` can be adjusted:

- **`DELIVERY_CLUSTER_RADIUS_M`** (3,000) — Increase to group orders with deliveries farther apart. Decrease for tighter clustering.
- **`MIN_SAVINGS_M`** (500) — Increase to only show recommendations with significant savings. Decrease to show more marginal recommendations.

---

## Limitations

1. **Single restaurant only** — Orders from different restaurants are never grouped together. Cross-restaurant batching could save more but adds pickup complexity.
2. **Greedy routing** — The nearest-neighbor heuristic is O(n²) per cluster but doesn't guarantee the optimal route. For 2–5 orders this is fine; for larger groups a more sophisticated TSP solver could help.
3. **Requires GPS** — If the driver's location isn't available, no recommendation is shown. The feature degrades gracefully (remaining orders still appear in the regular list).
4. **Static radius** — The 3 km delivery clustering radius is hardcoded. In dense urban areas a smaller radius might be better; in rural areas a larger one.
