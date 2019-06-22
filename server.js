const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.static("public"));

let randomNumber = 0;

app.get("/fact", (req, res) => {
  axios
    .get("https://catfact.ninja/fact")
    .then(({ data: { fact } }) => res.json({ fact }))
    .catch(err => res.json({ fact: `Error ${randomNumber++}` }));
});

app.listen(4000);
