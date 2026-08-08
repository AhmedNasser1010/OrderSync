# Orders App — Restaurant Order Management

The **kitchen/restaurant-side** operations app for **Order Sync**. Restaurant staff receive incoming orders in real time, move them through the preparation pipeline, hand off to drivers, and handle cancellations/rejections — with urgent-order alerting and end-of-day workflows.

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

The Orders App is a **Next.js 16 + React 19** PWA designed to be kept open in the kitchen on a tablet or smartphone. It subscribes to Firestore in real time and organizes every order into pipeline tabs, mirroring the shared order state machine:

```
Received → Accepted → Preparing → Ready → Reserved → Picked Up → On Route → Delivered
```

Special terminal states include **Rejected**, **Canceled**, and **Voided**. Because the flow is reactive, all screens update instantly as drivers claim, pick up, and deliver.

## Features

### Real-Time Order Pipeline
- **Tabbed order board** — Received, Preparing, Delivery, Completed, Voided, plus a More menu (Close Day, Settings).
- **Live order cards** — order number, age ("just now", "3m ago"), customer, items, notes, working-hours badges, and "returned by driver" indicators.
- **One-tap status actions** per card: Start / Accept / Prepare / Ready / Picked Up / Start Route / Delivered, with a "Waiting for driver" state.
- **Batch actions** — "Accept & Prepare All" for the received queue.
- **Control menu** per order to move it forward/backward between statuses, or cancel/reject with an optional reason for the customer.

### Urgent Order Alerting
- **Urgency thresholds** that escalate from *warning* to *critical*:
  - Received order (from placed): **1 min → 3 min**
  - Preparing (from preparing): **15 min → 20 min**
- Alerting layers: Web Audio synthesized sounds, Sonner toasts, CSS pulse animations on cards, browser tab-title badges, and in-app banners.
- See [`docs/orders-alerting-system.md`](../docs/orders-alerting-system.md) for full details.

### Order Details & Invoicing
- **Order detail page** (`/order/{orderId}`) with customer information (name, phone, address), itemized list with sizes and notes, subtotal / discount / delivery fees / total.
- **Printable invoice** with a dedicated print dialog.

### Restaurant Availability
- **Working hours** enforcement — "Out of working hours" state.
- **Open Now** action to accept orders until the next scheduled opening.
- **Restaurant status** control — Active / Busy / Paused / Inactive, affecting whether the customer app accepts new orders.

### Search & Filtering
- Global search across order number, customer name, item, or status, with result counts ("Showing X of Y orders") and empty states per tab.

### Settings
- **Close Day** — validates that no active orders remain, then ends the day and resets the order queues.
- **Profile & Language** — switch between English and Arabic.
- **Display settings** — brand logo/cover URLs and promotional / pause messages surfaced in the customer app.
- **Order workflow** — auto-print invoice and **Skip Acceptance** (new orders move straight to Preparing).
- **Appearance** — dark / light mode.

### App Experience
- **PWA** (Serwist) with offline fallback and install prompt.
- **Role-gated auth** — only users assigned to a business can access order queues; unassigned users see an access-restricted screen.
- Auto-login loading screen, themed UI (Radix + shadcn), and toasts.

## Tech Stack

| Category       | Technology                                                     |
|----------------|----------------------------------------------------------------|
| Framework      | Next.js 16 (App Router)                                        |
| UI             | React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Radix UI     |
| State / Data   | Redux Toolkit, RTK Query (`firestoreApi`)                      |
| Backend        | Firebase (Auth + Cloud Firestore), Firebase Admin on the server|
| i18n           | next-intl (en / ar)                                            |
| PWA            | Serwist                                                        |
| Misc           | lucide-react, sonner, react-to-print, zod, react-hook-form, framer-motion |

## Getting Started

From the repository root:

```bash
npm install
npm run dev --workspace=orders_app
```

Or from inside this directory:

```bash
npm install
npm run dev
```

The dev server starts on **port 3002** → <http://localhost:3002>.

### Scripts

| Script    | Description                              |
|-----------|------------------------------------------|
| `npm run dev`  | Start the dev server on port 3002 |
| `npm run build`| Production build                 |
| `npm run start`| Serve the production build       |

### Environment / Backend

Requires a Firebase web config (`src/lib/firebase.ts`) and Firebase Admin (`src/lib/firebase-admin.ts`). Use the local emulator + data clone tooling to develop against a realistic dataset (see [`firebase-emulator.md`](../firebase-emulator.md) and [`firebase-data-clone/README.md`](../firebase-data-clone/README.md)).

## Project Structure

```
src/
├── app/
│   ├── actions/               # Server actions (send marketplace push, role claims)
│   ├── [locale]/              # auth (login/signup) and main (order board, details, settings)
│   ├── settings/              # CloseDay, DisplaySettings, OrderWorkflow, ProfileAndLang, Themes
│   ├── ~offline/              # Offline fallback
│   └── serwist/               # Service worker
├── components/
│   ├── order-card/            # OrderCard, OrderHeader, OrderFooter, ControlMenu
│   ├── print-invoice-dialog/  # Printable invoice
│   ├── popups/                # CloseDay, ReasonDialog
│   ├── shimmer/               # OrderCard skeleton
│   └── ui/                    # Shared UI primitives
├── hooks/
│   ├── order-handlers/        # useOrderHandlers (status transitions)
│   └── useOrders, useOrderUrgency, useCriticalOrderAlerts, useNewOrderAlert, useCloseDay...
├── rtk/
│   ├── api/firestoreApi.ts    # Real-time order queries + mutations
│   └── slices/                # constants, toggles
└── lib/                       # firebase, orderAge, date/time formatting
```

## Key Concepts

- **Shared state machine** — status transitions are defined in [`@ordersync/order-utils`](../packages/order-utils) (`transitions.ts`, `guards.ts`), shared with the driver and customer apps.
- **Fully client-side alerting** — no push service; urgency is derived from `placedAt`/`preparingAt` timestamps (`lib/orderAge.ts`).
- **Driver handoff** — when an order moves to `PICKED_UP`, the driver app takes over routing; the kitchen sees "Waiting for driver" until then.
- **Marketplace push** — the server action notifies drivers when the kitchen marks an order `READY`.

## Related Documentation

- [`docs/orders-alerting-system.md`](../docs/orders-alerting-system.md) — thresholds, sounds, and visual alerts in detail.
- [`docs/eta-order-tracking.md`](../docs/eta-order-tracking.md) — how the customer-side ETA uses order timestamps set here.
