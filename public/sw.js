const cacheName = "cache-v15";
const assets = ["/", "/script.js", "/style.css"];
const excludeCache = ["fonts.googleapis.com"];

importScripts("/sw-helpers.js");
importScripts(
  "https://cdn.jsdelivr.net/npm/idb-keyval@3/dist/idb-keyval-iife.min.js"
);
const helper = new Helper();

const openIDB = (db, objectStores) =>
  new Promise((res, rej) => {
    let openRequest = indexedDB.open(db, 1);
    openRequest.onupgradeneeded = function() {
      objectStores.forEach(os => openRequest.result.createObjectStore(os));
    };
    openRequest.onsuccess = function() {
      res(openRequest.result);
    };

    openRequest.onerror = function() {
      rej(openRequest.error);
    };
  });

self.addEventListener("install", event => {
  self.skipWaiting();
  clients.claim();

  event.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(assets);
    })
  );
});

const offlineStorage = new idbKeyval.Store("offlineStorage", "factsStore");

self.addEventListener("activate", event => {
  // delete old cahces
  event.waitUntil(
    caches.keys().then(keys => {
      keys.forEach(key => {
        if (key !== cacheName)
          caches
            .delete(key)
            .then(isDeleted =>
              console.log(`cache ${key} deleted ${isDeleted}`)
            );
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
  // console.log("FetchEvent", event);
  const url = new URL(event.request.url);
  //
  if (event.request.method === "POST") event.respondWith(fetch(event.request));
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

// reg.pushManager.getSubscription().then(subscription => {
//   console.log({ subscription });
// });
