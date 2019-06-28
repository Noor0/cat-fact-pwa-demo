fetch("/fact")
  .then(res => res.json())
  .then(res => {
    document.getElementById("fact").innerHTML = res.fact;
  });

let deferredPrompt;
const addBtn = document.getElementById("aths");
const sendBtn = document.getElementById("send");

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
