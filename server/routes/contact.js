// server/routes/contact.js
// All /api/contact endpoints live here (mounted in index.js).
// Step 6: POST /api/contact — validate a "Contact Us" submission, then
// INSERT one row into dbo.ContactMessages. No line items and no transaction:
// it's a single independent row, so a plain parameterized INSERT is enough.

const express = require('express');
const { sql, getConnection } = require('../db');

const router = express.Router();

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
router.post('/', async (req, res) => {
    const data = req.body;

    // Validate first; bail out before hitting the DB.
    const error = validateMessage(data);
    if (error) return res.status(400).json({ error });

    try {
        const pool = await getConnection();

        // Parameterized inputs (never string-concatenation) keep this safe from
        // SQL injection. OUTPUT returns the new MessageId in the same round trip.
        const result = await pool.request()
            .input('Name', sql.NVarChar(100), String(data.name).trim())
            .input('Email', sql.NVarChar(255), String(data.email).trim())
            .input('Subject', sql.NVarChar(200), String(data.subject || '').trim())
            .input('Message', sql.NVarChar(2000), String(data.message).trim())
            .query(`
                INSERT INTO dbo.ContactMessages (Name, Email, Subject, Message)
                OUTPUT INSERTED.MessageId
                VALUES (@Name, @Email, @Subject, @Message)
            `);

        const messageId = result.recordset[0].MessageId;
        res.status(201).json({ message: 'Message sent.', messageId });
    } catch (err) {
        // err.message carries any DB constraint name (CHK_MESSAGE_LEN, etc.).
        console.error('POST /api/contact failed:', err);
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
