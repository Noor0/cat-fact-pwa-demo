fetch("/fact")
  .then(res => res.json())
  .then(res => {
    document.getElementById("fact").innerHTML = res.fact;
  });
