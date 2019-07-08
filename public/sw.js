const cacheName = "cache-v18";
const assets = ["/", "/script.js", "/style.css"];
const excludeCache = ["fonts.googleapis.com"];

importScripts("/sw-helpers.js");
importScripts(
  "https://cdn.jsdelivr.net/npm/idb-keyval@3/dist/idb-keyval-iife.min.js"
);
importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js"
);

const bgSyncPlugin = new workbox.backgroundSync.Plugin("sync-queue", {
  maxRetentionTime: 24 * 60
});

workbox.routing.registerRoute(
  /\/action/,
  new workbox.strategies.NetworkOnly({
    plugins: [bgSyncPlugin]
  }),
  "POST"
);

const helper = new Helper();

self.addEventListener("install", event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(assets);
    })
  );
});

const offlineStorage = new idbKeyval.Store("offlineStorage", "factsStore");
const syncStorage = new idbKeyval.Store("syncStorage", "syncStore");

self.addEventListener("activate", event => {
  // delete old cahces
  event.waitUntil(
    caches.keys().then(keys => {
      keys.map(key => {
        if (key !== cacheName)
          return caches
            .delete(key)
            .then(isDeleted =>
              console.log(`cache ${key} deleted ${isDeleted}`)
            );
        return Promise.resolve("");
      });
    })
  );
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

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  if (
    event.request.method === "POST" ||
    event.request.method === "PUT" ||
    event.request.method === "DELETE"
  )
    event.respondWith(fetch(event.request).catch(err => {}));
  else if (assets.includes(url.pathname)) {
    event.respondWith(helper.respondFromCache(event));
  } else if (url.pathname.includes("/fact")) {
    event.respondWith(
      fetch(event.request)
        .then(async res => {
          if (res.ok) {
            const response = await res.clone().json();
            const offlineData = await idbKeyval.get("facts", offlineStorage);
            const updatedArray = [
              ...(offlineData
                ? [...offlineData, response].slice(-10)
                : [response])
            ];
            await idbKeyval.set("facts", updatedArray, offlineStorage);
            return res;
          }
        })
        .catch(async err => {
          const factsArray = await idbKeyval.get("facts", offlineStorage);
          const randIndex = Math.floor(Math.random() * (10 - 0 + 1)) + 0;
          const blob = new Blob([JSON.stringify(factsArray[randIndex])], {
            type: "application/json"
          });
          return new Response(blob, { status: 200, statusText: "ok" });
        })
    );
  } else if (!/https:\/\/fonts\.googleapis\.com/.test(event.request.url)) {
    event.respondWith(helper.networkThenCache(event));
  }
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

self.addEventListener("sync", e => {
  console.log("sync", e);
});

// reg.pushManager.getSubscription().then(subscription => {
//   console.log({ subscription });
// });
