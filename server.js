const express = require("express");
const axios = require("axios");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const app = express();

const serverKey =
  "AAAAykKja5A:APA91bHJ0-jWbdBO0kcp5SUWS67cpAB5RW4lBeuG9UnJ_Rot3fsy01dqxqQMCI6VHvvKsRY_K2O_E3bixPUcuPRKVOs64-mIo2N3joDg9YN-hSVI4bBwiJ3Xg6nz4eEJdLACdGgm5zUT";
const privateKey = "3LlzvLO1khMPuW9QG-42FEuwr8mRcmgKxxF0SSlMbxI";
const publicKey =
  "BOagsDf_-tNHQeP5OKqqw4mgw7LycsU3FODH8sQoJFhpIu63ZHIBf2E9meq3Rn6uWnDxRUMocJ5RHi2P1re4opI";

webpush.setVapidDetails("mailto:example@yourdomain.org", publicKey, privateKey);

app.use(express.static("public"));
app.use(bodyParser.json());

let randomNumber = 0;
let actionsReceived = 0;
const push = [];

app.get("/fact", (req, res) => {
  axios
    .get("https://catfact.ninja/fact")
    .then(({ data: { fact } }) => res.json({ fact }))
    .catch(err => res.json({ fact: `Error ${randomNumber++}` }));
});

app.post("/action", (req, res) => {
  actionsReceived++;
  res.status(200).json({ action: actionsReceived });
});

app.get("/action", (req, res) => {
  res.status(200).json({ action: actionsReceived });
});

app.post("/subscribe", (req, res) => {
  push.push(req.body.data);
  res.status(200).send();
});

app.get("/send", (req, res) => {
  res.status(200).send();
  const notification = JSON.stringify({
    title: "Cat Fact!",
    body: "This is a test notification"
  });
  push.forEach(sub => {
    webpush.sendNotification(sub, notification);
  });
});

app.listen(4000);
