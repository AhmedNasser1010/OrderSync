# Discount System — Extended

> Extended version of the legacy discount system with new features.
> See [legacy-discount-system.md](./legacy-discount-system.md) for the original implementation.

---

## Table of Contents

1. [Legacy System Summary](#legacy-system-summary)
2. [New Feature: Expiration Dates](#1-expiration-dates)
3. [New Feature: Order-Level Discounts](#2-order-level-discounts)
4. [New Feature: Coupon/Promo Codes](#3-couponpromocodes)
5. [New Feature: Multiple Conditions](#4-multiple-conditions)
6. [New Feature: Discount Stacking Rules](#5-discount-stacking-rules)
7. [New Feature: Usage Limits](#6-usage-limits)
8. [New Feature: Category-Level Discounts](#7-category-level-discounts)
9. [New Feature: Time-Based Rules](#8-time-based-rules)
10. [New Feature: Customer Segmentation](#9-customer-segmentation)
11. [New Feature: Discount Analytics](#10-discount-analytics)
12. [Updated Data Model](#updated-data-model)
13. [Updated Code Format](#updated-code-format)
14. [Updated File Reference](#updated-file-reference)

---

## Legacy System Summary

The legacy system supports:

- **Item-level discounts** — Percentage (`P`) or Fixed (`FIXED`) on individual menu items
- **Single condition** — `FIRSTBUY`, `TOTALSPENT`, `TOTALITEMS`, `TOTALORDERS`
- **Code format** — `{TYPE}-{VALUE}` or `{TYPE}-{VALUE}_SWITCH{CASE:{COND}-{VAL};}`

**What's missing:** No expiration dates, no order-level discounts, no coupon codes, only one condition, no stacking rules, no usage limits, no category discounts, no time-based rules, no analytics.

---

## 1. Expiration Dates

Every discount supports a time window. Outside this window, the discount is automatically inactive.

### Data Model Addition

```json
{
  "code": "P-20",
  "message": "Summer sale!",
  "startAt": 1719792000000,
  "expireAt": 1722470400000
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `startAt` | `number` (timestamp ms) | No | When the discount becomes active. If omitted, active immediately. |
| `expireAt` | `number` (timestamp ms) | No | When the discount expires. If omitted, never expires. |

### Behavior

- `startAt` not set → discount is active from now
- `expireAt` not set → discount never expires
- Both set → discount is active only within that window
- `expireAt` in the past → discount is expired/inactive

### Manager UI Changes

- Date/time picker fields in the `DiscountDialog` for start and end dates
- Menu items show an "Expired" badge if the discount is past its `expireAt`
- Manager can filter menu to show "Active discounts" vs "Expired discounts"

### Evaluation

```js
const isDiscountActive = (discount) => {
  const now = Date.now()
  if (discount.startAt && now < discount.startAt) return false
  if (discount.expireAt && now > discount.expireAt) return false
  return true
}
```

---

## 2. Order-Level Discounts

Discounts that apply to the entire cart/order, not individual items. Stored separately from item discounts.

### Discount Levels

| Level | Scope | Storage Location |
|-------|-------|-----------------|
| `item` | Single menu item | `menu.items[].discount` |
| `order` | Entire cart/order | `menu.orderDiscounts[]` |

### Data Model

```json
{
  "id": "uuid",
  "code": "P-10",
  "message": "10% off orders over $100",
  "level": "order",
  "minOrderTotal": 100,
  "minCartItems": 0,
  "conditions": [],
  "startAt": null,
  "expireAt": null,
  "usageLimit": null,
  "usageCount": 0
}
```

### Order-Level Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `level` | `"item"` or `"order"` | Yes | Determines scope of the discount |
| `minOrderTotal` | `number` | No | Minimum cart total required to apply |
| `minCartItems` | `number` | No | Minimum number of distinct items in cart |

### Application Logic

```js
const applyOrderDiscounts = (cartItems, orderDiscounts, user, resId) => {
  const cartTotal = cartItems.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0)
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const eligible = orderDiscounts.filter(discount => {
    if (!isDiscountActive(discount)) return false
    if (discount.minOrderTotal && cartTotal < discount.minOrderTotal) return false
    if (discount.minCartItems && cartItemCount < discount.minCartItems) return false
    if (!evaluateConditions(discount.conditions, user, resId)) return false
    return true
  })

  // Apply the best discount (highest value)
  // Or apply first matching — depends on stacking rules
  return eligible
}
```

### Manager UI Changes

- New section in menu management: "Order Discounts" (separate from item discounts)
- Fields: discount type/value, minimum order total, minimum cart items, conditions
- Displayed on the restaurant's page as "Get X% off orders over $Y"

---

## 3. Coupon/Promo Codes

Customers enter a code at checkout to unlock a discount. Stored as a separate collection in Firestore.

### Data Model

```json
{
  "id": "uuid",
  "restaurantId": "restaurant_access_token",
  "code": "SUMMER2024",
  "type": "P",
  "value": 15,
  "message": "15% off with code SUMMER2024",
  "level": "order",
  "minOrderTotal": 50,
  "conditions": [],
  "startAt": 1719792000000,
  "expireAt": 1722470400000,
  "usageLimit": 1000,
  "usageCount": 0,
  "perUserLimit": 1,
  "active": true
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `code` | `string` | Yes | Unique promo code (case-insensitive) |
| `type` | `"P"` or `"FIXED"` | Yes | Discount type |
| `value` | `number` | Yes | Discount value |
| `level` | `"item"` or `"order"` | Yes | Scope |
| `minOrderTotal` | `number` | No | Minimum order total to use code |
| `usageLimit` | `number` | No | Total redemption cap |
| `usageCount` | `number` | Yes | How many times redeemed |
| `perUserLimit` | `number` | No | Max redemptions per user (default: 1) |
| `active` | `boolean` | Yes | Enable/disable without deleting |

### Redemption Flow

```
Customer enters code at checkout
  → Validate code exists, is active, not expired
  → Check usageLimit not reached
  → Check perUserLimit not reached for this user
  → Check minOrderTotal met
  → Apply discount to order
  → Increment usageCount
  → Store redemption record: { userId, codeId, orderId, timestamp }
```

### Redemption Record

```json
{
  "id": "uuid",
  "userId": "user_uid",
  "codeId": "coupon_id",
  "orderId": "order_id",
  "restaurantId": "restaurant_id",
  "discountApplied": 15.50,
  "createdAt": 1719800000000
}
```

### Manager UI Changes

- New "Promo Codes" section in restaurant settings
- Create/edit/delete promo codes
- View redemption history and count
- Bulk generate codes (e.g., "WELCOME10", "WELCOME11", ..., "WELCOME20")

### Customer UI Changes

- Promo code input field on the Cart/Checkout page
- Show discount breakdown: original total, discount applied, final total
- Error messages: "Code expired", "Code not valid for this restaurant", "Minimum order $50"

---

## 4. Multiple Conditions

Allow combining multiple conditions with AND/OR logic. Legacy supports only one condition.

### Condition Logic

| Operator | Meaning | Example |
|----------|---------|---------|
| `AND` | All conditions must be true | First buy AND spent > $50 |
| `OR` | Any condition must be true | First buy OR total orders > 10 |

### Data Model Change

```json
// Legacy (single condition)
{
  "conditions": [{ "type": "FIRSTBUY", "value": 0 }]
}

// Extended (multiple conditions)
{
  "conditions": {
    "operator": "AND",
    "rules": [
      { "type": "FIRSTBUY", "value": 0 },
      { "type": "TOTALSPENT", "value": 50 }
    ]
  }
}
```

### New Condition Types

| Code | Name | Description |
|------|------|-------------|
| `FIRSTBUY` | First Purchase | Never ordered from this restaurant |
| `TOTALSPENT` | Total Spent | Total amount spent >= value |
| `TOTALITEMS` | Total Items | Total items purchased >= value |
| `TOTALORDERS` | Total Orders | Total orders placed >= value |
| `JOINDATE` | Account Age | User account age in days >= value |
| `LASTORDER` | Days Since Last Order | Days since last order >= value |
| `CUSTOMERLTV` | Customer Lifetime Value | Total lifetime value across all restaurants >= value |

---

## 5. Discount Stacking Rules

Define how multiple discounts interact when more than one applies.

### Stacking Modes

| Mode | Behavior |
|------|----------|
| `highest` | Apply only the discount with the highest savings |
| `lowest` | Apply only the discount with the lowest savings (for testing) |
| `stack` | Apply all eligible discounts sequentially |
| `priority` | Apply based on a priority number set by the manager |
| `exclusive` | If this discount applies, no other discounts can |

### Data Model Addition

```json
{
  "stackingMode": "highest",
  "priority": 0
}
```

### Priority Example

```json
[
  { "code": "P-20", "priority": 1, "stackingMode": "exclusive" },
  { "code": "P-10", "priority": 2, "stackingMode": "highest" }
]
```

- `P-20` is exclusive — if it applies, nothing else does
- If `P-20` doesn't apply, `P-10` competes with other discounts using "highest" mode

### Calculation (Stack Mode)

```js
const applyStackedDiscounts = (price, discounts) => {
  return discounts.reduce((currentPrice, discount) => {
    const type = discount.type
    const value = discount.value

    switch (type) {
      case 'P': return currentPrice * (1 - value / 100)
      case 'FIXED': return Math.max(0, currentPrice - value)
      default: return currentPrice
    }
  }, price)
}
```

### Manager UI

- Dropdown to select stacking mode per discount
- Priority input when "priority" mode is selected
- Preview showing how discounts combine on a sample cart

---

## 6. Usage Limits

Control how many times a discount can be redeemed.

### Limits

| Field | Scope | Description |
|-------|-------|-------------|
| `usageLimit` | Global | Total redemptions allowed across all users |
| `perUserLimit` | Per user | Max redemptions per user |
| `minCartTotal` | Per order | Minimum cart total to use this discount |

### Data Model Addition

```json
{
  "usageLimit": 500,
  "usageCount": 234,
  "perUserLimit": 1
}
```

### Tracking

Each redemption is recorded in a `discountRedemptions` collection:

```json
{
  "id": "uuid",
  "discountId": "discount_id",
  "userId": "user_uid",
  "orderId": "order_id",
  "restaurantId": "restaurant_id",
  "amount": 15.50,
  "createdAt": 1719800000000
}
```

### Validation

```js
const canUseDiscount = (discount, userId, userRedemptionCount) => {
  if (discount.usageLimit && discount.usageCount >= discount.usageLimit) return false
  if (discount.perUserLimit && userRedemptionCount >= discount.perUserLimit) return false
  return true
}
```

---

## 7. Category-Level Discounts

Apply a discount to all items in a category at once.

### Data Model

```json
{
  "id": "uuid",
  "code": "P-25",
  "message": "25% off all drinks!",
  "level": "category",
  "categoryId": "category_uuid",
  "conditions": [],
  "startAt": null,
  "expireAt": null
}
```

### Levels Hierarchy

| Priority | Level | Scope |
|----------|-------|-------|
| 1 (highest) | `item` | Individual item — overrides category |
| 2 | `category` | All items in a category |
| 3 | `order` | Entire cart |

### Application Order

```
1. Apply item-level discounts first (per item)
2. If no item discount, check category-level discount
3. Apply order-level discount last (on total)
```

### Manager UI

- Category card gets a "Add Discount" button
- Category discount applies to all items without their own discount
- Item-level discount overrides category discount

---

## 8. Time-Based Rules

Discounts that activate automatically during specific hours or days.

### Data Model Addition

```json
{
  "timeRules": {
    "enabled": true,
    "days": [1, 2, 3, 4, 5],
    "startTime": "12:00",
    "endTime": "15:00"
  }
}
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `days` | `number[]` | Day of week (0=Sun, 1=Mon, ..., 6=Sat) |
| `startTime` | `string` | Start time in `HH:MM` format (24h) |
| `endTime` | `string` | End time in `HH:MM` format (24h) |

### Evaluation

```js
const isWithinTimeRules = (timeRules) => {
  if (!timeRules?.enabled) return true

  const now = new Date()
  const currentDay = now.getDay()
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  if (!timeRules.days.includes(currentDay)) return false
  if (currentTime < timeRules.startTime || currentTime > timeRules.endTime) return false
  return true
}
```

### Use Cases

- Happy hour: "20% off drinks, Mon-Fri 12:00-15:00"
- Late night special: "15% off after 22:00"
- Weekend brunch: "10% off Sat-Sun 09:00-12:00"

---

## 9. Customer Segmentation

Target specific customer groups beyond basic conditions.

### Segment Types

| Segment | Logic |
|---------|-------|
| `new` | Registered < 30 days ago |
| `active` | Ordered within last 14 days |
| `inactive` | No order in last 30 days |
| `vip` | Total spent > $1000 OR total orders > 50 |
| `at_risk` | No order in last 21 days but was previously active |
| `custom` | Manager defines rules |

### Data Model Addition

```json
{
  "segments": ["new", "inactive"]
}
```

### Evaluation

```js
const matchesSegment = (user, segment, restaurantId) => {
  const resHistory = user.restaurants?.find(r => r.accessToken === restaurantId)
  const daysSinceJoin = (Date.now() - user.createdAt) / (1000 * 60 * 60 * 24)
  const daysSinceLastOrder = resHistory?.lastOrderAt
    ? (Date.now() - resHistory.lastOrderAt) / (1000 * 60 * 60 * 24)
    : Infinity

  switch (segment) {
    case 'new': return daysSinceJoin <= 30
    case 'active': return daysSinceLastOrder <= 14
    case 'inactive': return daysSinceLastOrder > 30
    case 'vip': return resHistory?.totalAmount > 1000 || resHistory?.totalOrders > 50
    case 'at_risk': return daysSinceLastOrder > 21 && daysSinceLastOrder <= 60
    default: return false
  }
}
```

### Manager UI

- Multi-select for target segments when creating a discount
- Show estimated audience size (e.g., "This discount will be visible to ~45 customers")

---

## 10. Discount Analytics

Track discount performance for data-driven decisions.

### Metrics Per Discount

| Metric | Description |
|--------|-------------|
| `impressions` | How many times the discount badge was viewed |
| `redemptions` | How many times the discount was applied to an order |
| `conversionRate` | `redemptions / impressions` |
| `revenueImpact` | Total amount discounted |
| `avgDiscountValue` | Average discount per redemption |
| `uniqueUsers` | Number of distinct users who used the discount |

### Data Model

```json
{
  "discountId": "uuid",
  "restaurantId": "restaurant_id",
  "period": "2024-07",
  "impressions": 1234,
  "redemptions": 89,
  "conversionRate": 0.072,
  "revenueImpact": 1340.50,
  "avgDiscountValue": 15.06,
  "uniqueUsers": 67
}
```

### Tracking Implementation

```js
// On discount badge view
const trackImpression = async (discountId, restaurantId) => {
  await incrementDoc('discountAnalytics', `${discountId}_${currentMonth}`, 'impressions', 1)
}

// On discount redemption
const trackRedemption = async (discountId, restaurantId, userId, amount) => {
  const docId = `${discountId}_${currentMonth}`
  await batchUpdate('discountAnalytics', docId, {
    redemptions: increment(1),
    revenueImpact: increment(amount),
    uniqueUsers: arrayUnion(userId)
  })
}
```

### Manager UI

- Analytics dashboard per discount
- Charts: redemptions over time, conversion rate trend
- Compare discounts: "Which discount drives the most orders?"
- Revenue impact summary: "Your discounts saved customers $X this month"

---

## Updated Data Model

### Item Discount (extended)

```json
{
  "id": "uuid",
  "code": "P-20",
  "message": "20% off!",
  "level": "item",
  "itemId": "menu_item_uuid",
  "conditions": {
    "operator": "AND",
    "rules": [
      { "type": "TOTALORDERS", "value": 3 }
    ]
  },
  "stackingMode": "highest",
  "priority": 1,
  "startAt": 1719792000000,
  "expireAt": 1722470400000,
  "usageLimit": 500,
  "usageCount": 123,
  "perUserLimit": 1,
  "timeRules": {
    "enabled": false,
    "days": [1, 2, 3, 4, 5],
    "startTime": "12:00",
    "endTime": "15:00"
  },
  "segments": ["active", "vip"],
  "active": true
}
```

### Order Discount (new)

```json
{
  "id": "uuid",
  "code": "P-10",
  "message": "10% off orders over $100",
  "level": "order",
  "type": "P",
  "value": 10,
  "minOrderTotal": 100,
  "minCartItems": 0,
  "conditions": [],
  "stackingMode": "highest",
  "priority": 0,
  "startAt": null,
  "expireAt": null,
  "usageLimit": null,
  "usageCount": 0,
  "perUserLimit": 1,
  "timeRules": null,
  "segments": [],
  "active": true
}
```

### Category Discount (new)

```json
{
  "id": "uuid",
  "code": "P-25",
  "message": "25% off all drinks!",
  "level": "category",
  "type": "P",
  "value": 25,
  "categoryId": "category_uuid",
  "conditions": [],
  "startAt": null,
  "expireAt": null,
  "active": true
}
```

### Promo Code (new)

```json
{
  "id": "uuid",
  "restaurantId": "restaurant_access_token",
  "code": "SUMMER2024",
  "type": "P",
  "value": 15,
  "message": "15% off with code SUMMER2024",
  "level": "order",
  "minOrderTotal": 50,
  "conditions": [],
  "startAt": 1719792000000,
  "expireAt": 1722470400000,
  "usageLimit": 1000,
  "usageCount": 0,
  "perUserLimit": 1,
  "active": true
}
```

---

## Updated Code Format

### Extended Format

```
{TYPE}-{VALUE}_{FLAGS}

FLAGS:
  SWITCH{CASE:{COND}-{VAL};...}   — conditions
  EXP{START}-{END}                — expiration timestamps
  LIM{TOTAL}-{PERUSER}            — usage limits
  STACK{MODE}                     — stacking mode
  PRIO{N}                         — priority number
```

### Examples

```
P-20_EXP1719792000000-1722470400000
Percentage discount, expires between two timestamps

P-10_SWITCH{CASE:TOTALORDERS-3;}_LIM500-1
10% off after 3 orders, max 500 total uses, 1 per user

FIXED-25_STACK{highest}_PRIO1
$25 off, highest stacking priority, priority mode

P-15_SWITCH{CASE:TOTALSPENT-100;}_EXP1719792000000-1722470400000_LIM1000-2
15% off after spending $100, expires at timestamp, 1000 uses, 2 per user
```

### Regex (extended)

```
/([A-Za-z]+)-([0-9]+)
  (_SWITCH\{([A-Za-z0-9:;_-]+)\})?
  (_EXP([0-9]+)-([0-9]+))?
  (_LIM([0-9]+)-([0-9]+))?
  (_STACK\{([A-Za-z]+)\})?
  (_PRIO([0-9]+))?
/i
```

---

## Updated File Reference

| File | Location | Purpose |
|------|----------|---------|
| `DiscountDialog.jsx` | `manager_app/src/Component/` | Manager UI for creating/editing discounts |
| `OrderDiscountDialog.jsx` | `manager_app/src/Component/` | Manager UI for order-level discounts |
| `PromoCodeDialog.jsx` | `manager_app/src/Component/` | Manager UI for promo code management |
| `DiscountAnalytics.jsx` | `manager_app/src/Component/` | Analytics dashboard for discount performance |
| `generateDiscountCode.js` | `shared/utils/` | Encodes form values → discount code string |
| `generateDiscountObj.js` | `shared/utils/` | Parses discount code string → discount object |
| `priceAfterDiscount.js` | `shared/utils/` | Calculates price after item discount |
| `applyOrderDiscounts.js` | `shared/utils/` | Evaluates and applies order-level discounts |
| `evaluateConditions.js` | `shared/utils/` | Evaluates AND/OR condition logic |
| `evaluateTimeRules.js` | `shared/utils/` | Checks time-based rule validity |
| `evaluateSegments.js` | `shared/utils/` | Checks customer segment membership |
| `checkUsageLimits.js` | `shared/utils/` | Validates usage and per-user limits |
| `trackDiscountImpression.js` | `shared/utils/` | Tracks discount badge views |
| `trackDiscountRedemption.js` | `shared/utils/` | Tracks discount redemptions |
| `conditionalValuesSlice.js` | `manager_app/src/rtk/slices/` | Redux state for discount dialogs |
| `cartSlice.js` | `customer_app/src/rtk/slices/` | Handles discount application on cart |
| `discountAnalyticsSlice.js` | `manager_app/src/rtk/slices/` | Redux state for analytics data |
