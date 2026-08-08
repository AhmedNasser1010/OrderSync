# Driver App — Delivery Driver Console

The **delivery driver** application for **Order Sync**. Drivers go online/offline with live GPS tracking, claim available orders from the marketplace, follow optimized recommended routes, navigate to customers on an interactive map, and manage their delivery lifecycle and cash balance.

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Getting Started](#getting-started)
5. [Project Structure](#project-structure)
6. [Key Concepts](#key-concepts)
7. [Related Documentation](#related-documentation)

---

## Overview

The Driver App is a **Next.js 16 + React 19** PWA built for on-the-road use on a phone. It keeps the driver's GPS position streamed to Firestore so the customer app can show live tracking, while subscribing to available (`READY`) orders in real time. When a driver claims orders, they flow through the shared state machine:

```
Claim → Reserved → Picked Up → Start Route → On Route → Delivered
```

## Features

### Marketplace & Claiming
- **Marketplace tab** — every `READY` order available for pickup, streamed live, with search by number/customer/item/status.
- **Recommended Orders** — an automatic engine that detects batches of orders from the same restaurant going to nearby addresses and suggests **Claim All** with projected route distance, savings, item count, and total price.
  - Runs client-side using the driver's GPS + Firestore data, with a Haversine distance + greedy nearest-neighbor route heuristic.
  - See [`docs/RECOMMENDED_ORDERS.md`](../docs/RECOMMENDED_ORDERS.md) for the full algorithm.
- **Claim** orders individually or as a batch via atomic Firestore transactions (with "already taken" conflict handling).
- **New-order alerts** — toasts and push notifications (`useNewOrderAlert`, `useForegroundMessage`, `useFcmToken`) when new orders appear.

### Active Orders & Delivery Lifecycle
- **Active orders tab** with search and status badges.
- **Order detail page** showing customer, items, total, order notes, and delivery location.
- Actions per order: **Claim Order → Start Delivery → Start Route → Complete Delivery**, plus **Return to Ready** (send an order back to the restaurant) and **Call the customer**.
- **Skip Start Route** setting to go straight from pickup to on-route.

### Map & Navigation
- **Map tab** — a live Leaflet map showing:
  - Active and available orders, restaurants, and the driver's own position (toggleable filters).
  - Search for orders/restaurants and **navigate** to them (deep-link to Google Maps / Apple Maps).
  - Route rendering with **route optimization** and clear-route control.
- Map popups with quick actions (claim, start delivery, call).
- **Fit-to-markers** helper and custom colored markers for each entity type.

### GPS Tracking & Online State
- **Online/Offline toggle** — go online only when location is granted; writes `liveLocation` to Firestore at 4–25s intervals while active.
- **Location permission banners** and graceful degradation when geolocation is unavailable.
- The customer app reads this live location for the order-tracking map.

### Finance & Limits
- **Cash balance tracking** per driver with configurable **warning** and **hard limits**.
- When the balance hits the limit, claiming new orders is blocked (`$ Limit Reached`), with banner warnings and an explainer to contact the manager.

### Onboarding & Approval
- Sign up / sign in (email+password or Google) with **driver role claim** enforcement.
- **Account setup screen** — newly created driver accounts are directed to contact their manager for profile activation (approval flow) before they can deliver.

### Settings
- Theme (light / dark), language (en / ar), **push notification** toggles, **Skip Start Route**, and logout.

### App Experience
- **PWA** (Serwist) with offline fallback and install prompt.
- Notification + location permission prompts, finance warning banners, and an online-state indicator in the header.

## Tech Stack

| Category       | Technology                                                     |
|----------------|----------------------------------------------------------------|
| Framework      | Next.js 16 (App Router)                                        |
| UI             | React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Radix UI     |
| State / Data   | Redux Toolkit, RTK Query (`firestoreApi`)                      |
| Backend        | Firebase (Auth + Cloud Firestore, FCM messaging), Firebase Admin |
| Maps / Routing | Leaflet, react-leaflet, @fleetbase/leaflet-routing-machine     |
| i18n           | next-intl (en / ar)                                            |
| PWA            | Serwist (background sync via `sw.ts`)                          |
| Misc           | lucide-react, sonner, server-only                              |

## Getting Started

From the repository root:

```bash
npm install
npm run dev --workspace=driver_app
```

Or from inside this directory:

```bash
npm install
npm run dev
```

The dev server starts on **port 3003** → <http://localhost:3003>.

### Scripts

| Script    | Description                              |
|-----------|------------------------------------------|
| `npm run dev`  | Start the dev server on port 3003 |
| `npm run build`| Production build                 |
| `npm run start`| Serve the production build       |
| `npm run lint` | Run ESLint                       |

### Environment / Backend

Requires Firebase web config (`src/lib/firebase.ts`) and Firebase Admin (`src/lib/firebase-admin.ts`). See [`firebase-emulator.md`](../firebase-emulator.md) and [`firebase-data-clone/README.md`](../firebase-data-clone/README.md) for local setup and data seeding.

> **Note:** Next.js in this repo ships with breaking changes. Read the docs inside `node_modules/next/dist/docs/` before modifying app code (see [`AGENTS.md`](AGENTS.md)).

## Project Structure

```
src/
├── app/
│   ├── actions/                 # sendPushNotification, setUserRoleClaim
│   ├── [locale]/                # auth (signin/signup) and orders
│   │   └── orders/              # active, marketplace, map, [orderId] detail, settings
│   ├── ~offline/                # Offline fallback
│   └── serwist/                 # Service worker
├── components/
│   ├── approval/                # AccountSetupScreen (waiting for manager activation)
│   ├── orders/                  # OrderCard, OrderMap, RecommendedOrders, RouteControl,
│   │                            # MapFilterPanel, MapSearch, BottomNav, Header...
│   ├── LocationProvider.tsx     # GPS context shared app-wide
│   ├── LocationTracker.tsx      # watchPosition → Firestore writes
│   ├── OnlineToggle.tsx         # go online/offline
│   └── NewOrderToast.tsx / NotificationTracker.tsx
├── hooks/                       # useDriverLocation, useOrders, useRecommendedOrders,
│                                # useOrderActions, useDriverFinance, useFcmToken, ...
├── rtk/
│   ├── api/firestoreApi.ts      # claimOrder, claimOrdersBatch, status mutations
│   └── slices/                  # auth, toggles
└── utilities/                   # routeOptimizer.ts, localStorage helpers
```

## Key Concepts

- **Recommended orders engine** — `routeOptimizer.ts` groups `READY` orders by restaurant, clusters by delivery proximity (3 km), and selects the batch with the largest distance savings (≥ 0.5 km). Full algorithm in [`docs/RECOMMENDED_ORDERS.md`](../docs/RECOMMENDED_ORDERS.md).
- **Transactional claiming** — both single and batch claims run inside Firestore `runTransaction`, so two drivers can never claim the same order.
- **Live GPS streaming** — `navigator.geolocation.watchPosition` writes the driver's position to `drivers/{uid}.liveLocation`, which powers customer-side tracking and route recommendations.
- **Shared state machine** — order transitions come from [`@ordersync/order-utils`](../packages/order-utils), keeping this app consistent with the kitchen (`orders_app`) and customer app.

## Related Documentation

- [`docs/RECOMMENDED_ORDERS.md`](../docs/RECOMMENDED_ORDERS.md) — the recommended-route algorithm and tuning parameters.
- [`docs/orders-alerting-system.md`](../docs/orders-alerting-system.md) — marketplace urgency thresholds for stale orders.
- [`docs/eta-order-tracking.md`](../docs/eta-order-tracking.md) — how the customer ETA consumes the driver's live location.
