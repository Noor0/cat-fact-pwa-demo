function urlB64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
const pushBtn = document.getElementById("push-notif");
// const actionBtn = document.getElementById("action");
let subscribed;
var registeration;

function toggleNotificationBtn(isSubscribed) {
  subscribed = isSubscribed;
  if (isSubscribed) {
    pushBtn.innerHTML = "DISABLE Push Notifications";
  } else {
    pushBtn.innerHTML = "ENABLE Push Notifications";
  }
}

actionBtn.addEventListener("click", e => {
  fetch("/action", { method: "POST" })
    .then(res => {
      if (res.ok) return res.json();
    })
    .then(res => {
      actionBtn.innerHTML = `Action: ${res.action}`;
    })
    .catch(err => {
      console.error("Error while performing action");
    });
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").then(reg => {
      console.log("registered service worker", reg);

      window.addEventListener("offline", e => {
        reg.sync.register("test-sync");
      });

      reg.pushManager.getSubscription().then(sub => {
        console.log({ oldSub: sub });
        if (!sub) toggleNotificationBtn(false);
        else toggleNotificationBtn(true);
      });

      pushBtn.addEventListener("click", async e => {
        const hasPermission = window.Notification.permission === "granted";
        if (!hasPermission) {
          await window.Notification.requestPermission();
        }
        if (!subscribed && hasPermission) {
          const applicationServerPublicKey =
            "BOagsDf_-tNHQeP5OKqqw4mgw7LycsU3FODH8sQoJFhpIu63ZHIBf2E9meq3Rn6uWnDxRUMocJ5RHi2P1re4opI";
          const applicationServerKey = urlB64ToUint8Array(
            applicationServerPublicKey
          );
          reg.pushManager
            .subscribe({ userVisibleOnly: true, applicationServerKey })
            .then(sub => {
              const subscription = JSON.parse(JSON.stringify(sub));
              fetch("/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data: subscription, ho: "hp" })
              });
              console.log(subscription);
              if (!sub) {
                toggleNotificationBtn(false);
              } else {
                toggleNotificationBtn(true);
              }
            });
        } else if (hasPermission) {
          reg.pushManager
            .getSubscription()
            .then(sub => {
              if (!sub) throw new Error("");
              return sub.unsubscribe();
            })
            .then(() => {
              toggleNotificationBtn(false);
            })
            .catch(err => {
              console.log("Error while unsubscribing", err);
            });
        }
      });

      reg.pushManager.getSubscription(sub => {
        if (!sub) {
          toggleNotificationBtn(false);
        } else {
          toggleNotificationBtn(true);
        }
      });
    });

    navigator.serviceWorker.ready.then(reg => {
      console.log("READY");
    });
  });
}
