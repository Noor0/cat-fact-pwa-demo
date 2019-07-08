fetch("/fact")
  .then(res => res.json())
  .then(res => {
    document.getElementById("fact").innerHTML = res.fact;
  });

let deferredPrompt;
const addBtn = document.getElementById("aths");
const sendBtn = document.getElementById("send");
const actionBtn = document.getElementById("action");

const fetchAction = () =>
  fetch("/action")
    .then(res => {
      if (res.ok) return res.json();
    })
    .then(res => {
      actionBtn.innerHTML = `Action: ${res.action}`;
    });

fetchAction();
window.addEventListener("online", e => {
  setTimeout(fetchAction, 1000);
});

window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  deferredPrompt = e;
  addBtn.style.display = "inline-block";
});

addBtn.addEventListener("click", () => {
  deferredPrompt.prompt();
});

sendBtn.addEventListener("click", () => {
  fetch("/send");
});
