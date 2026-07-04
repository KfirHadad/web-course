# Wicked Wax — Web Course Project

A DIY candle e-commerce site. The frontend is a static site; **Part 3** adds an
Express + MySQL backend (in `server/`) that persists checkout orders and
contact messages.

**Frontend showcase:** https://kfirhadad.github.io/web-course — GitHub Pages
hosts static files only (no Node/MySQL), so forms there don't submit. To use
the full site (checkout + contact), run the server locally (below) and browse
**http://localhost:5000**.

## Project layout

| Path | What it is |
|------|------------|
| `index.html`, `style.css`, `app.js` | home page |
| `about/ build/ cart/ contact/ products/` | per-page HTML/CSS/JS |
| `Assets/` | images and media |
| `server/` | **Part 3 backend** — Express + MySQL (mysql2) |
| `server/sql/schema.sql` | creates the `WickedWax` database + tables |
| `docs/` | progress notes + specification |

## Running the project

### Prerequisites
- **Node.js**
- **MySQL Server 8+** running locally (root user + password)

### Setup (first time on a machine)
1. Install dependencies:
   ```bash
   cd server
   npm install
   ```
2. Create `server/db.config.js` (gitignored — every dev keeps their own copy):
   ```js
   module.exports = {
       HOST: "localhost",
       USER: "root",
       PASSWORD: "your-mysql-root-password",
       DB: "WickedWax",
   };
   ```
3. Create the database and tables (PowerShell; enter your password when asked):
   ```powershell
   Get-Content server\sql\schema.sql -Raw |
     & "C:\Program Files\MySQL\MySQL Server 9.7\bin\mysql.exe" -u root -p
   ```
   Adjust the path to your MySQL version. Re-running the script resets the tables.

### Run
```bash
cd server
npm start
```
Express serves **both the site and the API** on http://localhost:5000 —
open that in the browser. No Live Server and no CORS needed (same origin).
