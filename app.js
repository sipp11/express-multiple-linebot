const line = require("@line/bot-sdk");
const express = require("express");
const fs = require("fs");
const configs = JSON.parse(fs.readFileSync("data.json", "utf8"));

const app = express();

module.exports = function (obj) {
  for (let k in configs) {
    const config = configs[k];
    const client = new line.Client(config);
    app.post(`/callback-${k}`, line.middleware(config), (req, res) => {
      Promise.all(
        req.body.events.map((event) => {
          if (event.type !== "message" || event.message.type !== "text") {
            // ignore non-text-message event
            return Promise.resolve(null);
          }

          // create a echoing text message
          const echo = { type: "text", text: event.message.text };

          // use reply API
          return client.replyMessage(event.replyToken, echo);
        })
      )
        .then((result) => res.json(result))
        .catch((err) => {
          console.error(err);
          res.status(500).end();
        });
    });
  }

  app.get("/", function (req, res) {
    req.session.count = req.session.count ? req.session.count + 1 : 1;
    res.end("your count: " + req.session.count);
  });

  obj.app = app;
};
