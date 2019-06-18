const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.static("public"));

app.get("/fact", (req, res) => {
  axios
    .get("https://catfact.ninja/fact")
    .then(({ data: { fact } }) => res.json({ fact }));
});

app.listen(4000);
