// server/index.js — backend entry point.
// Boots an Express web server and listens for HTTP requests.

const express = require("express");
const path = require("path");
const orders = require("./orders_functions.js");
const contact = require("./contact_functions.js");

const app = express();

// Parse JSON request bodies into req.body (routes need this).
app.use(express.json());

// The server folder itself sits inside the site root — never serve it
// (db.config.js in there holds the DB password).
app.use("/server", (req, res) => res.status(403).end());

// Serve the site (HTML/CSS/JS/images) straight from Express: one origin for
// pages and API, so no CORS is needed. "/" serves index.html automatically.
app.use(express.static(path.join(__dirname, "..")));

// Routes: one line per client request type, each pointing at its handler
// function (lecture-7 pattern).
app.post("/api/orders", orders.createOrder);
app.get("/api/orders", orders.getAllOrders);
app.get("/api/orders/:id", orders.getOrderById);
app.put("/api/orders/:id", orders.updateOrder);
app.delete("/api/orders/:id", orders.deleteOrder);
app.post("/api/contact", contact.createMessage);

// Port the server listens on. Frontend calls http://localhost:5000.
const port = 5000;

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
