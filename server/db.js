// Single database module. Owns the connection pool for the whole app.
// Routes call getConnection() instead of building their own connection —
// keeps config in one place and reuses one pool (opening a connection
// per request is slow).

const sql = require('mssql/msnodesqlv8');
const config = require('./config');

let pool; // cached connection pool (created once, reused after)

async function getConnection() {
    // Reuse the existing pool if it's already connected.
    if (pool && pool.connected) return pool;
    // Wrap in { connectionString } so mssql passes our exact ODBC string
    // (Driver=..., Trusted_Connection=...) straight to msnodesqlv8 untouched.
    // A bare string would be re-parsed by mssql and lose those keys.
    pool = await sql.connect({ connectionString: config.connectionString });
    return pool;
}

// Export sql too, so routes can use its types (sql.NVarChar, etc.)
// for parameterized queries.
module.exports = { sql, getConnection };
