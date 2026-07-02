// Central app + database configuration.
// Keeping these in one file means no machine name, DB name, or port
// is scattered (and hardcoded) across the codebase.

const config = {
    // Port the Express server listens on. Frontend calls http://localhost:5000.
    port: 5000,

    // SQL Server connection string (Windows auth — no username/password).
    // - localhost\SQLEXPRESS  : portable; resolves to this machine's Express instance.
    // - Trusted_Connection=yes: use the logged-in Windows account.
    // - ODBC Driver 17        : installed locally; avoids Driver 18 TLS-cert prompts.
    connectionString:
        'Driver={ODBC Driver 17 for SQL Server};' +
        'Server=localhost\\SQLEXPRESS;' +
        'Database=WickedWax;' +
        'Trusted_Connection=yes;',
};

module.exports = config;
