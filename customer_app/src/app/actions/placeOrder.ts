"use server";

import { initAdmin } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import {
  getSessionCookieValue,
  verifySessionCookie,
} from "@/lib/auth/session";
import {
  TERMINAL_STATUSES,
  calculateOrderFinance,
} from "@ordersync/order-utils";
import type {
  MainMenuType,
  OrderStatusType,
  DeliveryFeesConfig,
} from "@ordersync/types";
import {
  computeServerPricing,
  OrderValidationError,
} from "@/lib/server/orderPricing";
import type { PlaceOrderInput } from "@/lib/orderTypes";
import workingDaysChecker from "@/utils/workingDaysChecker";
import randomOrderNumber from "@/utils/randomOrderId";
import getDistanceFromLatlngInKm from "@/utils/getDistanceFromLatlngInKm";

const PRICING_EPSILON = 0.01;
const LOCATION_EPSILON = 0.0001;
const DEFAULT_DELIVERY_FEES: DeliveryFeesConfig = { perKm: 3.5, min: 5 };
const DEFAULT_MAX_WORK_DISTANCE_KM = 15;

export type PlaceOrderServerResult =
  | { success: true; orderId: string; orderNumber: number }
  | { success: false; code: string };

interface TransactionResult {
  data?: { orderId: string; orderNumber: number };
  error?: { code: string };
}

interface ActiveOrderShape {
  id: string;
  orderNumber?: number;
  businessId?: string;
  pricing?: { total?: number };
  cart?: { quantity?: number }[];
  customer?: { firstOrderDate?: number };
  status?: { current?: OrderStatusType };
}

const isNonTerminal = (status: string | undefined): boolean =>
  !!status && !TERMINAL_STATUSES.includes(status as OrderStatusType);

const isValidCommissionPercent = (value: unknown): value is number =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value >= 0 &&
  value <= 100;

const cleanUndefined = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(cleanUndefined);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      if (val !== undefined) out[key] = cleanUndefined(val);
    }
    return out;
  }
  return value;
};

const matchesSavedLocation = (
  locations: unknown,
  submitted: number[]
): boolean => {
  if (!locations || typeof locations !== "object") return false;

  const matches = (coords: unknown): boolean =>
    Array.isArray(coords) &&
    coords.length >= 2 &&
    Number.isFinite(coords[0]) &&
    Number.isFinite(coords[1]) &&
    Math.abs(coords[0] - submitted[0]) <= LOCATION_EPSILON &&
    Math.abs(coords[1] - submitted[1]) <= LOCATION_EPSILON;

  const record = locations as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (key === "selected" || key === "city") continue;
    const entry = record[key];
    if (!entry || typeof entry !== "object") continue;
    const candidate = entry as Record<string, unknown>;
    if (matches(candidate.latlng) || matches(candidate.latlang)) return true;
  }

  return false;
};

const pricingMatches = (
  client: PlaceOrderInput["pricing"],
  server: ReturnType<typeof computeServerPricing>["pricing"]
): boolean => {
  const close = (a?: number, b?: number): boolean =>
    Math.abs((a ?? 0) - (b ?? 0)) <= PRICING_EPSILON;

  return (
    close(client.subtotal, server.subtotal) &&
    close(client.discount, server.discount) &&
    close(client.deliveryFees, server.deliveryFees) &&
    close(client.total, server.total) &&
    (client.promoCode ?? null) === (server.promoCode ?? null) &&
    close(client.promoDiscount, server.promoDiscount)
  );
};

export async function placeOrderServer(args: {
  idToken: string;
  orderData: PlaceOrderInput;
}): Promise<PlaceOrderServerResult> {
  try {
    const { idToken, orderData: rawOrderData } = args;

    if (!idToken || !rawOrderData) {
      return { success: false, code: "INVALID_ORDER_PAYLOAD" };
    }

    // Strip legacy field still sent by older deployed client versions.
    const { reconciliation: _ignored, ...orderData } =
      rawOrderData as PlaceOrderInput & { reconciliation?: unknown };

    const app = await initAdmin();
    const auth = getAuth(app);
    const db = getFirestore(app);

    let decodedUid: string | null = null;

    // Preferred: verify the httpOnly session cookie established at sign-in.
    const session = await getSessionCookieValue();
    if (session) {
      const sessionUser = await verifySessionCookie(session);
      if (sessionUser) {
        decodedUid = sessionUser.uid;
      }
    }

    // Fallback: verify the client-supplied ID token.
    if (!decodedUid && idToken) {
      try {
        const decoded = await auth.verifyIdToken(idToken);
        decodedUid = decoded.uid;
      } catch {
        // fall through to the uid check below
      }
    }

    if (
      !decodedUid ||
      decodedUid !== orderData.customerUid ||
      decodedUid !== orderData.customer?.uid
    ) {
      return { success: false, code: "UNAUTHORIZED" };
    }

    const customerRef = db.collection("customers").doc(orderData.customer.uid);
    const businessRef = db
      .collection("businesses")
      .doc(orderData.business.id);
    const menuRef = db.collection("menus").doc(orderData.business.id);
    const servicesRef = db.collection("services").doc("platform");

    const activeOrdersSnap = await db
      .collection("orders")
      .where("customer.uid", "==", orderData.customerUid)
      .limit(50)
      .get();

    const activeOrder = activeOrdersSnap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as ActiveOrderShape)
      .find(
        (order) =>
          !TERMINAL_STATUSES.includes(
            order.status?.current as OrderStatusType
          )
      );

    const orderRef = db.collection("orders").doc();
    const now = Date.now();

    const result: TransactionResult = await db.runTransaction(
      async (transaction) => {
        const customerSnap = await transaction.get(customerRef);
        if (!customerSnap.exists) {
          return { error: { code: "CUSTOMER_NOT_FOUND" } };
        }

        const businessSnap = await transaction.get(businessRef);
        if (!businessSnap.exists) {
          return { error: { code: "RESTAURANT_NOT_FOUND" } };
        }

        const menuSnap = await transaction.get(menuRef);
        if (!menuSnap.exists) {
          return { error: { code: "RESTAURANT_NOT_FOUND" } };
        }

        const servicesSnap = await transaction.get(servicesRef);

        const customerData = customerSnap.data() ?? {};
        const restaurantData = businessSnap.data() ?? {};
        const menuData = menuSnap.data();

        const restaurantStatus = restaurantData.status || "pause";
        if (
          restaurantStatus === "inactive" ||
          restaurantStatus === "pause" ||
          restaurantStatus === "hidden"
        ) {
          return { error: { code: "RESTAURANT_NOT_ACCEPTING_ORDERS" } };
        }

        if (customerData.isActive === false) {
          return { error: { code: "ACCOUNT_SUSPENDED" } };
        }

        if (
          !customerData.userInfo?.name ||
          !customerData.userInfo?.phone
        ) {
          return { error: { code: "INVALID_ORDER_PAYLOAD" } };
        }

        const isOpen = workingDaysChecker(
          restaurantData.operations?.openingHours,
          undefined,
          restaurantData.operations?.openNowUntil
        );
        if (isOpen === false) {
          return { error: { code: "RESTAURANT_NOT_ACCEPTING_ORDERS" } };
        }

        if (!isValidCommissionPercent(restaurantData.commissionPercent)) {
          return { error: { code: "RESTAURANT_COMMISSION_NOT_SET" } };
        }
        const commissionPercent = restaurantData.commissionPercent;

        const deliveryLatLng = orderData.delivery?.latlng;
        if (
          !Array.isArray(deliveryLatLng) ||
          deliveryLatLng.length < 2 ||
          !Number.isFinite(deliveryLatLng[0]) ||
          !Number.isFinite(deliveryLatLng[1])
        ) {
          return { error: { code: "INVALID_DELIVERY_LOCATION" } };
        }
        if (!matchesSavedLocation(customerData.locations, deliveryLatLng)) {
          return { error: { code: "INVALID_DELIVERY_LOCATION" } };
        }

        const trackedId = customerData?.trackedOrder?.id || null;

        if (activeOrder && activeOrder.id !== trackedId) {
          const activeOrderSnap = await transaction.get(
            db.collection("orders").doc(activeOrder.id)
          );
          const activeStatus = activeOrderSnap.exists
            ? (activeOrderSnap.data() as { status?: { current?: string } })
                .status?.current
            : undefined;

          if (isNonTerminal(activeStatus)) {
            transaction.update(customerRef, {
              trackedOrder: {
                id: activeOrder.id,
                orderNumber: activeOrder.orderNumber,
                restaurant: activeOrder.businessId,
                pendingLoyalty: {
                  orderId: activeOrder.id,
                  restaurant: activeOrder.businessId,
                  amount: activeOrder.pricing?.total ?? 0,
                  items: (activeOrder.cart ?? []).reduce(
                    (sum: number, item: { quantity?: number }) =>
                      sum + (item.quantity || 0),
                    0
                  ),
                  totalOrders: 1,
                  firstOrderTime:
                    activeOrder.customer?.firstOrderDate ?? now,
                  counted: false,
                },
              },
            });
            return { error: { code: "ALREADY_HAS_ACTIVE_ORDER" } };
          }
        }

        if (trackedId) {
          const trackedOrderSnap = await transaction.get(
            db.collection("orders").doc(trackedId)
          );
          const trackedStatus = trackedOrderSnap.exists
            ? (trackedOrderSnap.data() as { status?: { current?: string } })
                .status?.current
            : undefined;

          if (isNonTerminal(trackedStatus)) {
            return { error: { code: "ALREADY_HAS_ACTIVE_ORDER" } };
          }
        }

        const restaurantLatLng = restaurantData.profile?.latlng;
        if (
          !Array.isArray(restaurantLatLng) ||
          restaurantLatLng.length < 2
        ) {
          return { error: { code: "INVALID_ORDER_PAYLOAD" } };
        }

        const servicesConfig = servicesSnap.exists
          ? {
              perKm:
                servicesSnap.data()?.deliveryFeesPerKm ??
                DEFAULT_DELIVERY_FEES.perKm,
              min:
                servicesSnap.data()?.minDeliveryFees ??
                DEFAULT_DELIVERY_FEES.min,
              maxWorkDistanceKm:
                servicesSnap.data()?.maxWorkDistanceKm ??
                DEFAULT_MAX_WORK_DISTANCE_KM,
            }
          : {
              ...DEFAULT_DELIVERY_FEES,
              maxWorkDistanceKm: DEFAULT_MAX_WORK_DISTANCE_KM,
            };

        const distanceKm = getDistanceFromLatlngInKm(
          [deliveryLatLng[0], deliveryLatLng[1]],
          [restaurantLatLng[0], restaurantLatLng[1]]
        );
        if (
          !Number.isFinite(servicesConfig.maxWorkDistanceKm) ||
          servicesConfig.maxWorkDistanceKm <= 0 ||
          distanceKm > servicesConfig.maxWorkDistanceKm
        ) {
          return { error: { code: "OUT_OF_DELIVERY_RANGE" } };
        }

        let serverPricing;
        let serverLines;
        try {
          const computed = computeServerPricing({
            menu: menuData as MainMenuType,
            cart: orderData.cart,
            user: {
              createdAt: customerData.createdAt,
              restaurants: customerData.restaurants,
            },
            resId: orderData.business.id,
            deliveryLatLng: [deliveryLatLng[0], deliveryLatLng[1]],
            restaurantLatLng: [restaurantLatLng[0], restaurantLatLng[1]],
            deliveryFeesConfig: servicesConfig,
          });
          serverPricing = computed.pricing;
          serverLines = computed.lines;
        } catch (error) {
          if (error instanceof OrderValidationError) {
            return { error: { code: error.code } };
          }
          return { error: { code: "INVALID_ORDER_PAYLOAD" } };
        }

        if (!pricingMatches(orderData.pricing, serverPricing)) {
          return { error: { code: "PRICE_MISMATCH" } };
        }

        const orderNumber = randomOrderNumber();

        const serverFinance = calculateOrderFinance({
          ...serverPricing,
          commissionPercent,
        });

        const businessSettings = restaurantData.settings ?? {};
        const marketplaceHidden = businessSettings.hideFromMarketplace === true;

        const newOrder = {
          ...orderData,
          cart: serverLines,
          pricing: serverPricing,
          finance: serverFinance,
          id: orderRef.id,
          orderNumber,
          businessId: orderData.business.id,
          marketplaceHidden,
          status: {
            current: "RECEIVED" as OrderStatusType,
            history: [
              {
                status: "RECEIVED" as OrderStatusType,
                timestamp: now,
                by: "customer",
              },
            ],
          },
          timeline: { placedAt: now },
          createdAt: now,
          updatedAt: now,
        };

        transaction.set(orderRef, cleanUndefined(newOrder));

        transaction.update(customerRef, {
          trackedOrder: {
            id: orderRef.id,
            orderNumber,
            restaurant: orderData.business.id,
            pendingLoyalty: {
              orderId: orderRef.id,
              restaurant: orderData.business.id,
              amount: serverPricing.total,
              items: serverLines.reduce(
                (sum, item) => sum + (item.quantity || 0),
                0
              ),
              totalOrders: 1,
              firstOrderTime: orderData.customer.firstOrderDate,
              counted: false,
            },
          },
        });

        return { data: { orderId: orderRef.id, orderNumber } };
      }
    );

    if (result.error) {
      return { success: false, code: result.error.code };
    }

    return { success: true, ...result.data! };
  } catch (error) {
    console.error("Error in server action [placeOrderServer]:", error);
    return { success: false, code: "INTERNAL_ERROR" };
  }
}
