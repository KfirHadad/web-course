// server/index.js — backend entry point.
// Boots an Express web server and listens for HTTP requests.

const express = require("express");
const config = require("./config");
const { getConnection } = require("./db");

const app = express();

// A single test route so we can confirm the server is alive.
app.get("/", (req, res) => {
  res.send("Wicked Wax server is running.");
});

// TEMP health check: proves Node can actually reach SQL Server.
// SELECT 1 is a trivial round-trip — success means driver + Windows auth
// + the WickedWax database are all wired correctly. Remove later.
app.get("/api/health", async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query("SELECT 1 AS ok");
    res.json({ db: "connected", result: result.recordset[0] });
  } catch (err) {
    console.error("DB health check failed:", err);
    res.status(500).json({ db: "error", message: err.message });
  }
});

app.listen(config.port, () => {
  console.log(`Server listening on http://localhost:${config.port}`);
});
