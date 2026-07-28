# Orders Alerting System

This document describes the order alerting mechanisms in `orders_app` (restaurant/manager side) and `driver_app` (driver side).

## Overview

The alerting system is entirely **client-side and browser-based**. There are no push notifications, background workers, or external notification services. Instead, the system uses a layered combination of:

- Real-time Firestore data subscriptions driving reactive state
- Web Audio API synthesized sound alerts
- Sonner toast notifications
- CSS animation-based visual alerts on UI elements
- Browser tab title badges
- In-app banner warnings

---

## Urgency Thresholds

| Scenario | Warning | Critical |
|---|---|---|
| Received order (from `placedAt`) | 1 min | 3 min |
| Preparing order (from `preparingAt`) | 15 min | 20 min |
| Marketplace stale (driver, from `createdAt`) | 3 min | 7 min |

Defined in `orders_app/src/lib/orderAge.ts` and `driver_app/src/components/orders/OrderCard.tsx`.

---

## orders_app Alerting

### New Order Sound Alert

**File:** `orders_app/src/hooks/useNewOrderAlert.ts`

Plays an ascending tone (880Hz → 1047Hz → 880Hz) via Web Audio API when the received order count increases while the user is viewing the **RECEIVED** tab. The first render is skipped to avoid false alerts on mount.

**Trigger:** `receivedCount > prevCount && activeTab === "RECEIVED"`

**Consumed at:** `orders_app/src/app/[locale]/(main)/page.tsx:12`

### Critical Order Alerts (Sound + Toast)

**File:** `orders_app/src/hooks/useCriticalOrderAlerts.ts`

The most aggressive alerting mechanism. Monitors received and preparing orders for critical age status. When triggered, plays a descending-then-ascending three-tone warning sound and shows a Sonner toast, then **repeats every 30 seconds** until the order leaves the critical state.

| Order State | Condition | Toast Message |
|---|---|---|
| Received, first alert | Age ≥ 3 min | `"Order #N waiting too long!"` |
| Received, repeating | Age ≥ 3 min | `"Order #N still waiting!"` |
| Preparing, first alert | Duration ≥ 20 min | `"Order #N taking too long to prepare!"` |
| Preparing, repeating | Duration ≥ 20 min | `"Order #N still being prepared!"` |

Uses per-order timers (`useRef<Map>`) and first-alert tracking (`useRef<Set>`). Cleans up timers when orders leave critical state or are removed.

**Consumed at:** `orders_app/src/app/[locale]/(main)/page.tsx:14`

### Per-Order Urgency Sound

**File:** `orders_app/src/hooks/useOrderUrgency.ts`

Tracks urgency per individual order card. Plays a sound (660Hz → 880Hz → 660Hz) when an order's urgency level transitions to **warning** or **critical**. Polls every 10 seconds.

**Consumed at:** `orders_app/src/components/order-card/OrderCard.tsx:25`

### Browser Tab Title Badge

**File:** `orders_app/src/hooks/useDocumentTitle.ts`

Updates the browser tab title to show new order count as a passive visual alert:

- Orders pending: `"(N) New Orders - Orders"`
- No orders: `"Orders"`

**Consumed at:** `orders_app/src/app/[locale]/(main)/page.tsx:13`

### Tab Flash Animation

**Files:** `orders_app/src/app/OrdersTabs.tsx:140-153`, `orders_app/src/globals.css:182-221`

When the RECEIVED tab has unviewed orders or the PREPARING tab has orders with urgency, the tab button pulses with `animate-tab-flash` (1.5s ease-in-out infinite). Light and dark variants are defined in CSS.

The `hasPreparingUrgency` flag is computed in `orders_app/src/app/[locale]/(main)/layout.tsx:12-15` by checking if any preparing order has urgency ≠ `"normal"`.

### Order Card Visual Styling

**File:** `orders_app/src/components/order-card/OrderCard.tsx:10-14`

| Urgency | Border | Shadow | Animation |
|---|---|---|---|
| Normal | — | — | — |
| Warning | `border-amber-300` | `shadow-amber-200/50` | — |
| Critical | `border-red-400` | `shadow-red-200/50` | `animate-pulse` |

Only applied when viewing the RECEIVED or PREPARING tabs.

### Ready State Pulsing Indicator

**File:** `orders_app/src/components/order-card/OrderFooter.tsx:97-105`

When an order is in `READY` status (waiting for driver pickup), shows a pulsing green dot with `"Ready"` / `"Waiting for driver"` labels using `animate-ping`.

---

## driver_app Alerting

### New Order Sound + Continuous Reminder

**File:** `driver_app/src/hooks/useNewOrderAlert.ts`

Two behaviors:

1. **Count increase:** Plays notification sound when marketplace order count increases.
2. **Continuous reminder:** When the driver has no active orders but unclaimed marketplace orders exist, plays the sound **immediately** then **repeats every 10 seconds**.

**Consumed at:** `driver_app/src/app/orders/active/page.tsx:41`

### Marketplace Tab Flash

**File:** `driver_app/src/components/orders/BottomNav.tsx:23-25,46`

When the driver has no active orders AND marketplace orders are available, the "Marketplace" tab flashes with `animate-tab-flash`. CSS defined in `driver_app/src/app/globals.css:120-149`.

### Stale Order Visual Alerts

**File:** `driver_app/src/components/orders/OrderCard.tsx:118-128,209-266,420-426`

| Stale Level | Threshold | Badge Text | Dot Color | Border | Time Text |
|---|---|---|---|---|---|
| Warning | 3 min | "Waiting" | Amber pulsing | Amber left | Amber |
| Critical | 7 min | "Urgent" | Red pulsing | Red left | Red |

Both include an `AlarmClock` icon. Polls every 30 seconds. Only applies to marketplace variant cards.

### Stale Alerts on Recommended Orders

**File:** `driver_app/src/components/orders/RecommendedOrders.tsx:24-34,56-69,88-137`

Same stale-level logic as OrderCard (3-min warning, 7-min critical). Shows pulsing dots, colored borders, and `AlarmClock` icon. Polls every 30 seconds.

### Finance Warning Banner

**File:** `driver_app/src/components/FinanceWarningBanner.tsx`

Persistent banner when the driver's cash balance approaches configured limits:

| State | Icon | Message |
|---|---|---|
| Warning (amber) | `AlertTriangle` | `"Your cash balance ($X.XX) has reached the warning limit ($Y.YY)."` |
| Blocked (red) | `Ban` | `"Your cash balance ($X.XX) has reached the limit ($Y.YY). You cannot claim new orders."` |

Powered by `driver_app/src/hooks/useDriverFinance.ts` which reads `finance.currentCash`, `finance.warningLimit`, and `finance.blockLimit` from the Firestore driver document.

**Mounted at:** `driver_app/src/app/orders/layout.tsx:15`

### Finance Block on Marketplace

**File:** `driver_app/src/app/orders/marketplace/page.tsx:91-111`

When `isBlocked` is true, the marketplace view is replaced with a blocking screen showing a red `Ban` icon and a message directing the driver to contact their manager. Also disables the Claim button on the order detail page.

### Location Permission Warning

**File:** `driver_app/src/components/LocationPermissionBanner.tsx`

| State | Color | Message |
|---|---|---|
| Denied | Red | `"Location access denied. Enable it in your browser settings to go online."` |
| Unsupported | Yellow | `"Geolocation is not supported by your browser"` |

**Mounted at:** `driver_app/src/app/orders/layout.tsx:14`

### Native alert() for Errors

**File:** `driver_app/src/app/orders/[orderId]/page.tsx`

Uses browser-native `alert()` for action failures: claim, start delivery, start route, complete delivery, and cancel order. Also used in `OrderCard.tsx:231` for generic action failures.

---

## Sound Patterns

All sounds are synthesized via Web Audio API (`AudioContext` + `OscillatorNode` + `GainNode`).

| Sound | Pattern | Volume | Duration | Used In |
|---|---|---|---|---|
| New Order | 880Hz → 1047Hz → 880Hz (ascending) | 0.2 | 300ms | Both apps |
| Critical Alert | 880Hz → 660Hz → 880Hz (descending-ascending) | 0.25 | 360ms | orders_app |
| Urgency Transition | 660Hz → 880Hz → 660Hz (ascending-descending) | 0.2 | 300ms | orders_app |

---

## Data Pipeline

Alerting is driven by real-time Firestore `onSnapshot` listeners:

### orders_app

**File:** `orders_app/src/rtk/api/firestoreApi.ts:93-126`

`fetchActiveOrders` subscribes to all orders for the business. Uses RTK Query `onCacheEntryAdded` + `onSnapshot`. React re-renders drive alert evaluations.

### driver_app

**File:** `driver_app/src/rtk/api/firestoreApi.ts`

- `fetchMarketplaceOrders` (lines 94-130): Subscribes to `READY` orders globally, ordered by `createdAt`.
- `fetchMyOrders` (lines 133-177): Subscribes to orders assigned to this driver (excluding terminal statuses).
- `fetchUserData` (lines 28-66): Subscribes to driver document for finance data.

---

## Configuration Summary

| Setting | Value | Location |
|---|---|---|
| Received order warning | 1 min | `orders_app/src/lib/orderAge.ts:3` |
| Received order critical | 3 min | `orders_app/src/lib/orderAge.ts:4` |
| Preparing order warning | 15 min | `orders_app/src/lib/orderAge.ts:6` |
| Preparing order critical | 20 min | `orders_app/src/lib/orderAge.ts:7` |
| Marketplace stale warning (driver) | 3 min | `driver_app/.../OrderCard.tsx:118` |
| Marketplace stale critical (driver) | 7 min | `driver_app/.../OrderCard.tsx:119` |
| Critical alert repeat interval | 30 sec | `orders_app/.../useCriticalOrderAlerts.ts:34` |
| Driver continuous reminder interval | 10 sec | `driver_app/.../useNewOrderAlert.ts:5` |
| Urgency check polling | 10 sec | `orders_app/.../useOrderUrgency.ts:32` |
| Stale level check polling (driver) | 30 sec | `driver_app/.../OrderCard.tsx:217` |
| Tab flash animation | 1.5s infinite | `globals.css` in both apps |

---

## Limitations

The current system does **not** include:

- Push notifications (no FCM, no `firebase/messaging`)
- Background service workers for alerts
- Scheduled tasks or cron jobs
- Database models for notifications or alerts
- External notification services (OneSignal, Expo Notifications, etc.)
- Vibration API usage
- Persistent notification storage
- User-configurable alert preferences (sound on/off, volume, etc.)
- Notification history or read/unread tracking
