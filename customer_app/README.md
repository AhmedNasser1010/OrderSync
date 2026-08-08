# Customer App — Zajil

The customer-facing food delivery application for **Order Sync**. Customers browse restaurants, explore menus, build a cart, place orders, and track their delivery live on a map — all in a bilingual, installable PWA.

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

The Customer App is a **Next.js 16 + React 19** progressive web app that serves as the public ordering front door of the Order Sync platform. It is fully responsive (mobile-first) and available as a PWA, so customers can install it on their home screen and keep ordering even on weak connections.

Data is streamed in real time from **Cloud Firestore** via **RTK Query** listeners, so restaurant availability, menu pricing, and live order/driver status always stay in sync without manual refresh.

## Features

### Restaurant Discovery (Home)
- **Hero banner** with the current delivery city and headline messaging.
- **Restaurant search** by name with a dedicated search page and results view.
- **Filtering** by cuisine / category (Burger, Pizza, Sandwiches, Pasta, Hawawshi, Crepes, Eastern Pie, etc.).
- **Curated carousels** — "Offers just for you", "Top rated near you", "New on Zajil", "Fast delivery".
- **Restaurant cards** with ratings, availability badge, working hours, and delivery info.
- **How it works** section and a help/CTA strip with a "Call us to order" action.
- Shimmer loading skeletons for a smooth first paint.

### Restaurant Menu
- Full menu with **category sections** and sticky navigation.
- **Item cards** with images (zoomable image viewer), description, sizes (Small / Medium / Large), price, availability flags, and quantity stepper.
- **Item-level discounts** (percentage or fixed) with discount messaging.
- **Restaurant availability handling** — closed / paused / busy states with explanatory popups.
- **Add to cart** with cross-restaurant protection (resets the cart with confirmation).

### Cart & Checkout
- **Cart page** with item cards, quantity controls, bill details (item total, discounts, delivery fees, "You saved"), and clear-cart.
- **Guarded checkout flow** in 3 steps:
  1. **Address & Location** — pick your location on a Leaflet map (find-my-location or manual marker) with reverse address lookup.
  2. **User info** — name + primary/secondary phone numbers (validated, Egyptian phone format), editable profile.
  3. **Payment** — Cash on delivery or online payment (Visa / Vodafone Cash) with tips.
- **Promo / coupon codes** with client-side validation.
- **Order summary** and final **Place Order** action with server-side pricing.
- Cart empty states, restaurant-unavailable handling, and "already have an order in progress" guards.

### Order Tracking (Live)
- Real-time order status timeline: **Placed → Accepted → Preparing → Dispatched → On the way → Delivered**.
- **Live driver location** on a Leaflet map (`OrderTrackingMap`), with "You'll see the driver in real time".
- **ETA (Estimated Time to Arrive)** computed client-side from timeline timestamps + coordinates + live driver GPS.
- **Order feedback** — rate the restaurant and leave a comment after delivery.
- Cancellation notices (self-cancelled, kitchen-cancelled) with clear messaging.

### Account & Profile
- Guest browsing with optional **Google sign-in**.
- Profile sidebar with contact info completion prompts (required before ordering).
- Suspended-account messaging and logout confirmation.

### App Experience
- **PWA** (Serwist) with offline page, install prompt, and manifest.
- **Bilingual** English / Arabic (next-intl, RTL-ready).
- **Dark / light mode** with a themed toaster.
- Skip-to-content accessibility, loading screens, and fully responsive layout.

## Tech Stack

| Category       | Technology                                                     |
|----------------|----------------------------------------------------------------|
| Framework      | Next.js 16 (App Router, Turbopack)                             |
| UI             | React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Radix UI     |
| State / Data   | Redux Toolkit, RTK Query (`firestoreApi`)                      |
| Backend        | Firebase (Auth + Cloud Firestore), Firebase Admin on the server|
| Maps           | Leaflet + react-leaflet                                        |
| i18n           | next-intl (en / ar)                                            |
| Validation     | yup                                                            |
| PWA            | Serwist (service workers, offline support)                     |
| Misc           | lucide-react, sonner toasts, react-slick carousel              |

## Getting Started

The app is part of an npm workspace monorepo. From the repository root:

```bash
npm install
npm run dev --workspace=customer_app
```

Or run from inside this directory:

```bash
npm install
npm run dev
```

The dev server starts on **port 3004** → <http://localhost:3004>.

### Scripts

| Script    | Description                              |
|-----------|------------------------------------------|
| `npm run dev`  | Start the dev server on port 3004 |
| `npm run build`| Production build                 |
| `npm run start`| Serve the production build       |
| `npm run lint` | Run ESLint                       |

### Environment / Backend

The app expects a Firebase web config (via `src/lib/firebase.ts`) and a Firebase Admin setup (via `src/lib/firebase-admin.ts`) for the server-side order-pricing logic. See the root-level [`firebase-emulator.md`](../firebase-emulator.md) and [`firebase-data-clone/README.md`](../firebase-data-clone/README.md) for local emulator setup and seeding.

## Project Structure

```
src/
├── app/
│   ├── actions/            # Server actions (placeOrder)
│   ├── [locale]/           # Localized routes (home, cart, checkout, [slug] menu)
│   ├── ~offline/           # Offline fallback page
│   └── serwist/            # Service worker routes
├── components/
│   ├── Cart/               # Cart page building blocks
│   ├── Checkout/           # 3-step checkout UI (map, info, payment)
│   ├── Home/               # Homepage carousels, hero, how-it-works
│   ├── RestaurantMenu/     # Menu, item cards, sizes, discounts, popups
│   ├── Sidebar/            # Account, order tracking sidebar, location maps
│   └── ui/                 # Shared UI primitives
├── hooks/                  # useCart, useOrders, useMenu, useEta, useRestaurants...
├── rtk/
│   ├── api/firestoreApi.ts # Real-time Firestore queries/mutations
│   └── slices/             # cart, checkout, menu, restaurants, tracking, user...
└── lib/                    # firebase, schema validation, server pricing
```

## Key Concepts

- **Server-side pricing** — order totals, delivery fees and discounts are computed on the server (`src/lib/server/orderPricing.ts` + `packages/order-utils`), not just the client.
- **Delivery fees** — `fee = rate-per-km × distance`, with a minimum fee, configured in the onboarding app.
- **Real-time everything** — Firestore `onSnapshot` listeners drive the menu, cart availability checks, and order tracking.
- **Order state machine** — orders flow through the shared [`@ordersync/order-utils`](../packages/order-utils) transitions (Received → … → Delivered).

## Related Documentation

- [`docs/eta-order-tracking.md`](../docs/eta-order-tracking.md) — how ETA and live tracking are computed.
- [`docs/discount-system.md`](../docs/discount-system.md) — discount rules applied during pricing.
- [`docs/orders-alerting-system.md`](../docs/orders-alerting-system.md) — the alerting used across apps.
- [`docs/firebase-admin-esm-err-require.md`](../docs/firebase-admin-esm-err-require.md) — production `firebase-admin` build caveat.
