/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { defaultCache } from "@serwist/turbopack/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";
import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const firebaseConfig = {
  apiKey: "AIzaSyBeH_AMxj4EC4tgDG39z8MTHh6SlmgAljc",
  authDomain: "pos-system-0.firebaseapp.com",
  projectId: "pos-system-0",
  storageBucket: "pos-system-0.appspot.com",
  messagingSenderId: "966111235551",
  appId: "1:966111235551:web:cce7b024741256de2fc86a",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

onBackgroundMessage(messaging, (payload) => {
  const notificationTitle =
    payload.notification?.title ?? "New Order Available";
  const notificationOptions = {
    body: payload.notification?.body ?? "A new order is ready for pickup.",
    icon: "/icons/icon-192.png",
    badge: "/badge.png",
    data: payload.data ?? {},
    vibrate: [200, 100, 200],
    color: "#2563EB",
    tag: "new-order",
    renotify: true,
    timestamp: Date.now(),
    requireInteraction: true,
    actions: [
      {
        action: "view",
        title: "View Order",
      },
    ],
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url ?? "/orders/marketplace";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.includes(urlToOpen) && "focus" in client) {
            return client.focus();
          }
        }
        return self.clients.openWindow(urlToOpen);
      }),
  );
});

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();
