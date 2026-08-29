import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

export const E2E_PROJECT_ID = "pos-system-0";
export const E2E_API_KEY = "e2e-emulator-api-key";
export const E2E_RESTAURANT_ID = "e2e-restaurant";
export const E2E_USER_EMAIL = "e2e.customer@zajil.app";
export const E2E_USER_PASSWORD = "e2e-secret-123";
export const E2E_USER_NAME = "Test Customer";
export const E2E_USER_PHONE = "01117073085";

const RESTAURANT_LATLNG: [number, number] = [29.620724, 31.250945];
const CUSTOMER_LATLNG: [number, number] = [29.621, 31.251];

const AUTH_PORT = 9099;
const FIRESTORE_PORT = 8080;

function adminApp() {
  process.env.FIREBASE_AUTH_EMULATOR_HOST = `127.0.0.1:${AUTH_PORT}`;
  process.env.FIRESTORE_EMULATOR_HOST = `127.0.0.1:${FIRESTORE_PORT}`;
  if (getApps().length) return getApps()[0];
  return initializeApp({ projectId: E2E_PROJECT_ID });
}

export async function seedEmulator() {
  const app = adminApp();
  const db = getFirestore(app);
  const auth = getAuth(app);

  let uid: string;
  try {
    const user = await auth.createUser({
      email: E2E_USER_EMAIL,
      password: E2E_USER_PASSWORD,
      displayName: E2E_USER_NAME,
    });
    uid = user.uid;
  } catch {
    const existing = await auth.getUserByEmail(E2E_USER_EMAIL);
    uid = existing.uid;
  }

  const now = Date.now();

  await db.collection("businesses").doc(E2E_RESTAURANT_ID).set({
    accessToken: E2E_RESTAURANT_ID,
    partnerUid: "e2e-partner",
    commissionPercent: 10,
    branding: {
      closeMsg: "",
      promotionalSubtitle: "",
      cover: "",
      icon: "",
    },
    owner: {
      uid: "e2e-owner",
      email: "e2e.owner@zajil.app",
      phone: "01110000000",
      name: "Test Owner",
    },
    profile: {
      name: "Test Restaurant",
      nameInAr: "مطعم تجريبي",
      industry: "food",
      address: "El Ayat",
      latlng: RESTAURANT_LATLNG,
      cuisines: ["pizza"],
    },
    operations: {
      openingHours: {
        sunday: { start: "00:00", end: "23:59", closed: false },
        monday: { start: "00:00", end: "23:59", closed: false },
        tuesday: { start: "00:00", end: "23:59", closed: false },
        wednesday: { start: "00:00", end: "23:59", closed: false },
        thursday: { start: "00:00", end: "23:59", closed: false },
        friday: { start: "00:00", end: "23:59", closed: false },
        saturday: { start: "00:00", end: "23:59", closed: false },
      },
      openNowUntil: now + 60 * 60 * 1000,
      cookTime: [15, 25],
      paymentMethods: { cash: true },
    },
    settings: { printInvoice: false, skipAccepted: true },
    status: "active",
    hasOffers: false,
    topChains: false,
    reviewSummary: {
      averageRating: 0,
      totalRatingPoints: 0,
      totalReviews: 0,
      stars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    },
    createdAt: now,
    updatedAt: now,
  });

  await db.collection("menus").doc(E2E_RESTAURANT_ID).set({
    accessToken: E2E_RESTAURANT_ID,
    partnerUid: "e2e-partner",
    createdAt: now,
    updatedAt: now,
    orderDiscounts: [],
    categories: [
      {
        id: "cat-1",
        title: "Main",
        topMenu: true,
        visibility: true,
        createdAt: now,
        updatedAt: now,
      },
    ],
    items: [
      {
        id: "item-1",
        title: "Test Pizza",
        price: 100,
        topMenu: true,
        visibility: true,
        category: "cat-1",
        backgrounds: [],
        createdAt: now,
        updatedAt: now,
      },
    ],
  });

  await db.collection("services").doc("platform").set({
    deliveryFeesPerKm: 3.5,
    minDeliveryFees: 5,
    updatedAt: now,
    updatedBy: "e2e-seed",
  });

  const customerRef = db.collection("customers").doc(uid);
  await customerRef.set({
    uid,
    createdAt: now,
    isActive: true,
    partnerUid: "e2e",
    restaurants: [],
    locations: {
      home: { latlng: CUSTOMER_LATLNG, address: "Test Street, El Ayat" },
      selected: "home",
      city: "El Ayat",
    },
    userInfo: {
      role: "CUSTOMER",
      name: E2E_USER_NAME,
      email: E2E_USER_EMAIL,
      phone: E2E_USER_PHONE,
      secondPhone: "",
      avatar: "",
      uid,
      provider: "password",
    },
    trackedOrder: {
      id: null,
      orderNumber: null,
      restaurant: null,
      loyaltyCountedForOrderId: null,
      pendingLoyalty: null,
    },
  });

  const ordersSnap = await db
    .collection("orders")
    .where("customer.uid", "==", uid)
    .get();
  await Promise.all(ordersSnap.docs.map((doc) => doc.ref.delete()));

  return { uid };
}

interface CustomerOrder {
  businessId: string;
  customer: { name: string };
  status: { current: string };
  pricing: { total: number; subtotal: number; deliveryFees: number };
  finance: Record<string, number>;
  [key: string]: unknown;
}

export async function getCustomerOrders(): Promise<CustomerOrder[]> {
  const app = adminApp();
  const db = getFirestore(app);
  const auth = getAuth(app);
  const user = await auth.getUserByEmail(E2E_USER_EMAIL);
  const snap = await db
    .collection("orders")
    .where("customer.uid", "==", user.uid)
    .get();
  return snap.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as unknown as CustomerOrder
  );
}

export function authStorageKey() {
  return `firebase:authUser:${E2E_API_KEY}:[DEFAULT]`;
}

export async function getAuthStoragePayload(): Promise<string> {
  const response = await fetch(
    `http://127.0.0.1:${AUTH_PORT}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${E2E_API_KEY}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: E2E_USER_EMAIL,
        password: E2E_USER_PASSWORD,
        returnSecureToken: true,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Emulator sign-in failed (${response.status}): ${await response.text()}`
    );
  }

  const data = await response.json();
  const now = Date.now();

  return JSON.stringify({
    uid: data.localId,
    email: data.email,
    emailVerified: false,
    isAnonymous: false,
    providerData: [
      {
        providerId: "password",
        uid: data.localId,
        displayName: E2E_USER_NAME,
        email: data.email,
        phoneNumber: null,
        photoURL: null,
      },
    ],
    stsTokenManager: {
      refreshToken: data.refreshToken,
      accessToken: data.idToken,
      expirationTime: now + Number(data.expiresIn) * 1000,
    },
    createdAt: String(data.createdAt ?? now),
    lastLoginAt: String(now),
    apiKey: E2E_API_KEY,
    appName: "[DEFAULT]",
  });
}
