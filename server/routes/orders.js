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

    // Items: the cart must have at least one valid line to save into OrderItems.
    if (!Array.isArray(data.items) || data.items.length === 0) {
        return 'Your cart is empty.';
    }
    for (const item of data.items) {
        if (!item || !String(item.name || '').trim()) {
            return 'A cart item is missing its name.';
        }
        const price = Number(item.price);
        if (!Number.isFinite(price) || price < 0) {
            return 'A cart item has an invalid price.';
        }
        const qty = Number(item.qty);
        if (!Number.isInteger(qty) || qty < 1) {
            return 'A cart item has an invalid quantity.';
        }
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

        // 2. Transaction: the order row and all its item rows save together, or
        //    not at all. Without this, a failure midway could leave an order with
        //    missing (or no) line items — a half-saved, inconsistent record.
        const tx = new sql.Transaction(pool);
        await tx.begin();

        try {
            // 2a. Insert the order. OUTPUT returns the new OrderId, which the
            //     item rows need as their foreign key. A fresh sql.Request(tx)
            //     per query — a request's .input() params can't be reused.
            const orderRes = await new sql.Request(tx)
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

            const orderId = orderRes.recordset[0].OrderId;

            // 2b. Insert each cart line, linked to the new order.
            for (const item of data.items) {
                await new sql.Request(tx)
                    .input('OrderId', sql.Int, orderId)
                    .input('ProductId', sql.NVarChar(100), String(item.id || item.name))
                    .input('ProductName', sql.NVarChar(255), item.name)
                    .input('UnitPrice', sql.Decimal(10, 2), Number(item.price))
                    .input('Qty', sql.Int, Number(item.qty))
                    .query(`
                        INSERT INTO dbo.OrderItems
                            (OrderId, ProductId, ProductName, UnitPrice, Qty)
                        VALUES
                            (@OrderId, @ProductId, @ProductName, @UnitPrice, @Qty)
                    `);
            }

            // 2c. All inserts succeeded — commit makes them permanent.
            await tx.commit();
            res.status(201).json({ message: 'Order saved.', orderId });
        } catch (innerErr) {
            // Any failure inside the transaction: undo everything, then let the
            // outer catch format the response.
            await tx.rollback();
            throw innerErr;
        }
    } catch (err) {
        // Return err.message so the DB constraint name (CHK_EMAIL, etc.)
        // reaches cart.js, which maps it to a friendly message.
        console.error('POST /api/orders failed:', err);
        res.status(400).json({ error: err.message });
    }
});

// GET /api/orders — list every order, newest first.
// CCNumber and CVV are intentionally NOT selected: a listing endpoint should
// never hand back full card data. (Step 5 will add GET /:id with line items.)
router.get('/', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT OrderId, FullName, Email, PhoneNumber, City, Address,
                   PostalCode, ExpirationDate, CreatedAt
            FROM dbo.Orders
            ORDER BY CreatedAt DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        // A read failure is a server-side problem, so 500 (not 400).
        console.error('GET /api/orders failed:', err);
        res.status(500).json({ error: 'Could not fetch orders.' });
    }
});

// GET /api/orders/:id — one order plus its line items.
router.get('/:id', async (req, res) => {
    // The route param arrives as a string; only a positive integer is a real id.
    const orderId = Number(req.params.id);
    if (!Number.isInteger(orderId) || orderId < 1) {
        return res.status(400).json({ error: 'Invalid order id.' });
    }

    try {
        const pool = await getConnection();

        // 1. The order itself (card fields excluded, same as the list route).
        const orderRes = await pool.request()
            .input('OrderId', sql.Int, orderId)
            .query(`
                SELECT OrderId, FullName, Email, PhoneNumber, City, Address,
                       PostalCode, ExpirationDate, CreatedAt
                FROM dbo.Orders
                WHERE OrderId = @OrderId
            `);

        // No row means the id doesn't exist -> 404, not an empty 200.
        if (orderRes.recordset.length === 0) {
            return res.status(404).json({ error: 'Order not found.' });
        }
        const order = orderRes.recordset[0];

        // 2. Its line items (the "many" side), fetched separately.
        const itemsRes = await pool.request()
            .input('OrderId', sql.Int, orderId)
            .query(`
                SELECT OrderItemId, ProductId, ProductName, UnitPrice, Qty
                FROM dbo.OrderItems
                WHERE OrderId = @OrderId
            `);

        // 3. Stitch them into one object for the caller.
        res.json({ ...order, items: itemsRes.recordset });
    } catch (err) {
        console.error(`GET /api/orders/${orderId} failed:`, err);
        res.status(500).json({ error: 'Could not fetch the order.' });
    }
});

// PUT /api/orders/:id — full replace of one order (fields + line items),
// all inside a transaction so the order and its items stay consistent.
router.put('/:id', async (req, res) => {
    const orderId = Number(req.params.id);
    if (!Number.isInteger(orderId) || orderId < 1) {
        return res.status(400).json({ error: 'Invalid order id.' });
    }

    // Same body shape as POST, so the same validator applies.
    const data = req.body;
    const error = validateOrder(data);
    if (error) return res.status(400).json({ error });

    const ccNumber = String(data.ccNumber).replace(/\s+/g, '');

    try {
        const pool = await getConnection();
        const tx = new sql.Transaction(pool);
        await tx.begin();

        try {
            // 1. Update the order row. CreatedAt is left untouched (it records
            //    when the order was first placed, not last edited).
            const updateRes = await new sql.Request(tx)
                .input('OrderId', sql.Int, orderId)
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
                    UPDATE dbo.Orders SET
                        FullName = @FullName, Email = @Email,
                        PhoneNumber = @PhoneNumber, City = @City,
                        Address = @Address, PostalCode = @PostalCode,
                        CCNumber = @CCNumber, ExpirationDate = @ExpirationDate,
                        CVV = @CVV
                    WHERE OrderId = @OrderId
                `);

            // No row updated => that id doesn't exist. Undo and 404.
            if (updateRes.rowsAffected[0] === 0) {
                await tx.rollback();
                return res.status(404).json({ error: 'Order not found.' });
            }

            // 2. Replace the line items wholesale: delete the old set, insert the
            //    new one. Simpler and less error-prone than diffing each row.
            await new sql.Request(tx)
                .input('OrderId', sql.Int, orderId)
                .query(`DELETE FROM dbo.OrderItems WHERE OrderId = @OrderId`);

            for (const item of data.items) {
                await new sql.Request(tx)
                    .input('OrderId', sql.Int, orderId)
                    .input('ProductId', sql.NVarChar(100), String(item.id || item.name))
                    .input('ProductName', sql.NVarChar(255), item.name)
                    .input('UnitPrice', sql.Decimal(10, 2), Number(item.price))
                    .input('Qty', sql.Int, Number(item.qty))
                    .query(`
                        INSERT INTO dbo.OrderItems
                            (OrderId, ProductId, ProductName, UnitPrice, Qty)
                        VALUES
                            (@OrderId, @ProductId, @ProductName, @UnitPrice, @Qty)
                    `);
            }

            await tx.commit();
            res.json({ message: 'Order updated.', orderId });
        } catch (innerErr) {
            await tx.rollback();
            throw innerErr;
        }
    } catch (err) {
        // err.message carries the DB constraint name (CHK_EMAIL, etc.).
        console.error(`PUT /api/orders/${orderId} failed:`, err);
        res.status(400).json({ error: err.message });
    }
});

// DELETE /api/orders/:id — remove one order. Its OrderItems are deleted
// automatically by the FK's ON DELETE CASCADE, so no separate cleanup here.
router.delete('/:id', async (req, res) => {
    const orderId = Number(req.params.id);
    if (!Number.isInteger(orderId) || orderId < 1) {
        return res.status(400).json({ error: 'Invalid order id.' });
    }

    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('OrderId', sql.Int, orderId)
            .query(`DELETE FROM dbo.Orders WHERE OrderId = @OrderId`);

        // Nothing deleted => the id wasn't there.
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Order not found.' });
        }
        res.json({ message: 'Order deleted.', orderId });
    } catch (err) {
        console.error(`DELETE /api/orders/${orderId} failed:`, err);
        res.status(500).json({ error: 'Could not delete the order.' });
    }
});

module.exports = router;
