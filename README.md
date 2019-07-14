# test-pwa
PWA with offline caching, push notification and background sync

 - NetworkThenCache strategy for displaying facts, stores last 10 facts in indexedDB for experience.
 - FCM with Webpush for PushNotifications.
 - WorkBox `backgroundSync` plugin for bg-sync.


# installation
 - `yarn install`
 - `yarn dev:start`
 - open localhost:4000

For background-sync:
 - turn off your network.
 - press action button a couple times.
 - turn on your network again and witness the magic ✨✨.
