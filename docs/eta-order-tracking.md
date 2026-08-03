# ETA (Estimated Time to Arrive) — Order Tracking

This document describes how the customer-facing Estimated Time to Arrive (ETA) is calculated and displayed in the order tracking sidebar of `customer_app`.

## Overview

The ETA system is entirely **client-side and heuristic**. There are no backend writes, Firestore ETA fields, or external routing-API calls. Instead, the estimate is computed in the browser from the order's existing `timeline` timestamps, the restaurant/delivery coordinates, and — when the driver is en route — the driver's real-time GPS position from the `drivers/{uid}` Firestore document.

The estimate is intentionally approximate: a straight-line (Haversine) distance multiplied by a road-network correction factor, divided by an assumed urban driving speed. It is accurate enough for a customer-facing estimate and avoids any cross-app coordination or network dependency.

---
## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Browser (Client Side)                                      │
│                                                             │
│  ┌──────────────────┐    ┌───────────────────────────────┐  │
│  │ Firestore RT      │───▶│ useFetchOrderTrackingDataQuery │  │
│  │ onSnapshot        │    │  └─ trackedOrderData          │  │
│  │ (orders/{id})     │    │     (status, timeline,        │  │
│  └──────────────────┘    │      delivery.latlng, ...)     │  │
│                          └──────────────┬────────────────┘  │
│  ┌──────────────────┐                   │                   │
│  │ Firestore RT      │───▶┐             │                   │
│  │ onSnapshot        │    │  ┌──────────▼──────────────┐    │
│  │ (drivers/{uid})   │    └─▶│ useDriverLocation        │    │
│  └──────────────────┘       │  └─ liveLocation          │    │
│                             └──────────┬──────────────┘    │
│                                        │                   │
│                             ┌──────────▼──────────────┐    │
│                             │ useEta (hook)            │    │
│                             │  └─ computeEta()         │    │
│                             │     → { minutes,          │    │
│                             │        arrivalTime, kind }│    │
│                             └──────────┬──────────────┘    │
│                                        │                   │
│                             ┌──────────▼──────────────┐    │
│                             │ OrderSidebar (component) │    │
│                             │  ├─ EtaBadge (hero card) │    │
│                             │  └─ Live map overlay pill│    │
│                             └──────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---
## Calculation Phases

`computeEta()` branches on the order's current status and returns one of four outcomes:

| Order status | Phase (`kind`) | Basis | Output |
|---|---|---|---|
| `DELIVERED`, `GIVEN_FEEDBACK` | `arrived` | — | `0` min (shows "Arrived") |
| `RESERVED`, `PICKED_UP`, `ON_ROUTE` | `enRoute` | Live driver position → delivery | Live countdown |
| `RECEIVED`, `ACCEPTED`, `PREPARING`, `READY` | `preparing` | Remaining prep time + travel estimate | Prep + travel |
| `CANCELED`, `REJECTED`, `VOIDED` | `null` | — | No ETA shown |

---
## The Core Formula

Both the en-route and the pre-driver travel estimate use the same distance→time conversion:

```
minutes = (distanceKm / speedKmh) × 60
```

where `distanceKm` is always the Haversine great-circle distance multiplied by `DISTANCE_CORRECTION` (1.3) to approximate the longer real road distance.

---
### Phase 1 — En Route (live)

When the driver has picked up the order (`RESERVED` / `PICKED_UP` / `ON_ROUTE`) and both the live driver location and delivery coordinates are available:

```
distance = Haversine(driverLocation, deliveryLatlng) × 1.3
speed    = driver.speed (> 5 m/s ? m/s×3.6 : 22 km/h)
minutes  = max(1, round((distance / speed) × 60))
```

- **Distance**: straight-line distance from the driver's live GPS to the customer's delivery point, corrected ×1.3.
- **Speed**: prefers the driver's reported `liveLocation.speed` (converted m/s → km/h by ×3.6) **only if it exceeds 5 m/s** — a threshold to ignore stale/stopped readings. Otherwise falls back to the default `22 km/h`.
- This recomputes on **every driver location snapshot** (via the `useDriverLocation` Firestore `onSnapshot` subscription), so the countdown ticks down as the driver approaches.

---
### Phase 2 — Pre-driver (prep + travel)

Before the driver picks up, there is no live position to use. The ETA is the sum of remaining preparation time and a restaurant→delivery travel estimate:

```
minutes = max(1, prepRemainingMin + travelMin)
```

#### Remaining preparation time

Derived from the order's `timeline` object:

| Condition | Prep remaining |
|---|---|
| `timeline.preparingAt` exists (already cooking) | `preparingAt + 15 min − now`, clamped to ≥ 0 |
| `timeline.readyAt` exists (food is ready) | `0` |
| Neither (order just placed) | full `15 min` default |

#### Travel time

```
travelMin = round((Haversine(restaurant, delivery) × 1.3 / 22) × 60)
```

The same corrected straight-line distance ÷ assumed speed, measured from the restaurant to the customer.

---
## Tuning Constants

All constants are exported from `customer_app/src/utils/getEta.ts` for easy adjustment:

| Constant | Value | Purpose |
|---|---|---|
| `PREP_TIME_MIN` | `15` | Assumed restaurant preparation time (minutes) |
| `DRIVER_SPEED_KMH` | `22` | Assumed average urban driving speed (km/h) |
| `DISTANCE_CORRECTION` | `1.3` | Multiplier on straight-line distance to approximate road distance |
| `MIN_ETA_MIN` | `1` | Floor to avoid "0 min" flicker before a status transition |

---
## Output

`computeEta()` returns an `EtaResult`:

```ts
interface EtaResult {
  minutes: number | null;      // whole minutes remaining, or null when unknown
  arrivalTime: number | null;  // now + minutes×60000 (epoch ms), for "arrives by HH:MM"
  kind: "preparing" | "enRoute" | "arrived" | null;
}
```

- **`minutes`** — rounded whole minutes remaining, or `null` when an estimate isn't possible.
- **`arrivalTime`** — `Date.now() + minutes × 60000`, used by the UI to render an absolute clock time like "Arrives by 3:45 PM".
- **`kind`** — drives the UI copy and which badge renders.

The `useEta` hook memoizes this on its inputs and adds convenience booleans (`isPreparing`, `isEnRoute`, `isArrived`).

---
## UI Integration

**File:** `customer_app/src/components/Sidebar/OrderSidebar.tsx`

The ETA surfaces in two places inside the order tracking sidebar:

1. **Status hero card** — an `EtaBadge` renders below the status label:
   - `> 5 min` → "Arrives by 3:45 PM · 12 min"
   - `≤ 5 min` → "Arriving soon · 3 min"
   - `arrived` → "Arrived"
2. **Live map overlay** — when the map is live, a single pill renders (mutually exclusive):
   - En route with valid ETA → ETA pill ("Estimated arrival: 12 min" / "Arriving soon")
   - Otherwise → "Driver on the way" pill with the pulsing dot

The `useEta` hook is called alongside the existing `useDriverLocation` hook and fed the tracked order's `status`/`timeline`, the live driver location, and the restaurant/delivery latlngs.

---
## File Reference

| File | Role |
|---|---|
| `customer_app/src/utils/getEta.ts` | Pure `computeEta()` function + tuning constants |
| `customer_app/src/hooks/useEta.ts` | React hook wrapping `computeEta` with `useMemo` |
| `customer_app/src/components/Sidebar/OrderSidebar.tsx` | UI — `EtaBadge` + live map overlay |
| `customer_app/src/utils/getDistanceFromLatlngInKm.ts` | Haversine distance util (reused) |
| `customer_app/src/hooks/useDriverLocation.ts` | Live driver GPS subscription (reused) |
| `messages/en.json`, `messages/ar.json` | i18n keys (`Arrived`, `Arriving soon`, `Arrives by`, `Estimated arrival`, `Estimated time to arrive`) |

---
## Characteristics & Limitations

- **Pure & stateless** — `computeEta()` is a plain function; `useEta` only memoizes it on its inputs.
- **Reactive** — recomputes whenever the driver location, order status, or timeline changes, so the countdown updates in real time.
- **Heuristic, not precise** — uses straight-line distance with a correction factor, not a real road route. A real routing service (e.g. the OSRM call used by the driver app's `RouteControl`) could be swapped into `computeEta` later for higher accuracy without changing the UI.
- **No backend dependency** — no Firestore schema, shared types, security rules, or other apps are modified. The ETA exists only in the customer web app.
- **`prepTimeMin` override** — wired through the hook so it can later be fed from `servicesSlice` if per-restaurant prep times are configured.
