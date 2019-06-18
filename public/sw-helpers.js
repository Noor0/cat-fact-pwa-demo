// importScripts(
//   "https://gist.githubusercontent.com/pakx/07e239842cf6bea44b71e39d200a6797/raw/8235ed339b35fa76a7c19c25f0b2a4e3f8169f4a/path-to.regexp.js"
// );

class Helper {
  constructor() {
    this.routesMap = {
      get: [],
      post: [],
      put: [],
      patch: [],
      delete: []
    };

    this.handlersMap = {
      get: [],
      post: [],
      put: [],
      patch: [],
      delete: []
    };
  }

  respondFromCache(event) {
    return caches.match(event.request);
  }

  cacheThenNetwork(event) {
    return this.respondFromCache(event).then(res => {
      return res || this.networkThenCache(event);
    });
  }

  networkThenCache(event) {
    return fetch(event.request)
      .then(res => {
        if (!res.ok) return this.respondFromCache(event);
        return caches.open(cacheName).then(cache => {
          cache.put(event.request, res.clone());
          return res;
        });
      })
      .catch(res => this.respondFromCache(event));
  }

  GET(route, ...handlers) {
    const keys = [];
    const regexp = pathToRegexp(route, keys);
    this.routesMap.get = [...this.routesMap.get, { regexp, keys }];
    this.handlersMap.get = [...this.handlersMap.get, ...handlers];
  }
}
