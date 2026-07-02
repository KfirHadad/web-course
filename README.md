# Wicked Wax — Web Course Project

A DIY candle e-commerce site. The frontend is a static site; **Part 3** adds an
Express + SQL Server backend (in `server/`) that persists checkout orders and
contact messages.

**Live site:** https://kfirhadad.github.io/web-course

## Project layout

| Path | What it is |
|------|------------|
| `index.html`, `style.css`, `app.js` | home page |
| `about/ build/ cart/ contact/ products/` | per-page HTML/CSS/JS |
| `Assets/` | images and media |
| `server/` | **Part 3 backend** — Express + SQL Server (msnodesqlv8) |
| `docs/` | progress notes + specification |

## Running the backend

The backend needs **SQL Server Express** running locally with a `WickedWax`
database. `node_modules/` is **not** committed — install it first.

```bash
cd server
npm install      # recreates dependencies (incl. the native msnodesqlv8 build)
npm start        # starts the API on http://localhost:5000
```

### Prerequisites
- **SQL Server Express** — instance `localhost\SQLEXPRESS`.
- A database named **`WickedWax`** (`CREATE DATABASE WickedWax;`).
- **ODBC Driver 17 for SQL Server** (ships with SSMS).
- Your Windows account needs a login + user in `WickedWax` (Windows auth; no password).

Connection settings live in `server/config.js`.
