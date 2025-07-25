const express = require("express");
require("dotenv/config.js");
require("./cronJob");
require("./src/startup/db");
const { setWebhook } = require("./bot");
const app = express();
app.use(express.json());

app.get("/", (req, res) => res.sendStatus(200));
setWebhook(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log("Server is listening on:", PORT));
