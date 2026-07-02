// server/index.js — backend entry point.
// Boots an Express web server and listens for HTTP requests.

const express = require("express");
const config = require("./config");
const ordersRouter = require("./routes/orders");

const app = express();

// Parse JSON request bodies into req.body (routes need this).
app.use(express.json());

// A single test route so we can confirm the server is alive.
app.get("/", (req, res) => {
  res.send("Wicked Wax server is running.");
});

// Feature routes. Each router owns one resource under /api.
app.use("/api/orders", ordersRouter);

app.listen(config.port, () => {
  console.log(`Server listening on http://localhost:${config.port}`);
});
