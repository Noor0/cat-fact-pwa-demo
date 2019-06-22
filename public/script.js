fetch("/fact")
  .then(res => res.json())
  .then(res => {
    document.getElementById("fact").innerHTML = res.fact;
  });

let deferredPrompt;
const addBtn = document.getElementById("aths");

window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  deferredPrompt = e;
  addBtn.style.display = "block";
});

addBtn.addEventListener("click", () => {
  deferredPrompt.prompt();
});
