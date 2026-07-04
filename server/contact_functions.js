// server/contact_functions.js
// Handler functions for /api/contact requests (lecture-7 pattern: functions
// live here, the routes in index.js point at them).
// One row per submitted "Contact Us" message — single independent row,
// so no transaction needed.

const sql = require('./db.js');

// --- Server-side validation ------------------------------------------------
// Mirrors the client rules in contact.js so the server never trusts the browser.
// Returns an error string, or null when the payload is valid.
function validateMessage(data) {
    if (!data) return 'Missing request body.';

    // Subject is optional on the form (no `required` attribute), so it's not
    // in this list — a blank subject is allowed and stored as an empty string.
    const required = ['name', 'email', 'message'];
    for (const field of required) {
        if (!data[field] || !String(data[field]).trim()) {
            return 'Please complete all required fields.';
        }
    }

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) {
        return 'Please enter a valid email address.';
    }

    // Same 10-character floor the form enforces (and the DB's CHK_MESSAGE_LEN).
    if (String(data.message).trim().length < 10) {
        return 'Message must be at least 10 characters.';
    }

    return null;
}

// POST /api/contact — save one contact message.
const createMessage = (req, res) => {
    const data = req.body;

    // Validate first; bail out before hitting the DB.
    const error = validateMessage(data);
    if (error) return res.status(400).json({ error });

    // Keys match the table's column names: "SET ?" expands this object into
    // escaped column = value pairs (parameterized — safe from SQL injection).
    const newMessage = {
        Name: String(data.name).trim(),
        Email: String(data.email).trim(),
        Subject: String(data.subject || '').trim(),
        Message: String(data.message).trim(),
    };

    sql.query('INSERT INTO ContactMessages SET ?', newMessage, (err, result) => {
        if (err) {
            // err.message carries any DB constraint name (CHK_MESSAGE_LEN, etc.).
            console.error('POST /api/contact failed:', err);
            return res.status(400).json({ error: err.message });
        }
        // MySQL hands back the new auto-increment id on the result object.
        res.status(201).json({ message: 'Message sent.', messageId: result.insertId });
    });
};

module.exports = { createMessage };
