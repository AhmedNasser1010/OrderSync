# Manager App — Analytics & Business Dashboard

The **business intelligence** application for **Order Sync**. Restaurant managers get a live "Today" overview plus a deep, filterable analytics dashboard covering revenue, orders, customer behavior, operations, and business health — all computed from order history in Firestore.

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

The Manager App is a **Next.js 16 + React 19** dashboard for the people who run the restaurants. It combines two views:

- **Today** — a real-time snapshot of the current day's activity (KPIs, balance, active orders, statuses).
- **Analytics** — a historical deep-dive with flexible date ranges, charts, and AI-style insights.

All metrics are derived **client-side** from order documents by [`utilities/analytics`](../manager_app/src/utilities/analytics), so no separate reporting backend is required.

## Features

### Today View (Real-Time)
- **Today's KPIs** — revenue, orders, average order value, cancellation rate.
- **Balance card** — split between paid and unpaid orders.
- **Active orders** — live list of orders currently in the pipeline.
- **Status breakdown** — how today's orders are distributed across statuses.
- **Top items** — best sellers so far today.
- **Customer insights** — who ordered today, returning vs. new.
- Updates automatically as orders arrive (Firestore listeners).

### Analytics Dashboard
- **Date range selector** — All time, last 24h, last 3h, last 7d, last 30d, last 3/6 months, or a custom range.
- **KPI cards** — Revenue, Orders, Average Order Value, Cancellation Rate, each with **percentage change vs. the previous period**.
- **AI Insights** — generated observations: best-selling item, customer retention %, top revenue category.
- **Sales Trends** — line chart toggling between revenue and order volume over time.
- **Top Selling Items** — ranked by revenue with quantity sold and growth percentage.
- **Category Performance** — revenue contribution per menu category with performance status indicators.
- **Customer Analytics** — total customers, returning-customer %, top customer by order value.
- **Top Delivery Areas** — geographic split of delivery volume and share.
- **Operations Performance** — average prep time, average delivery time, and order completion rate vs. benchmarks.
- **Payment Methods** — distribution of orders by payment method.
- **Business Health Score** — a composite score from revenue growth, retention, and efficiency, with strengths, areas to improve, and trend indicators.
- Inline **widget help** tooltips explaining every card.
- Empty-state handling for ranges with no data.

### Settings
- Theme (light / dark) and language (English / Arabic).
- Logout with confirmation.

### Access Control
- **Role-gated auth** — only business managers can sign in (`accessDenied` otherwise).
- **Unassigned user screen** — signed-in users not yet linked to a business are told access is restricted and can sign out.
- Auto-login loading screen for a smooth re-entry.

## Tech Stack

| Category       | Technology                                                     |
|----------------|----------------------------------------------------------------|
| Framework      | Next.js 16 (App Router)                                        |
| UI             | React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Radix UI     |
| Charts         | Recharts                                                       |
| State / Data   | Redux Toolkit, RTK Query (`firestoreApi`)                      |
| Backend        | Firebase (Auth + Cloud Firestore), Firebase Admin on the server|
| Dates          | date-fns, react-day-picker                                     |
| i18n           | next-intl (en / ar)                                            |
| PWA            | Serwist                                                        |

## Getting Started

From the repository root:

```bash
npm install
npm run dev --workspace=manager_app
```

Or from inside this directory:

```bash
npm install
npm run dev
```

The dev server starts on **port 3001** → <http://localhost:3001>.

### Scripts

| Script    | Description                              |
|-----------|------------------------------------------|
| `npm run dev`  | Start the dev server on port 3001 |
| `npm run build`| Production build                 |
| `npm run start`| Serve the production build       |
| `npm run lint` | Run ESLint                       |

### Environment / Backend

Requires Firebase web config (`src/lib/firebase.ts`) and Firebase Admin (`src/lib/firebase-admin.ts`). For local development with realistic data, start the emulator and clone production data (see [`firebase-emulator.md`](../firebase-emulator.md) and [`firebase-data-clone/README.md`](../firebase-data-clone/README.md)).

## Project Structure

```
src/
├── app/
│   ├── actions/                  # Server actions (role claims)
│   ├── [locale]/
│   │   ├── (auth)/               # login / signup
│   │   └── (main)/               # dashboard (analytics), today, settings
│   ├── ~offline/                 # Offline fallback
│   └── serwist/                  # Service worker
├── components/
│   ├── dashboard/                # kpi-cards, sales-trends, top-items, category-perf,
│   │                             # customer-analytics, delivery-areas, operations-perf,
│   │                             # payment-methods, business-score, insights-card, no-data
│   ├── today/                    # today-kpi-cards, today-balance-card, today-active-orders,
│   │                             # today-status-breakdown, today-top-items, today-customer-insights
│   └── ui/                       # charts, calendar, select, tabs, actions-menu, widget-help
├── hooks/                        # useAnalytics, useTodayOrders, useUser
├── rtk/
│   └── api/firestoreApi.ts       # Real-time Firestore queries
└── utilities/analytics/          # buildAnalyticsFromOrders, calculateMetrics,
                                  # calculateGrowth, generateDashboardData, getAnalyticsRanges...
```

## Key Concepts

- **Client-side analytics engine** — `utilities/analytics/buildAnalyticsFromOrders.ts` reduces raw order documents into KPIs, trends, top items, categories, and segments for any range.
- **Two views, one data source** — Today and Analytics are both derived from live order subscriptions; Today is unbounded to the current day, Analytics respects the selected range.
- **Growth math** — every KPI compares against the immediately preceding period (`calculatePercentageChange`, `getGrowthPercentage`).
- **Manager role** — the app enforces the `manager` role claim and business assignment; the onboarding app is where managers are created and assigned.

## Related Documentation

- [`docs/discount-system.md`](../docs/discount-system.md) — discount features surfaced in analytics and set up by partners.
- [`docs/eta-order-tracking.md`](../docs/eta-order-tracking.md) — prep/delivery time definitions feeding Operations Performance.
