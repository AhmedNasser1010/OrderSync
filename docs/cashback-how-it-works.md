# How the Cash Back Program Works (Plain-English Guide)

> A non-technical overview of the cash back / wallet feature in the OrderSync
> app, written for non-developers: how customers earn money back, how they use
> it, and what happens when things change (like a cancelled order).

---

## In Short

OrderSync now gives customers **money back on their orders**. When a driver
delivers an order, the platform adds a small percentage of the order's food
value to the customer's **wallet** as cash-back credit. Customers can then use
that credit on a later order to pay less, like a discount they earned themselves.

The wallet is shown as a balance in **EGP (Egyptian pounds)**. It has a few
simple rules so everything stays fair for customers, restaurants, and drivers.

---

## How a Customer Earns Cash Back

1. The customer places an order and pays normally.
2. The driver delivers the order. **This is the moment cash back is triggered** —
   cash back is only earned after delivery, not just by placing an order.
3. The platform adds cash back to the customer's wallet based on the **food
   value** of the order (not delivery fees).

**Example:** If the cash-back rate is 5% and the food total is 100 EGP, the
customer's wallet goes up by 5 EGP.

Two small conditions:
- Cash back is **only earned if the order had no discount/promo**. If a coupon
  was applied, no cash back is earned for that order (no stacking to avoid
  double discounts).
- The cash back is **global to the customer** — it applies across all
  restaurants, not tied to the restaurant that earned it.

---

## How a Customer Uses the Wallet

- The wallet balance appears at the top of the app.
- When checking out, the customer can pick **"Use my wallet"**.
- The chosen amount is taken off what the customer pays.
- **The restaurant still receives its full payment** — the platform itself
  covers the wallet discount. So a cash-back redemption never reduces what a
  restaurant earns.

The amount used is limited to the wallet balance and never makes an order
totally free of charge (an order still has a minimum payable amount).

Delivery fees are never covered by cash back — they always remain payable by the
customer out of pocket. The wallet credit only ever applies to the food/items
portion of the order.

---

## What Happens if an Order is Cancelled

Because cash back is "earned" only once an order is delivered, cancellation
handles money fairly:

- **Cancellation refunds the order.** Any cash back earned but tied to that
  order is **taken back** (removed from the wallet).
- If the customer had already used wallet credit to pay for it, **that credit is
  returned** to their wallet so they don't lose it.
- The wallet history shows exactly what was added and removed.

The result: a cancelled order never lets a customer keep cash back they hadn't
really earned, and they never lose credit they legitimately had.

---

## Credits Expire Eventually

Cash-back credit has a **shelf life** (for example 90 days by default). If a
credit is not used before it expires, it is no longer available. This keeps
customers engaged and keeps the program financially healthy.

---

## How the Money Moves (for Business Owners)

There is a running **ledger** behind the scenes — a fully itemized history of
every wallet change, including:
- when credit was **added** (cash back earned, bonus, or a manual adjustment),
- when credit was **used** (at checkout),
- when credit **expired**, and
- when credit was **clawed back** (cancel).

This ledger is **write-protected** — only the platform's system can change a
balance; customers and restaurants can only view their own rows. Nothing can be
edited or deleted once recorded, which keeps the money trail trustworthy and
auditable.

---

## What the Admin Can Do

Store/company administrators have a dedicated **Cash Back** section in their
dashboard where they can turn the program on or off and set:
- the **cash back percentage** (how much of the food value is returned),
- the **shelf life** of credits (how many days until they expire),
- the **minimum order size** before the wallet can be used, and
- a **cap** on how much cash back a single order can earn.

Admins can also **manually add or remove** credit for an individual customer
(for example, goodwill compensation). Every manual change requires a written
reason, and it all shows up in the ledger for transparency.

---

## The One-Page Journey

```
 Place an order ──► Delivered ──► Cash back added to wallet (+)
                                          │
        Next order ──► "Use my wallet" ──► pays less (1)
                                          │
        Cancel?      ──► cash back removed, used credit returned
                                          │
        Too old?     ──► credit expires, no longer available
```

(1) Restaurant is paid in full; the platform covers the wallet discount.

---

## Glossary

| Term | Meaning |
|------|---------|
| **Wallet** | The customer's cash-back balance, in EGP |
| **Cash back** | A percentage of the food value returned after delivery |
| **Credit** | A single piece of cash back in the wallet, with its own expiry date |
| **Redeem / Use wallet** | Applying wallet balance to pay less on an order |
| **Claw back** | Removing cash back from the wallet (e.g. due to cancellation) |
| **Expire** | A credit that was not used before its expiry date and is no longer available |
| **Ledger** | The full, locked audit history of every wallet change |
| **Platform** | OrderSync itself (as opposed to a restaurant or customer) |

---

## Notes for Developers

This is the plain-English companion to the fuller technical write-up in
[`docs/cashback-wallet-engine.md`](./cashback-wallet-engine.md). That document
covers the data model, rules, and implementation details for engineers.
