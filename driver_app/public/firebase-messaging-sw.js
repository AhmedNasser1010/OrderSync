importScripts("https://www.gstatic.com/firebasejs/12.16.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.16.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBeH_AMxj4EC4tgDG39z8MTHh6SlmgAljc",
  authDomain: "pos-system-0.firebaseapp.com",
  projectId: "pos-system-0",
  storageBucket: "pos-system-0.appspot.com",
  messagingSenderId: "966111235551",
  appId: "1:966111235551:web:cce7b024741256de2fc86a",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title ?? "New Order Available";
  const notificationOptions = {
    body: payload.notification?.body ?? "A new order is ready for pickup.",
    icon: "/icon.png",
    badge: "/badge.png",
    data: payload.data ?? {},
    vibrate: [200, 100, 200],
    color: "#F29657",
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
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.includes(urlToOpen) && "focus" in client) {
            return client.focus();
          }
        }
        return clients.openWindow(urlToOpen);
      }),
  );
});
