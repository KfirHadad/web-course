// Single database module. Owns the one MySQL connection for the whole app.
// Routes require this module instead of building their own connection —
// keeps credentials in one place (db.config.js) and reuses one connection.

const mysql = require("mysql2");
const dbConfig = require("./db.config.js");

// Create a connection to the database
const connection = mysql.createConnection({
    host: dbConfig.HOST,
    user: dbConfig.USER,
    password: dbConfig.PASSWORD,
    database: dbConfig.DB,
});

// Open the MySQL connection
connection.connect((error) => {
    if (error) throw error;
    console.log("Successfully connected to the database.");
});

module.exports = connection;
