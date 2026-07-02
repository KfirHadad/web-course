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

## Next
1. `sql/schema.sql` — Orders table + CHECK constraints (`CHK_EMAIL / CHK_CCNUMBER / CHK_PHONE`). See plan.
2. Migrate teammate's `/api/reservations` logic into `server/routes/`; retire root `server.js`.

## Key facts
- Teammate's `web-course/server.js` (root): working reference — 1 route `/api/reservations`, table `ReservationDetails`, msnodesqlv8 + Windows auth, hardcoded machine name. To be migrated into `server/routes/` then retired.
- Frontend forms to wire: checkout (cart.js → currently posts customer+payment only, items dropped) and contact (contact.js → currently client-only).
- Keep DB constraint names `CHK_EMAIL / CHK_CCNUMBER / CHK_PHONE` — cart.js maps them to friendly errors.
