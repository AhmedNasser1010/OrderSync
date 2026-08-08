# Onboarding App — Partner & Platform Admin

The **partner/admin** application for **Order Sync**. Partners (platform operators / restaurant owners) onboard and manage restaurants, build menus with rich discount rules, manage users (drivers, customers, managers), monitor the fleet and orders on a live map, moderate reviews, configure platform delivery pricing, and export business data.

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

The Onboarding App is a **Next.js 16 + React 19** dashboard (formerly known as the **Partner App**) that acts as the control plane for the whole Order Sync platform. It is the place where restaurants are created, menus and discounts are authored, and the platform's operating parameters (delivery fees) are set — everything the customer, orders, manager, and driver apps depend on.

## Features

### Restaurant Management
- **Restaurant list** — searchable, filterable table of all businesses with statuses.
- **Create / edit restaurant** with a comprehensive form built from modular sections:
  - **Restaurant info** — name (incl. Arabic name), description, logo & cover images (image edit dialog), brand slug, working-hours configuration.
  - **Address & location** — address fields plus a Leaflet map marker.
  - **Owner section** — owner identity and contact details.
  - **Contact numbers** — primary and secondary phone numbers.
  - **Cuisines** — multi-select cuisine/category tags.
  - **Opening hours** — per-day schedules driving availability in the customer app.
  - **Cook time** — estimated preparation time used for ETA and urgency alerts.
  - **Additional info** — ordering, delivery, and display preferences.
  - **Live preview card** while editing.

### Menu Builder & Discount Engine
- **Menu management** per restaurant (`/restaurants/{id}/menu`):
  - Categories and category headers with ordering.
  - Menu items with name, description, image, sizes (Small / Medium / Large), price, availability, and hide/show toggles.
- **Discount system** — a rich editor on top of the shared discount engine:
  - Item-level and **order-level** discounts, percentage (`P`) or fixed (`FIXED`).
  - **Expiration dates** and date windows (`startAt` / `expireAt`).
  - **Conditions** (First Purchase, Total Spent, Total Items, Total Orders, Account Age, Days Since Last Order) combined with AND/OR logic.
  - **Time-based rules** (days + hours, e.g. happy hour).
  - **Stacking modes** — Highest / Lowest / Stack / Priority / Exclusive.
  - **Customer segments** — New, Active, Inactive, VIP, At Risk.
  - **Usage limits**, **min order total**, and **min cart items**.
  - See [`docs/discount-system.md`](../docs/discount-system.md) for the full spec.

### User Management
- **Drivers table** — add/edit drivers, approve activation, hide/delete, filter and export.
- **Customers table** — browse and manage customer accounts with filters and export.
- **Managers table** — create and assign business managers.
- **User creation flows** include admin-side account creation and the ability to **delete auth users** via server actions.
- All tables support search, filters, pagination, hide/delete dialogs, and **Excel export** (`xlsx` + `file-saver`).

### Live Map (Fleet Monitoring)
- **Live map** of the operating area with toggleable markers for **drivers, customers, restaurants, and orders**.
- **Real-time driver locations** streamed from Firestore (`useLiveDriverLocations`).
- Filters panel, fit-to-bounds, popups with entity details, a stats bar (counts per type), and a legend.
- Dark/light map rendering.

### Reviews Moderation
- **Reviews table** — view customer ratings/comments across restaurants, filter by rating/restaurant, and **hide** inappropriate reviews from the customer app.

### Received Orders
- **Received orders table** — read-only view of all incoming orders across the partner's businesses.
- Filters by restaurant and search, pagination, and **Excel export** of order data (number, customer, restaurant, pricing, timestamps).

### Platform Settings
- **Delivery fees** — global `rate-per-km` and minimum delivery fee used by the customer app and validated on every order (`services` document).

### Auth & Layout
- Sign in / sign up (email+password or Google) with **partner role claim** enforcement.
- Persistent sidebar + header layout, dark/light theme, and page-level auth guards.

## Tech Stack

| Category       | Technology                                                     |
|----------------|----------------------------------------------------------------|
| Framework      | Next.js 16 (App Router)                                        |
| UI             | React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Radix UI     |
| Forms          | react-hook-form + zod validation                               |
| State / Data   | Redux Toolkit, RTK Query (`firestoreApi`)                      |
| Backend        | Firebase (Auth + Cloud Firestore), Firebase Admin on the server|
| Maps           | Leaflet + react-leaflet                                        |
| Export         | xlsx, file-saver                                               |
| Misc           | framer-motion, lucide-react, date-fns, next-themes             |

## Getting Started

From the repository root:

```bash
npm install
npm run dev --workspace=onboarding_app
```

Or from inside this directory:

```bash
npm install
npm run dev
```

The dev server starts on **port 3000** → <http://localhost:3000>.

### Scripts

| Script    | Description                              |
|-----------|------------------------------------------|
| `npm run dev`  | Start the dev server on port 3000 |
| `npm run build`| Production build                 |
| `npm run start`| Serve the production build       |
| `npm run lint` | Run ESLint                       |

### Environment / Backend

Requires Firebase web config (`src/lib/firebase.ts`) and Firebase Admin (`src/lib/firebase-admin.ts`). Use the local emulator + data clone tooling for development (see [`firebase-emulator.md`](../firebase-emulator.md) and [`firebase-data-clone/README.md`](../firebase-data-clone/README.md)).

> **Note:** Next.js in this repo ships with breaking changes. Read the docs inside `node_modules/next/dist/docs/` before modifying app code (see [`AGENTS.md`](AGENTS.md)).

## Project Structure

```
src/
├── app/
│   ├── actions/                 # deleteAuthUser, getUserProvider, getUserUid, setUserRoleClaim
│   ├── restaurants/             # list, new, [id]/edit, [id]/menu
│   ├── drivers/ customers/ managers/ reviews/ banners/ received-orders/ map/ settings/
│   ├── auth/                    # signin / signup
│   └── StoreProvider.tsx
├── components/
│   ├── forms/                   # RestaurantForm and its sections + PreviewCard
│   ├── menu/                    # category-form, menu-item-form, DiscountDialog, ConditionsEditor
│   ├── dashboard/               # Drivers/Customers/Managers/Restaurants/Reviews/ReceivedOrders tables + filters
│   ├── banners/                 # BannerFormDialog, BannerPreview
│   ├── live-map/                # LiveMap, MapMarkers, FilterPanel, MapLegend, MapStatsBar
│   └── ui/                      # Shared UI primitives
├── hooks/                       # useMenuData, useRestaurantForm, useLiveDriverLocations, ...
├── rtk/
│   ├── api/firestoreApi.ts      # Real-time Firestore queries/mutations
│   └── slices/                  # constants, menu, ui
└── lib/                         # firebase, validators, export-utils, menu-types, mock-data
```

## Key Concepts

- **Discount engine** — `packages/order-utils/src/discount/*` holds the pure logic (`applyOrderDiscounts`, `applyStackingRules`, `evaluateConditions`, `evaluateSegments`, `evaluateTimeRules`, `validatePromoCode`, ...). The Onboarding App is where these rules are authored; the customer app evaluates them at checkout.
- **Shared data model** — restaurants, menus, users, orders, reviews, and `services` (delivery pricing) live in Firestore and are consumed by every other app. Type definitions are shared via [`@ordersync/types`](../packages/types).
- **Role-based access** — each app enforces its own claim (`partner`, `manager`, `driver`); the onboarding app manages which users belong to which businesses.
- **Export workflow** — `lib/export-utils.ts` powers the Excel exports across the user, review, and received-orders tables.

## Related Documentation

- [`docs/discount-system.md`](../docs/discount-system.md) — full discount feature spec.
- [`docs/legacy-discount-system.md`](../docs/legacy-discount-system.md) and [`docs/legacy-discount-symbols.md`](../docs/legacy-discount-symbols.md) — the original, simpler discount format for reference.
- [`docs/eta-order-tracking.md`](../docs/eta-order-tracking.md) — how cook time / opening hours feed the ETA.
