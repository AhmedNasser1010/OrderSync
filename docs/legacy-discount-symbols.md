# Discount System — Code Format Reference

## BASIC DISCOUNTS

**FORMAT:** `{TYPE}-{VALUE}`

- **FIXED-10** — Fixed discount, subtracts $10 from price
  - If result ≤ 0.4, price becomes 0
- **P-50** — Percentage discount, 50% off
  - Value must be 1-100

## CONDITIONAL DISCOUNTS

**FORMAT:** `{TYPE}-{VALUE}_SWITCH{CASE:{COND}-{VAL};...}`

### Available Conditions

- **FIRSTBUY** — No value needed (always set to 0)
  - Applies only if user has never ordered from this restaurant
- **TOTALSPENT** — Value = minimum total spent threshold
  - Applies if `user.totalAmount >= value`
- **TOTALITEMS** — Value = minimum items purchased threshold
  - Applies if `user.totalItems >= value`
- **TOTALORDERS** — Value = minimum orders placed threshold
  - Applies if `user.totalOrders >= value`

## EXAMPLES

### Simple Discounts

| Code | Description |
|------|-------------|
| `P-20` | 20% off |
| `P-100` | 100% off (free) |
| `FIXED-25` | $25 off |
| `FIXED-100` | $100 off |

### Conditional Discounts

| Code | Description |
|------|-------------|
| `P-20_SWITCH{CASE:FIRSTBUY-0;}` | 20% off for first-time buyers only |
| `P-10_SWITCH{CASE:TOTALORDERS-5;}` | 10% off after 5 orders |
| `FIXED-25_SWITCH{CASE:TOTALSPENT-500;}` | $25 off after spending $500 |
| `P-15_SWITCH{CASE:TOTALITEMS-10;}` | 15% off after buying 10 items |

## CODE STRUCTURE

```
P-20_SWITCH{CASE:FIRSTBUY-0;}
|  |  |       |   |        |
|  |  |       |   |        └─ condition value
|  |  |       |   └─ condition type
|  |  |       └─ SWITCH block start
|  |  └─ separator between value and conditions
|  └─ discount value
└─ discount type (P=percentage, FIXED=fixed amount)
```

> **Note:** Only one condition is supported per discount. Without conditions, the discount applies to all customers.
