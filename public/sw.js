const cacheName = "cache-v18";
const assets = [
  "/",
  "/script.js",
  "/style.css",
  "/manifest.json",
  "/registerServiceWorker.js"
];

importScripts(
  "https://cdn.jsdelivr.net/npm/idb-keyval@3/dist/idb-keyval-iife.min.js"
);
importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js"
);

workbox.core.setCacheNameDetails({
  prefix: "cat-fact",
  suffix: "v1",
  precache: "static-cache",
  runtime: "dynamic-cache"
});

const precacheController = new workbox.precaching.PrecacheController();
precacheController.addToCacheList(assets);

const bgSyncPlugin = new workbox.backgroundSync.Plugin("sync-queue", {
  maxRetentionTime: 24 * 60
});

const offlineStorage = new idbKeyval.Store("offlineStorage", "factsStore");

self.addEventListener("install", event => {
  event.waitUntil(precacheController.install());
});

self.addEventListener("activate", event => {
  event.waitUntil(precacheController.activate());
});

workbox.routing.registerRoute(
  /\/action/,
  new workbox.strategies.NetworkOnly({
    plugins: [bgSyncPlugin]
  }),
  "POST"
);

// cache favicons
workbox.routing.registerRoute(
  /(favicon|android-icon).*\.png/,
  new workbox.strategies.CacheFirst()
);

workbox.routing.registerRoute(
  ({ url, event }) => assets.includes(url.pathname),
  new workbox.strategies.CacheFirst({
    cacheName: workbox.core.cacheNames.precache
  })
);

workbox.routing.registerRoute(/\/fact/, ({ url, event, params }) => {
  return fetch(event.request)
    .then(async res => {
      if (res.ok) {
        const response = await res.clone().json();
        const offlineData = await idbKeyval.get("facts", offlineStorage);
        const updatedArray = [
          ...(offlineData ? [...offlineData, response].slice(-10) : [response])
        ];
        await idbKeyval.set("facts", updatedArray, offlineStorage);
        return res;
      }
    })
    .catch(async err => {
      const factsArray = await idbKeyval.get("facts", offlineStorage);
      const randIndex =
        Math.floor(Math.random() * (factsArray.length - 0 + 1)) + 0;
      const blob = new Blob([JSON.stringify(factsArray[randIndex])], {
        type: "application/json"
      });
      return new Response(blob, { status: 200, statusText: "ok" });
    });
});

self.addEventListener("push", function(event) {
  const notification = event.data.json();
  const notificationDisplayed = self.registration.showNotification(
    notification.title,
    {
      ...notification,
      badge: "./images/icon-192.png",
      icon: "./images/icon-192.png",
      vibrate: [200, 100, 200, 100, 200, 100, 200],
      actions: [
        { action: "focus", title: "Focus" },
        { action: "close", title: "Close" }
      ]
    }
  );
  event.waitUntil(notificationDisplayed);
});

self.addEventListener("notificationclick", function(e) {
  var notification = e.notification;
  // var primaryKey = notification.data.primaryKey;
  var action = e.action;

  if (action === "close") {
    notification.close();
  } else if (action === "focus") {
    e.waitUntil(
      clients
        .matchAll({
          includeUncontrolled: true
        })
        .then(clients => {
          clients[0].focus();
        })
    );
  } else {
    clients.openWindow("http://www.kittenwar.com/");
    notification.close();
  }
});
