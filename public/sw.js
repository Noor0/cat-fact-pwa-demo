const cacheName = 'cache-v2';
const assets = ['/', '/script.js', '/style.css'];
const excludeCache = ['fonts.googleapis.com'];

importScripts('/sw-helpers.js');
const helper = new Helper();

self.addEventListener('install', event => {
	self.skipWaiting();
	clients.claim();

	event.waitUntil(
		caches.open(cacheName).then(cache => {
			return cache.addAll(assets);
		}),
	);
});

self.addEventListener('activate', event => {
	// delete old cahces
	event.waitUntil(
		caches.keys().then(keys => {
			keys.forEach(key => {
				if (key !== cacheName)
					caches
						.delete(key)
						.then(isDeleted =>
							console.log(`cache ${key} deleted ${isDeleted}`),
						);
			});
		}),
	);
});

self.addEventListener('fetch', event => {
	// console.log("FetchEvent", event);
	// const url = new URL(event.request.url);
	//
	if (!/https:\/\/fonts\.googleapis\.com/.test(event.request.url))
		event.respondWith(helper.networkThenCache(event));
});
