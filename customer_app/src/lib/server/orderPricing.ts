import {
  priceAfterDiscount,
  resolveItemDiscount,
  applyOrderDiscounts,
  calculateDiscountAmount,
} from "@ordersync/order-utils";
import type {
  MainMenuType,
  ItemType,
  DeliveryFeesConfig,
} from "@ordersync/types";
import getDeliveryFees from "@/utils/getDeliveryFees";
import getDistanceFromLatlngInKm from "@/utils/getDistanceFromLatlngInKm";

export class OrderValidationError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "OrderValidationError";
    this.code = code;
  }
}

export interface ServerCartLine {
  id: string;
  quantity: number;
  selectedSize?: string | null;
  discountCode?: string;
}

export interface ServerUser {
  createdAt?: number;
  restaurants?: Array<{
    accessToken: string;
    totalAmount?: number;
    totalItems?: number;
    totalOrders?: number;
    lastOrderTime?: number;
  }>;
}

export interface ServerPricingInput {
  menu: MainMenuType;
  cart: ServerCartLine[];
  user: ServerUser;
  resId: string;
  deliveryLatLng: [number, number];
  restaurantLatLng: [number, number];
  deliveryFeesConfig?: Partial<DeliveryFeesConfig>;
}

export interface ServerPricingResult {
  pricing: {
    subtotal: number;
    discount: number;
    deliveryFees: number;
    total: number;
    promoCode?: string;
    promoDiscount?: number;
  };
  lines: {
    id: string;
    name: string;
    quantity: number;
    selectedSize: string | null;
    discountCode?: string;
  }[];
}

export function computeServerPricing(
  input: ServerPricingInput
): ServerPricingResult {
  const {
    menu,
    cart,
    user,
    resId,
    deliveryLatLng,
    restaurantLatLng,
    deliveryFeesConfig,
  } = input;

  const categories = menu.categories ?? [];
  const items = menu.items ?? [];
  const orderDiscounts = menu.orderDiscounts ?? [];

  if (!Array.isArray(cart) || cart.length === 0) {
    throw new OrderValidationError(
      "INVALID_ORDER_PAYLOAD",
      "Cart is empty."
    );
  }

  let unitSubtotal = 0;
  let finalSubtotal = 0;

  const orderDiscountCart: Array<{ price: number; quantity: number }> = [];

  const lines = cart.map((line) => {
    const quantity = line.quantity;
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new OrderValidationError(
        "INVALID_ORDER_PAYLOAD",
        "Invalid item quantity."
      );
    }

    const menuItem: ItemType | undefined = items.find(
      (item) => item.id === line.id
    );
    if (!menuItem) {
      throw new OrderValidationError(
        "ITEM_UNAVAILABLE",
        `Item not found: ${line.id}`
      );
    }
    if (menuItem.visibility === false) {
      throw new OrderValidationError(
        "ITEM_UNAVAILABLE",
        `Item is not available: ${line.id}`
      );
    }

    const category = categories.find(
      (cat) => cat.id === menuItem.category
    );
    if (category && category.visibility === false) {
      throw new OrderValidationError(
        "ITEM_UNAVAILABLE",
        `Category is not available: ${category.id}`
      );
    }

    let unitPrice = Number(menuItem.price);
    if (line.selectedSize) {
      const size = menuItem.sizes?.find(
        (itemSize) => itemSize.size === line.selectedSize
      );
      if (!size) {
        throw new OrderValidationError(
          "ITEM_UNAVAILABLE",
          `Invalid size for item: ${line.id}`
        );
      }
      unitPrice = Number(size.price);
    }

    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      throw new OrderValidationError(
        "INVALID_ORDER_PAYLOAD",
        `Invalid price for item: ${line.id}`
      );
    }

    const effectiveDiscount = resolveItemDiscount(menuItem, category);
    const { finalPrice, isAvailableForUser } = effectiveDiscount
      ? priceAfterDiscount(unitPrice, effectiveDiscount, user, resId)
      : { finalPrice: unitPrice, isAvailableForUser: false };

    const discountedPrice =
      isAvailableForUser && unitPrice !== finalPrice ? finalPrice : unitPrice;

    // Order-level discounts must see the BASE menu price (mirrors the client).
    orderDiscountCart.push({
      price: Number(menuItem.price),
      quantity,
    });

    unitSubtotal += unitPrice * quantity;
    finalSubtotal += discountedPrice * quantity;

    return {
      id: line.id,
      name: menuItem.title ?? "",
      quantity,
      selectedSize: line.selectedSize ?? null,
      discountCode: line.discountCode || undefined,
    };
  });

  const itemDiscount = unitSubtotal - finalSubtotal;

  const eligibleDiscounts = applyOrderDiscounts(
    orderDiscountCart,
    orderDiscounts,
    user,
    resId
  );
  const autoDiscount = eligibleDiscounts[0] ?? null;

  let orderDiscountAmount = 0;
  let promoCode: string | undefined;
  let promoDiscount: number | undefined;

  if (autoDiscount) {
    orderDiscountAmount = calculateDiscountAmount(finalSubtotal, autoDiscount);

    promoCode = autoDiscount.code;
    promoDiscount = calculateDiscountAmount(unitSubtotal, autoDiscount);
  }

  const afterOrderDiscount = Math.max(
    0,
    finalSubtotal - orderDiscountAmount
  );

  const deliveryFees = getDeliveryFees(
    getDistanceFromLatlngInKm(deliveryLatLng, restaurantLatLng),
    deliveryFeesConfig
  );

  return {
    pricing: {
      subtotal: unitSubtotal,
      discount: itemDiscount + orderDiscountAmount,
      deliveryFees,
      total: afterOrderDiscount + deliveryFees,
      ...(promoCode ? { promoCode, promoDiscount } : {}),
    },
    lines,
  };
}
