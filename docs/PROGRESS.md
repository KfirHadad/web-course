# Wicked Wax — Progress

**Project:** Part 3 — Express + SQL Server backend
**Path:** C:\Users\Omer Grinwald\Downloads\Wicked_Wax\web-course
**Backend:** `server\`
**Full plan:** C:\Users\Omer Grinwald\.claude\plans\yes-i-do-all-goofy-rabin.md

## Done
- Moved project off Google Drive to local disk (Drive corrupted npm installs). `.git` intact.
- `server/index.js`: minimal Express server on port 3000. Verified — "Wicked Wax server is running."
- Installed deps: `express`, `mssql`.
- Read all 3 course-instruction PDFs (parts A/B/C) + mapped the built frontend.
- Wrote the Part-3 implementation plan (see link above).

## Decisions (locked)
- **Scope:** expand backend for the rubric (routing 30% / DB+SQL 30% / validation 15% / structure 10%).
- **Driver/auth:** `mssql/msnodesqlv8` + Windows auth (Trusted_Connection). Matches teammate; no password.
- **Ownership:** Omer builds the whole Part-3 backend.
- **Port:** keep **5000** (frontend already calls http://localhost:5000).
- Teammate DB details NOT needed — each dev runs a LOCAL DB (`localhost\SQLEXPRESS`, database `WickedWax`).
- **CORS:** open `app.use(cors())` for local dev (not a course requirement; needed only because the site and API are different origins).
- **Run the site with `web-course` as the Live Server root** (open that folder, not the parent) — the site home is `web-course/index.html`.

## Step 1 — DONE (DB connection proven)
- `SQLEXPRESS` running; ODBC Driver 17 & 18 present (64-bit). msnodesqlv8 built (`sqlserver.node`).
- Added `server/config.js` (port 5000 + ODBC connection string) and `server/db.js` (cached pool + `getConnection()`).
- Temp `GET /api/health` returns `{"db":"connected","result":{"ok":1}}`. **Remove `/api/health` before final.**

### Gotchas hit (don't relearn)
- **Driver 17, not 18** in the connection string — Driver 18 forces TLS + rejects the self-signed local cert.
- **Pass `{ connectionString: "..." }`** to `sql.connect`, NOT a bare string — mssql re-parses a bare string and drops `Driver=`/`Trusted_Connection=` → ODBC IM002.
- **SSMS cert error:** Connect dialog → Options → Encryption `Optional` (or tick Trust server certificate).
- **sqlcmd cert error:** add `-C` (trust server cert).
- **Not sysadmin on Express install:** recovered via single-user mode (`net start 'MSSQL$SQLEXPRESS' /mSQLCMD` → `ALTER SERVER ROLE sysadmin ADD MEMBER`).
- **Node runs as `guylap15\omer grinwald` (standard user); SSMS runs elevated as an admin acct.** Different SQL logins. Granted the standard user a `WickedWax` user + `db_owner`. Any dev on a new machine must do the same for THEIR account.

## Step 2 — DONE (Orders schema)
- `server/sql/schema.sql`: guarded `CREATE DATABASE`, re-runnable `DROP/CREATE dbo.Orders`.
- Columns mirror checkout payload. `ExpirationDate VARCHAR(7)` ("MM/YYYY") — teammate's `VARCHAR(5)` would truncate.
- Named CHECK constraints `CHK_EMAIL / CHK_CCNUMBER / CHK_PHONE` (cart.js maps names → friendly errors).
- Ran via SSMS; verified table + all 3 constraints via a Node query.

## Step 3 — DONE (POST /api/orders)
- `server/routes/orders.js`: Express Router. `validateOrder()` (mirrors cart.js rules) → 400 before DB; parameterized INSERT; returns `{orderId}` via `OUTPUT INSERTED.OrderId`. Passes `err.message` through so cart.js can read constraint names.
- `index.js`: added `express.json()` + mounted `/api/orders`. Kept temp `/api/health` (remove before final).
- Tested via Invoke-RestMethod: valid → 201 `{orderId:1}`; bad email → 400 friendly msg. (Test row OrderId 1 left in Orders.)
- `cors` NOT installed yet — needed for browser wiring (Step 4).

## Step 4 — DONE (verified end-to-end from the site)
Plan file: `C:\Users\Omer Grinwald\.claude\plans\wicked-wax-part-nested-sky.md`
- `server/sql/schema.sql`: added `OrderItems` (`OrderItemId PK`, `OrderId FK→Orders ON DELETE CASCADE`, `ProductId NVARCHAR(100)`, `ProductName NVARCHAR(255)`, `UnitPrice DECIMAL(10,2)`, `Qty INT CHK_QTY>0`). Drop order flipped: drop child `OrderItems` BEFORE parent `Orders` so the script re-runs.
- `server/routes/orders.js`: `POST /api/orders` is now a **transaction** — Orders row + all OrderItems commit together or roll back. `validateOrder()` also validates the `items` array (non-empty; each item name/price/qty) → 400 before DB.
- `server/index.js`: `cors` installed + `app.use(cors())` above routes (open, for dev).
- `cart/cart.js`: payload now includes `items` (maps cart's `quantity`→`qty`); fetch retargeted `/api/reservations` → `/api/orders`.
- Tested via Invoke-RestMethod: valid order **with items** → 201; rows in both `Orders` and `OrderItems`.
- **Browser checkout verified (2026-07-03):** full wizard → Confirm → 201 success screen. SSMS confirms 3 `Orders` rows with matching `OrderItems` (order 1 → 2 items, orders 2 & 3 → 1 bundle line each); every `OrderItems.OrderId` maps to a real parent — atomic write + FK integrity proven.

### Gotchas hit (Step 4)
- **mssql transaction:** use a **fresh `new sql.Request(tx)` per query** — a request's `.input()` params can't be reused.
- **PowerShell test:** `ConvertTo-Json` defaults to `-Depth 2`, which mangles the nested `items` objects → use `-Depth 5`.
- **CORS is not a course topic:** absent from all 13 lecture PDFs and the Part-C spec. It's needed only because the static site (Live Server origin) and the API (`:5000`) are different origins. Kept open `cors()`; could tighten to an allowlist later.
- **Live Server root MUST be `web-course`** (open THAT folder, not the parent). If rooted at the parent, `/` shows a directory listing and the site home is missed. `cart.html` "Return to Homepage" uses `href="/"` — correct only when `web-course` is the root (also matches GitHub Pages). All other asset paths are relative and fine.
- **Frontend nits — FIXED (2026-07-03):**
  - `build/build.js`: all 53 image paths were relative (`Assets/…`) so the browser resolved them under `/build/` → 404. Changed to root-absolute `/Assets/…` (robust from any page depth, since `web-course` is the served root). All images load.
  - `index.html`: removed the stray `<script src="products.js">` (wrong path AND unused — products.js is products-page-only, guarded by `grid ?`/`?.` so it silently no-op'd). Home page keeps only `app.js`.

## Step 5 — DONE (order read/update/delete routes)
All in `server/routes/orders.js`, all verified live (2026-07-04):
- `GET /api/orders` — list all, newest first (`ORDER BY CreatedAt DESC`). **CCNumber/CVV never selected** (no card data over a read).
- `GET /:id` — one order + its line items via **two queries** stitched to `{...order, items:[]}` (a JOIN would repeat order columns per item). `:id` parsed to a positive int → 400; missing → 404.
- `PUT /:id` — **full replace** (fields + items) in a transaction: UPDATE order, then delete+reinsert items. `rowsAffected[0]===0` → rollback + 404. `CreatedAt` left untouched. Reuses `validateOrder()`.
- `DELETE /:id` — single `DELETE FROM Orders`; child items removed by **FK ON DELETE CASCADE** (no app-side cleanup). Missing → 404.

### Gotchas / notes (Step 5)
- **msnodesqlv8 returns INT ids as strings** (`"OrderId":"1"`) — parse `:id` params explicitly; don't trust JS types from the driver.
- **IDENTITY never reuses numbers** — after delete+reinsert, item ids jumped (1,2 → 5, 6, 7). IDs are opaque handles, not counts.
- **Terminal:** the old PSReadLine crashes on long multi-line pastes (`SetCursorPosition` bug) and can glue lines together (`-Depth 5Invoke-RestMethod`). Claude now runs these tests directly instead of pasting.

## Step 6 — DONE (Contact form → DB, verified end-to-end 2026-07-04)
- `server/sql/schema.sql`: added standalone `ContactMessages` (**no FK to Orders**, so it can be created in isolation without dropping real orders). Columns mirror the form: `Name / Email / Subject / Message` + `MessageId PK`, `CreatedAt`. Constraint names renamed for DB-wide uniqueness: `CHK_CONTACT_EMAIL`, `CHK_MESSAGE_LEN` (`LEN(Message) >= 10`).
- Created the table live by running **only** the ContactMessages block via sqlcmd — never the whole file (its `DROP Orders` would wipe real orders 1–3).
- `server/routes/contact.js`: `POST /api/contact` — `validateMessage()` (mirrors contact.js) → 400 before DB; parameterized INSERT; `OUTPUT INSERTED.MessageId`. Single row, so **no transaction** (unlike Orders+OrderItems).
- `server/index.js`: mounted `/api/contact`.
- `contact/contact.js`: submit handler is now `async` — POSTs the 4 fields, shows the popup on 201, `showToast()` on failure (reuses the previously-dead toast fn), `form.reset()` on success.
- **Subject is optional** (HTML `<input>` has no `required`): dropped from the server's required list and stored as `''` — keeps client and server validation in agreement.
- Verified: REST tests (valid / short-message / bad-email / no-subject) + a real browser submit → row 3 (`Omer Grinwald`) landed in `ContactMessages`. Test rows cleared.

## Step 8 — DONE (final cleanup 2026-07-04)
- Deleted dead root `server.js` (teammate's reference: single `/api/reservations` route → `ReservationDetails` in a separate `Reservations` DB, hardcoded to `DESKTOP-8NPDUDDF`). Superseded by `server/routes/orders.js`; nothing calls `/api/reservations` (cart.js was retargeted to `/api/orders` in Step 4). Git-tracked, so recoverable.
- Temp `/api/health`: already absent from the code — nothing to remove.

## Status
- Steps 1–6 + 8 DONE. Step 7 (Products) intentionally **skipped** (stretch/optional; rubric already met by Orders + Contact).
- Live routes: `POST / GET / GET :id / PUT / DELETE  /api/orders`, `POST /api/contact`.
- Tables: `Orders`, `OrderItems`, `ContactMessages`.

## Key facts
- Teammate's root `web-course/server.js`: **REMOVED in Step 8.** Was a working reference (1 route `/api/reservations`, table `ReservationDetails`, hardcoded machine name); fully superseded by `server/routes/orders.js`.
- Frontend forms to wire: checkout (cart.js → currently posts customer+payment only, items dropped) and contact (contact.js → currently client-only).
- Keep DB constraint names `CHK_EMAIL / CHK_CCNUMBER / CHK_PHONE` — cart.js maps them to friendly errors.
