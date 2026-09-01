# Cash Back Engine — Wallet, Credits, Redemption & Campaigns

> End-to-end cash back feature for the OrderSync food-delivery platform: decimal EGP
> customer wallet balances, a credits ledger, admin audit trail, redemption at
> checkout, cashback accrual on delivery, clawback on cancellation, lazy
> auto-expiration, and (planned) campaign triggers.

---

## Table of Contents

1. [Overview & Goals](#overview--goals)
2. [Wallet Semantics (Design Decisions)](#wallet-semantics-design-decisions)
3. [Data Model](#data-model)
4. [Core Wallet Service (`packages/order-utils`)](#core-wallet-service)
5. [Security Model & Firestore Rules](#security-model--firestore-rules)
6. [Order Placement / Redemption Flow](#order-placement--redemption-flow)
7. [Cashback on Delivery](#cashback-on-delivery)
8. [Cancellation / Clawback / Refund](#cancellation--clawback--refund)
9. [Auto-Expiration (TTL)](#auto-expiration-ttl)
10. [Onboarding Admin UI (Audit & Manual Adjust)](#onboarding-admin-ui)
11. [Customer Wallet UI](#customer-wallet-ui)
12. [Remaining Work](#remaining-work)
13. [Updated File Reference](#updated-file-reference)

---

## Overview & Goals

This feature gives every customer an EGP wallet that accrues **cash back** on
delivered orders. The wallet can be **redeemed at checkout** to lower the amount
the customer pays. The restaurant/finance split is untouched — **the platform
absorbs the discount**. An admin audit trail records every credit/debit.

**High-level flow:**

```
Order Delivered ──► cashback ORDER_EARN credit created
Customer Checks Out ──► selects "use wallet" ──► redemption writes final reduced total
Order Cancelled ──► ORDER_EARN credit clawed back, redeemed credits restored
Credit expires after `wipeDays` (lazy expiry + Firestore TTL)
Admin may grant/revoke credits manually (with mandatory reason) → audit log
```

---

## Wallet Semantics (Design Decisions)

These decisions drive the implementation and must not be silently changed.

- **Cashback is earned on DELIVERY**, not on placement. Before delivery there is
  no earned credit.
- **On wallet redemption, the restaurant still collects the full amount; the
  platform absorbs the loss.** Do **not** change `calculateOrderFinance`'s
  commission split — only the customer-facing total is reduced.
- **Cashback is global per customer**, not per restaurant. There is one
  `wallet_credits` / `wallet_transactions` store per user across all restaurants.
- **Campaigns run via Next.js server actions (Admin SDK)**, not Cloud Functions.
- **Key pricing-match rule:** `placeOrder.ts`'s `pricingMatches()` compares the
  client `total` to the server `total` (both are *base* totals **BEFORE** wallet
  redemption). The client sends the base `total` plus a separate
  `walletRedeemed`; the server applies redemption **AFTER** `pricingMatches`
  passes, writing the final reduced total. This keeps pricing-match consistent.
- **Idempotency:** cashback grant is idempotent via `pricing.cashbackEarned`; a
  cancelled order cannot be re-clawed more than once (guard on terminal state).
- **Exclusivity:** cashback is **not** earned if the cart carried a
  discount/promo, and wallet redemption does **not** stack with a promo coupon.

---

## Data Model

### Types (`packages/types/src/wallet.ts`)

Additional fields added to `customer.ts`, `services.ts`, and `order.ts` (see
[File Reference](#updated-file-reference)).

**`WalletCredit`** — one row per credit grant.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | Firestore doc id |
| `userId` | `string` | customer `customers/{uid}` |
| `amount` | `number` | decimal EGP |
| `expiresAt` | `number` | epoch ms; set to `createdAt + wipeDays` |
| `source` | `WalletCreditSource` | `CAMPAIGN` \| `ADMIN_ADJUST` \| `ORDER_EARN` \| `WELCOME` \| `WINBACK` |
| `status` | `WalletCreditStatus` | `ACTIVE` \| `REDEEMED` \| `EXPIRED` \| `CLAWED_BACK` |
| `orderId?` | `string` | for `ORDER_EARN` |
| `campaignId?` | `string` | future campaigns |
| `createdBy?` | `string` | admin uid for `ADMIN_ADJUST` |
| `reason?` | `string` | admin reason (mandatory for manual adjust) |
| `createdAt` | `number` | epoch ms |

**`WalletTransaction`** — audit ledger row.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | Firestore doc id |
| `userId` | `string` | |
| `creditId` | `string` | which credit was touched |
| `type` | `WalletTransactionType` | `GRANT` \| `REDEEM` \| `EXPIRE` \| `CLAWBACK` \| `ADMIN_ADJUST` |
| `amount` | `number` | signed? amount (debits are negative in the rows written) |
| `balanceAfter` | `number` | customer balance after the op |
| `orderId?` | `string` | |
| `actorId` | `string` | system/admin uid that caused the change |
| `reason?` | `string` | |
| `originalCreditId?` | `string` | for clawback restore |
| `originalExpiresAt?` | `number` | keep original expiry on restore |
| `createdAt` | `number` | epoch ms |

**`CashbackConfig`** — platform-level config stored in `services/platform`.

```ts
interface CashbackConfig {
  enabled: boolean;
  cashbackPercent: number;      // percentage of food revenue
  wipeDays: number;             // credit lifetime in days
  redemptionThreshold: number;  // min order total before wallet can be used
  maxCashbackPerTx: number;     // cap on cashback per delivered order
}
```

**Customer wallet balance:** `customers/{uid}.wallet = { balance: number, updatedAt: number }`.
`balance` is the sum of the positive `amount` fields of all `ACTIVE` credits and
is updated transactionally inside every wallet operation.

**Order pricing additions:** `order.pricing.cashbackEarned`, and payment holds
`order.payment.walletCreditIds: string[]` (credits consumed at redemption).

---

## Core Wallet Service

Location: `packages/order-utils/src/wallet/`, re-exported from
`packages/order-utils/src/index.ts` under the `@ordersync/order-utils` package.

| File | Exports | Purpose |
|------|---------|---------|
| `context.ts` | `createWalletCtx`, `WalletCtxDeps` | Builds the wallet I/O context (doc refs + the active Firestore transaction) |
| `grantCredit.ts` | `grantCredit`, `getCustomerBalance`, `writeTx` | Creates a credit + GRANT transaction; keeps balance in sync |
| `redeemCredits.ts` | `redeemCredits` | FIFO redemption (soonest expiry first); partial reduces `amount`, full sets `status = REDEEMED` |
| `clawbackCredits.ts` | `clawbackOnCancellation` | Claws back `ORDER_EARN` credit (→ `CLAWED_BACK`) and restores redeemed credits with original `expiresAt` as new `ACTIVE` credits |
| `expireCredits.ts` | `expireCredits` | Marks expired credits `EXPIRED` + writes EXPIRE rows (lazy expiry) |
| `getActiveCredits.ts` | `getActiveCredits` | Filters a credit list to the still-valid `ACTIVE` ones (lazy expiry) |
| `types.ts` | `round2`, `DAY_MS`, `DEFAULT_WIPE_DAYS`, credit/ctx types | Shared constants & types |

**Implementation notes:**

- `createWalletCtx` takes `{ transaction, customerDocRef, creditsCol, transactionsCol }`.
  The caller supplies these from either the **client SDK** (`runTransaction`) or
  the **Admin SDK** (`db.runTransaction`), so the exact same service code runs in
  the browser apps (for redemption reads) and in the server actions (for writes).
- **Firestore limitation:** `transaction.get()` supports doc refs only, **not
  queries**. Active/expired/earned/redeemed credits are therefore fetched via a
  normal `getDocs` query **before** opening the transaction, then the in-memory
  lists are passed into `redeemCredits` / `clawbackOnCancellation`.
- `round2` keeps all amounts to 2 decimal places (EGP has no subunit beyond 0.01).

---

## Security Model & Firestore Rules

- `wallet_credits` and `wallet_transactions` are **immutable for the client**:
  `create / update / delete` are denied for client apps in `firestore.rules`
  (they are added right after the `customers` match block). Clients may **read**
  their own rows.
- **All wallet writes go through Admin SDK server actions**:
  - `driver_app/src/app/actions/grantOrderCashback.ts` — cashback on delivery.
  - `customer_app/src/app/actions/handleOrderClawback.ts` — clawback on customer cancel.
  - `orders_app/src/app/actions/handleOrderClawback.ts` — clawback on restaurant cancel.
  - `onboarding_app/src/app/actions/adjustCredit.ts` — manual admin grant/revoke.
- **Non-atomic but idempotent:** the client-side driver `completeDelivery` and
  cancel mutations first run their own client Firestore transaction (updating the
  order status), then call the server action afterwards to update the wallet.
  Idempotency guards (terminal-state checks + `cashbackEarned` flag + credit
  existence checks) prevent double crediting.

---

## Order Placement / Redemption Flow

**Client (`customer_app`):**
1. `WalletRedemption.tsx` (rendered in the cart page aside, above `BillDetails`)
   lets the user toggle "use wallet" and shows how much will be applied.
2. `usePlace.ts` reads `checkout.useWallet` / `checkout.walletRedeemed` and the
   wallet balance from the `wallet` slice, computes the clamped `walletRedeemed`
   (≤ balance and ≤ base total, honoring exclusivity), and adds it to the pricing
   payload. The **base `total` stays unchanged**.
3. Validation (`orderYupSchema.ts`, `orderTypes.ts`): `walletRedeemed` defaults
   to `0`, `walletCreditIds` defaults to `[]`.

**Server (`placeOrder.ts`):**
1. Sanity-checks and fetch active credits BEFORE the transaction.
2. After `pricingMatches()` passes (comparing base totals), applies redemption
   using `redeemCredits` with the discount exclusivity, `redemptionThreshold`,
   and `maxCashbackPerTx` rules.
3. Writes `finalPricing` with the **reduced** total + `walletCreditIds`.
4. `pendingLoyalty.amount` uses the final (reduced) total.

---

## Cashback on Delivery

`driver_app/src/app/actions/grantOrderCashback.ts` (Admin SDK):

1. Guard: order must be `DELIVERED`; idempotent via `pricing.cashbackEarned`.
2. Resolve customer `uid`; read `services/platform` cashback config.
3. If `!enabled` → no cashback. If the cart carried a discount/promo → no cashback.
4. `foodRevenue = subtotal - discount`; `cashback = round2(foodRevenue × percent)`.
5. `expiresAt = now + wipeDays`. Create `ORDER_EARN` credit via
   `grantCredit` (inside `db.runTransaction`), then set
   `pricing.cashbackEarned`.
6. Wired into `driver_app/src/rtk/api/firestoreApi.ts` `completeDelivery`
   mutation (called after the client transaction).

---

## Cancellation / Clawback / Refund

`handleOrderClawback` (both `customer_app` and `orders_app` — Admin SDK):

1. Reads the order; checks it is in a terminal/cancellable state.
2. Fetches the relevant `ORDER_EARN` (earned) credit and redeemed credits.
3. Runs `clawbackOnCancellation`:
   - claws back the `ORDER_EARN` credit (`status = CLAWED_BACK`, negative row),
   - restores any redeemed credits as new `ACTIVE` credits keeping their
     **original `expiresAt`** (so the customer's redemption is nullified).
4. Wired into the cancel mutations (`useCancelOrderMutation`,
   `setCancelOrderMutation`) after their client transaction.

Credit ledger invariant: total active balance always equals the sum of active
credit amounts, and clawback writes make the refund appear in the audit trail.

---

## Auto-Expiration (TTL)

Two complementary mechanisms:

- **Functional lazy expiry:** `getActiveCredits()` and the wallet query filters
  drop credits whose `expiresAt` has passed (no proactive job needed for
  correctness of reads/redeems). `expireCredits()` can mark them `EXPIRED` when
  convenient.
- **Firestore TTL:** to physically delete expired docs, set the TTL policy on the
  `wallet_credits` collection using the `expiresAt` field. This is configured in
  the **Firestore console / `gcloud`** (or Terraform) — it is **not** done via
  `firebase.json`. (See the Firebase Firestore skill for exact commands.)

---

## Onboarding Admin UI

**Settings page** (`onboarding_app/src/app/(dashboard)/settings/page.tsx`):
Cash Back Engine section — enable toggle, cashback percent, wipe days, redemption
threshold, max cashback per transaction. Persisted through `updateServices`
(queryFn arg extended with `cashback`). `fetchServices` returns cashback defaults.

**Customers table** (`CustomersTable.tsx`): a **Wallet** column shows the live
balance and an **Adjust** button.

**Adjust dialog** (`AdjustCreditDialog.tsx`): grant / revoke toggle, **mandatory
reason**, and a recent-activity list fed by `useFetchWalletTransactionsQuery`.

**Server action** (`adjustCredit.ts`, Admin SDK):
- **Grant:** `grantCredit` with `source = ADMIN_ADJUST`, `createdBy`, `reason`.
- **Revoke:** removes oldest-active-first with `CLAWED_BACK` + an `ADMIN_ADJUST`
  transaction so it lands in the audit log.
- Requires the caller be an authenticated admin (claims check) and a non-empty
  reason.

---

## Customer Wallet UI

- **Header badge** (`Header.tsx`): when authenticated, shows the live EGP
  balance (via `useFetchWalletBalanceQuery`) and links to `/wallet`; dispatches
  `initWallet` to keep the `wallet` slice authoritative for checkout.
- **Wallet page** (`customer_app/src/app/[locale]/wallet/page.tsx`):
  - balance hero card + pending credits total,
  - list of active credits (source label + time-to-expire),
  - full transaction history (GRANT / REDEEM / EXPIRE / CLAWBACK / ADMIN_ADJUST)
    with +/- amounts.
  - Backed by `useFetchWalletBalanceQuery`, `useFetchWalletCreditsQuery`,
    `useFetchWalletTransactionsQuery`.
- **Redux:** `walletSlice.ts` (`initWallet`, `clearWallet`) registered in the
  store; `fetchWalletBalance`/`fetchWalletCredits`/`fetchWalletTransactions`
  queries in the customer `firestoreApi`.

---

## Remaining Work

- **Phase 9 — TTL config:** configure the Firestore TTL policy on
  `wallet_credits.expiresAt` in the console/gcloud (not in `firebase.json`).
  Functional lazy-expiry already works.
- **Phase 10 — Trigger campaigns (not yet implemented):**
  - Add campaign fields to `CashbackConfig` (e.g. `welcomeBonus`,
    `welcomeBonusAmount`, `winbackEnabled`, `winbackAmount`, `inactivityDays`).
  - Add toggles to the onboarding settings page.
  - Trigger **welcome bonus** on first completed delivery (or account event) and
    **win-back** on inactivity, each with an existing-credit idempotency check
    (using `source = WELCOME` / `source = WINBACK`), likely inside
    `completeDelivery` / `grantOrderCashback`.

---

## Updated File Reference

### Types & shared package
| File | Purpose |
|------|---------|
| `packages/types/src/wallet.ts` | NEW — wallet credit/transaction/config types |
| `packages/types/src/customer.ts` | `wallet?: {balance, updatedAt}` on CustomerType |
| `packages/types/src/services.ts` | `cashback?: CashbackConfig` on ServicesDocument |
| `packages/types/src/order.ts` | `walletRedeemed`/`cashbackEarned` pricing, `walletCreditIds` payment |
| `packages/types/src/index.ts` | re-exports |
| `packages/order-utils/src/wallet/*` | NEW — core wallet service (context/grant/redeem/clawback/expire/getActiveCredits) |
| `packages/order-utils/src/index.ts` | wallet re-exports |

### Firebase config
| File | Purpose |
|------|---------|
| `firestore.rules` | `wallet_credits` / `wallet_transactions` read-only-for-clients blocks |

### Onboarding (admin)
| File | Purpose |
|------|---------|
| `onboarding_app/src/rtk/api/firestoreApi.ts` | `fetchServices`/`updateServices` + cashback; `fetchWalletTransactions` query; `adjustCustomerCredit` mutation (invalidates `Customers` → auto-refetch of history + balance) |
| `onboarding_app/src/app/(dashboard)/settings/page.tsx` | cashback settings UI |
| `onboarding_app/src/app/actions/adjustCredit.ts` | NEW — manual grant/revoke (Admin SDK) |
| `onboarding_app/src/components/dashboard/AdjustCreditDialog.tsx` | NEW — adjust UI |
| `onboarding_app/src/components/dashboard/CustomersTable.tsx` | wallet balance column + Adjust button |
| `onboarding_app/src/app/(dashboard)/customers/page.tsx` | wallet balance export column |

### Customer app
| File | Purpose |
|------|---------|
| `customer_app/src/app/actions/placeOrder.ts` | wallet redemption in pricing |
| `customer_app/src/app/actions/handleOrderClawback.ts` | NEW — cancel clawback |
| `customer_app/src/hooks/usePlace.ts` | wallet in order payload |
| `customer_app/src/rtk/api/firestoreApi.ts` | wallet balance/credits/transactions queries + cancel call |
| `customer_app/src/rtk/slices/walletSlice.ts` | NEW — wallet state |
| `customer_app/src/rtk/store.ts` | wallet reducer |
| `customer_app/src/components/Cart/WalletRedemption.tsx` | NEW — checkout wallet toggle |
| `customer_app/src/app/[locale]/cart/page.tsx` | wallet toggle in aside |
| `customer_app/src/components/Header.tsx` | wallet balance badge + link |
| `customer_app/src/app/[locale]/wallet/page.tsx` | NEW — wallet page |
| `customer_app/src/lib/orderTypes.ts`, `orderYupSchema.ts` | wallet fields in order payload/validation |
| `customer_app/messages/en.json`, `ar.json` | wallet page translations |

### Driver app
| File | Purpose |
|------|---------|
| `driver_app/src/app/actions/grantOrderCashback.ts` | NEW — delivery cashback grant (Admin SDK) |
| `driver_app/src/rtk/api/firestoreApi.ts` | `completeDelivery` calls `grantOrderCashback` |

### Orders app
| File | Purpose |
|------|---------|
| `orders_app/src/app/actions/handleOrderClawback.ts` | NEW — restaurant-cancel clawback |
| `orders_app/src/rtk/api/firestoreApi.ts` | `setCancelOrder` calls `handleOrderClawback` |
