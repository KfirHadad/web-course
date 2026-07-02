// server/routes/orders.js
// All /api/orders endpoints live here (mounted in index.js).
// Step 3: POST /api/orders — validate the checkout payload, then
// INSERT one row into dbo.Orders. Line items come later (Step 4).

const express = require('express');
const { sql, getConnection } = require('../db');

const router = express.Router();

// --- Server-side validation ------------------------------------------------
// Mirrors the client rules in cart.js so the server never trusts the browser.
// Returns an error string, or null when the payload is valid.
function validateOrder(data) {
    if (!data) return 'Missing request body.';

    const required = ['fullName', 'email', 'phoneNumber', 'city',
                      'address', 'postalCode', 'ccNumber', 'expirationDate', 'cvv'];
    for (const field of required) {
        if (!data[field] || !String(data[field]).trim()) {
            return 'Please complete all required fields.';
        }
    }

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) {
        return 'Please enter a valid email address.';
    }

    // Phone: strip + and spaces, expect 7-15 digits (country code included).
    const phoneDigits = String(data.phoneNumber).replace(/[+\s]/g, '');
    if (!/^[0-9]{7,15}$/.test(phoneDigits)) {
        return 'Please enter a valid phone number.';
    }

    if (!/^[0-9]{5,8}$/.test(String(data.postalCode))) {
        return 'Please enter a valid postal code (5-8 digits).';
    }

    // Credit card: strip spaces, expect exactly 16 digits.
    const cc = String(data.ccNumber).replace(/\s+/g, '');
    if (!/^\d{16}$/.test(cc)) {
        return 'Credit card number must be exactly 16 digits.';
    }

    // Expiration "MM/YYYY", and not in the past.
    const m = /^(\d{2})\/(\d{4})$/.exec(String(data.expirationDate));
    if (!m) return 'Card expiration date is invalid.';
    const expMonth = parseInt(m[1], 10);
    const expYear = parseInt(m[2], 10);
    if (expMonth < 1 || expMonth > 12) return 'Card expiration date is invalid.';
    const now = new Date();
    const curMonth = now.getMonth() + 1;
    const curYear = now.getFullYear();
    if (expYear < curYear || (expYear === curYear && expMonth < curMonth)) {
        return 'Card expiration date is in the past.';
    }

    if (!/^\d{3,4}$/.test(String(data.cvv))) {
        return 'CVV must be 3 or 4 digits.';
    }

    return null;
}

// POST /api/orders — create one order.
router.post('/', async (req, res) => {
    const data = req.body;

    // 1. Validate first; bail out before hitting the DB.
    const error = validateOrder(data);
    if (error) return res.status(400).json({ error });

    // Normalize the two fields the DB stores digits-only / fixed-length.
    const ccNumber = String(data.ccNumber).replace(/\s+/g, '');

    try {
        const pool = await getConnection();

        // 2. Parameterized INSERT (prevents SQL injection); OUTPUT returns the new id.
        const result = await pool.request()
            .input('FullName', sql.NVarChar(100), data.fullName)
            .input('Email', sql.NVarChar(255), data.email)
            .input('PhoneNumber', sql.VarChar(20), data.phoneNumber)
            .input('City', sql.NVarChar(100), data.city)
            .input('Address', sql.NVarChar(255), data.address)
            .input('PostalCode', sql.VarChar(20), data.postalCode)
            .input('CCNumber', sql.Char(16), ccNumber)
            .input('ExpirationDate', sql.VarChar(7), data.expirationDate)
            .input('CVV', sql.VarChar(4), data.cvv)
            .query(`
                INSERT INTO dbo.Orders
                    (FullName, Email, PhoneNumber, City, Address,
                     PostalCode, CCNumber, ExpirationDate, CVV)
                OUTPUT INSERTED.OrderId
                VALUES
                    (@FullName, @Email, @PhoneNumber, @City, @Address,
                     @PostalCode, @CCNumber, @ExpirationDate, @CVV)
            `);

        const orderId = result.recordset[0].OrderId;
        res.status(201).json({ message: 'Order saved.', orderId });
    } catch (err) {
        // Return err.message so the DB constraint name (CHK_EMAIL, etc.)
        // reaches cart.js, which maps it to a friendly message.
        console.error('POST /api/orders failed:', err);
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
