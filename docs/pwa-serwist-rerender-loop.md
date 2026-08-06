# PWA (Serwist) Infinite Rerender / Reload Loop — `customer_app`

This document describes a recurring infinite reload ("page rerender") loop caused by the Serwist PWA service worker in `customer_app`, its root cause, the fix applied, and how to prevent regressions.

## Overview

Every app in this monorepo registers a PWA service worker via Serwist (`@serwist/turbopack`). The worker is built from `src/app/sw.ts` and served through the route handler at `src/app/serwist/[path]/route.ts`.

While running **`npm run dev`**, the customer app page would repeatedly reload itself — an infinite "rerender loop" that made the app unusable. The loop recursed after an initial fix, which is why the real root cause (a stale, already-registered service worker) had to be addressed rather than just suppressing registration.

## Symptoms

- The page constantly flashes/reloads while running `next dev`.
- Reloads keep happening even after restarting the dev server.
- The loop appears only on the affected origin/port (e.g. `localhost:3004`) where a service worker had previously been registered.
- In DevTools → Application → Service Workers, an old worker still shows as "Activated and is running".

## Root Cause

The loop is caused by three things combining:

### 1. A stale service worker already registered in the browser

`SerwistProvider`'s `disable` prop only prevents **new** registrations. It does **not** unregister a service worker that is already registered and controlling the page.

A worker is registered on an origin once — it persists in the browser across sessions and port restarts. Any worker registered **before** the dev-disable was introduced, or during a prior `next start` (production) run on the same origin/port, keeps controlling `localhost:3004` no matter what the app code says in dev.

### 2. Dev-mode SW bytes change on every request

In dev, the route handler `src/app/serwist/[path]/route.ts` still serves `/serwist/sw.js`. Turbopack recompiles it per request, so the served bytes change on every page load.

The worker in `src/app/sw.ts` sets:

```ts
skipWaiting: true,
clientsClaim: true,
```

Combined, this creates a self-sustaining cycle:

```
page load
  → browser checks /serwist/sw.js → bytes changed (dev rebuild)
  → "new version" found → installs
  → skipWaiting → activates immediately
  → clientsClaim → claims the page → controllerchange
  → page reloads
  → check again → bytes changed again → loop
```

### 3. `reloadOnOnline` reloads on network events

The base provider defaults `reloadOnOnline: true`, which registers a `window.addEventListener("online", location.reload)`. Critically, **these hooks still run even when the component renders `null`** (i.e. while `disable` is true). In dev, `online` events fire repeatedly (HMR reconnect, network flapping, DevTools), so even with registration blocked the page can reload in a loop.

## The Fix

Two layers of defense, both applied in `customer_app`:

### A. Unregister stale workers outside production — synchronously, before hydration

`src/app/layout.tsx` renders an inline script **only when `process.env.NODE_ENV !== "production"`**, right after `<body>` opens. It runs during HTML parse — before React even hydrates — so even a tight reload loop gets broken on the first load:

```tsx
{process.env.NODE_ENV !== "production" && (
  <script
    dangerouslySetInnerHTML={{
      __html: `(function(){if(!("serviceWorker" in navigator))return;navigator.serviceWorker.getRegistrations().then(function(r){for(var i=0;i<r.length;i++)r[i].unregister();});})();`,
    }}
  />
)}
```

### B. Unregister stale workers on mount + neutralize `reloadOnOnline` in dev

`src/app/serwist.tsx` now wraps the base `SerwistProvider`:

```tsx
export function SerwistProvider({ disable, reloadOnOnline, ...props }) {
  useEffect(() => {
    if (!disable) return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        if (registrations.length) {
          return Promise.all(
            registrations.map((r) => r.unregister())
          );
        }
      })
      .catch(() => {});
  }, [disable]);

  return (
    <BaseSerwistProvider
      disable={disable}
      reloadOnOnline={disable ? false : reloadOnOnline}
      {...props}
    />
  );
}
```

- **`disable`** → while disabled (non-production), every registration for the origin is unregistered on mount.
- **`reloadOnOnline={false}`** → while disabled, the `online`-event reload listener is switched off, so network flapping can no longer force reloads in dev.

## Production Behavior

Unchanged. In `next build` / `next start`, `process.env.NODE_ENV === "production"`:

- The inline unregister script is **not** rendered.
- The wrapper does **not** unregister anything.
- `SerwistProvider` registers the worker normally (`disable` is false).
- `reloadOnOnline` keeps its caller-provided value (defaults to `true`).

## Prevention / Verification

- **Never re-enable the SW in dev.** Keep `disable={process.env.NODE_ENV !== "production"}` in `src/app/layout.tsx` and `globPatterns: []` for development in `src/app/serwist/[path]/route.ts`.
- **Don't rely on `disable` alone** to clear old workers — that prop has never unregistered anything. The unregister logic in `serwist.tsx` + the inline layout script is what clears stale state.
- **If a tab is still looping**: hard refresh once (`Ctrl/Cmd+Shift+R`). The inline script unregisters the worker on the next load, and it stays unregistered while developing.
- **Optional hardening (not yet applied):** make the SW route return `404`/empty when `NODE_ENV === "development"`, so no SW script can ever be served in dev — guaranteeing a dev loop cannot self-sustain from any registration path.

## File Reference

| File | Role |
|---|---|
| `customer_app/src/app/layout.tsx` | Root layout — renders the pre-hydration SW-unregister inline script in non-production |
| `customer_app/src/app/serwist.tsx` | Client wrapper around `SerwistProvider` — unregisters stale workers + disables `reloadOnOnline` when disabled |
| `customer_app/src/app/serwist/[path]/route.ts` | Serves `/serwist/sw.js`; dev uses `globPatterns: []` (no precache) |
| `customer_app/src/app/sw.ts` | The service worker (`skipWaiting`, `clientsClaim`, `navigationPreload`, offline fallback) |
| `customer_app/src/app/~offline/page.tsx` | Offline fallback page |

> Note: the same pattern applies to the other apps (`driver_app`, `manager_app`, `orders_app`) — they received the same dev-disable in commit `a47670c` and should get the same unregister hardening if the loop shows up there.
