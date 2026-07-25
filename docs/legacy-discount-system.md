# Discount System — Legacy business_manager

## Overview

The discount system allowed restaurant managers to apply price reductions to individual menu items, with optional conditions restricting which customers qualify for the discount.

---

## Data Model

Discounts are stored as an object on each menu item in Firestore:

```json
{
  "code": "P-15",
  "message": "15% off your order!"
}
```

---

## Discount Code Format

The `code` string encodes both the discount type, value, and optional conditions in a compact format.

### Pattern

```
{TYPE}-{VALUE}
```

With conditions:

```
{TYPE}-{VALUE}_SWITCH{CASE:{COND_TYPE}-{COND_VALUE};CASE:{COND_TYPE}-{COND_VALUE};...}
```

### Regex

```
/([A-Za-z]+)-([0-9]+)_SWITCH\{([A-Za-z0-9:;_-]+)\}/i
/([A-Za-z]+)-([0-9]+)/i
```

---

## Discount Types

| Code  | Name   | Description | Example          | Result         |
|-------|--------|-------------|------------------|----------------|
| `P`   | Percentage | Reduces price by a percentage | `P-50` | 50% off        |
| `FIXED` | Fixed Amount | Subtracts a flat amount from the price | `FIXED-10` | $10 off |

### Constraints

- **P (Percentage)**: Value must be between 1 and 100. Cannot exceed 100%.
- **FIXED**: Value must be a positive number. If the result falls to `<= 0.4`, the price is set to `0` (free).

---

## Conditional Discounts

Conditions restrict who is eligible for a discount. Up to one condition is supported.

### Condition Types

| Code          | Name               | Description | Condition Value Meaning |
|---------------|--------------------|-------------|------------------------|
| `FIRSTBUY`    | First Purchase     | Discount applies only if the customer has never ordered from this restaurant | `0` (ignored) |
| `TOTALSPENT`  | Total Spent        | Discount applies if the customer's total spending at this restaurant >= value | Currency amount |
| `TOTALITEMS`  | Total Items Bought | Discount applies if the customer's total items purchased >= value | Item count |
| `TOTALORDERS` | Total Orders       | Discount applies if the customer's total orders placed >= value | Order count |

### Condition Value

- For `FIRSTBUY`: The value is always `0` (it's a boolean check, not a threshold).
- For `TOTALSPENT`, `TOTALITEMS`, `TOTALORDERS`: The value is the minimum threshold the customer must meet.

---

## Code Examples

### Simple Discounts

| Code      | Meaning                |
|-----------|------------------------|
| `P-15`    | 15% off                |
| `P-50`    | 50% off                |
| `P-100`   | 100% off (free)        |
| `FIXED-10`| $10 off                |
| `FIXED-50`| $50 off                |

### Conditional Discounts

| Code                                              | Meaning                          |
|---------------------------------------------------|----------------------------------|
| `P-20_SWITCH{CASE:FIRSTBUY-0;}`                  | 20% off for first-time buyers    |
| `P-10_SWITCH{CASE:TOTALORDERS-5;}`               | 10% off after 5 orders           |
| `FIXED-25_SWITCH{CASE:TOTALSPENT-500;}`          | $25 off after spending $500      |
| `P-15_SWITCH{CASE:TOTALITEMS-10;}`               | 15% off after buying 10 items    |

---

## Price Calculation Logic

### Business Manager Side (`priceAfterDiscount.js`)

```js
// Simple: no condition evaluation, just applies the math
const priceAfterDiscount = (price, code) => {
  const type = code.split('-')[0]  // "P" or "FIXED"
  const value = code.split('-')[1]

  switch (type) {
    case 'FIXED':
      finalPrice -= value
      if (finalPrice <= 0.4) finalPrice = 0
      break
    case 'P':
      finalPrice = price * (1 - value / 100)
      break
  }
  return finalPrice
}
```

### Customer Side (`priceAfterDiscount.js`)

```js
// Full version: calculates price AND evaluates conditions
const priceAfterDiscount = (price, discount, user, resId) => {
  if (!discount) return { finalPrice: price, isAvailableForUser: false }

  const discountObj = generateDiscountObj(discount)

  // 1. Calculate reduced price
  // ... (same logic as above)

  // 2. Evaluate conditions
  if (discountObj.conditions.length && user.restaurants) {
    const currentRes = user.restaurants.find(r => r.accessToken === resId)
    switch (discountObj.conditions[0].type) {
      case 'FIRSTBUY':  isAvailableForUser = currentRes === undefined; break
      case 'TOTALSPENT': isAvailableForUser = currentRes.totalAmount >= value; break
      case 'TOTALITEMS': isAvailableForUser = currentRes.totalItems >= value; break
      case 'TOTALORDERS': isAvailableForUser = currentRes.totalOrders >= value; break
    }
  } else {
    isAvailableForUser = true  // No conditions = always available
  }

  return { finalPrice, isAvailableForUser }
}
```

### Key Behavior

- If a user is **not logged in**, all discounts are shown (no condition evaluation possible).
- If a user is logged in but has **no order history** for the restaurant, only `FIRSTBUY` discounts apply.
- If there are **no conditions**, the discount is always available.

---

## Manager UI (`DiscountDialog.jsx`)

The manager created/edited discounts through a MUI dialog:

1. **Discount Value** — Numeric input (1-100 for P, any positive for FIXED)
2. **Discount Type** — Dropdown: Percentage or Fixed
3. **Message** — Short text displayed to customers (max 255 chars)
4. **Add Conditions** — Checkbox to enable conditional logic
5. **Condition Type** — Dropdown when conditions enabled (FIRSTBUY, TOTALSPENT, TOTALITEMS, TOTALORDERS)
6. **Condition Value** — Numeric input (disabled for FIRSTBUY)

### Persistence

- Saving writes `{ code, message }` to the menu item's `discount` field in Firestore.
- Removing deletes the `discount` field from the item.

### Display

On the menu card (`MenuNestedCard.jsx`), discounts appear as a colored badge next to the price:

```
[15% With Condition] [100ج.م]
```

---

## User Data Structure

The condition evaluator reads from `user.restaurants[]`, where each entry tracks:

```json
{
  "accessToken": "restaurant_id",
  "totalAmount": 500,
  "totalItems": 12,
  "totalOrders": 5
}
```

These values are incremented by `useUpdateUserOnSendOrder` when a user places an order.

---

## File Reference

| File | Location | Purpose |
|------|----------|---------|
| `DiscountDialog.jsx` | `business_manager/src/Component/` | Manager UI for creating/editing discounts |
| `generateDiscountCode.js` | `business_manager/src/functions/` | Encodes form values → discount code string |
| `generateDiscountObj.js` | `business_manager/src/functions/` | Parses discount code string → discount object |
| `priceAfterDiscount.js` | `business_manager/src/functions/` | Calculates price after discount (manager side) |
| `priceAfterDiscount.js` | `customer_app/src/utils/` | Calculates price + evaluates conditions (customer side) |
| `generateDiscountObj.js` | `customer_app/src/utils/` | Parses discount codes on customer side |
| `conditionalValuesSlice.js` | `business_manager/src/rtk/slices/` | Redux state for discount dialog visibility |
| `cartSlice.js` | `customer_app/src/rtk/slices/` | Handles discount code application on cart items |
| `MenuNestedCard.jsx` | `business_manager/src/Component/` | Displays discount badge on menu items |
