// server/orders_functions.js
// Handler functions for every /api/orders request (lecture-7 pattern:
// functions live here, the routes in index.js point at them).
// createOrder + updateOrder run inside a transaction: the order row and its
// line items save together, or not at all.

const sql = require('./db.js');

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

// Map the items array to rows for a bulk INSERT ... VALUES ? query
// (one array per row, columns in table order).
function itemRows(orderId, items) {
    return items.map((item) => [
        orderId,
        String(item.id || item.name),
        item.name,
        Number(item.price),
        Number(item.qty),
    ]);
}

// POST /api/orders — create one order (order row + all line items, atomically).
const createOrder = (req, res) => {
    const data = req.body;

    // 1. Validate first; bail out before hitting the DB.
    const error = validateOrder(data);
    if (error) return res.status(400).json({ error });

    // The DB stores the card number digits-only / fixed-length.
    const ccNumber = String(data.ccNumber).replace(/\s+/g, '');

    // Any failure inside the transaction: undo everything, then answer 400.
    // err.message carries the DB constraint name (CHK_EMAIL, etc.), which
    // cart.js maps to a friendly message.
    const fail = (err) => sql.rollback(() => {
        console.error('POST /api/orders failed:', err);
        res.status(400).json({ error: err.message });
    });

    // 2. Transaction: without it, a failure midway could leave an order with
    //    missing (or no) line items — a half-saved, inconsistent record.
    sql.beginTransaction((txErr) => {
        if (txErr) {
            console.error('POST /api/orders begin failed:', txErr);
            return res.status(500).json({ error: 'Could not save the order.' });
        }

        // 2a. Insert the order. result.insertId is the new OrderId, which the
        //     item rows need as their foreign key.
        sql.query(
            `INSERT INTO Orders
                (FullName, Email, PhoneNumber, City, Address,
                 PostalCode, CCNumber, ExpirationDate, CVV)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [data.fullName, data.email, data.phoneNumber, data.city, data.address,
             data.postalCode, ccNumber, data.expirationDate, data.cvv],
            (err, orderRes) => {
                if (err) return fail(err);
                const orderId = orderRes.insertId;

                // 2b. Insert every cart line in one bulk query: VALUES ?
                //     expands an array of row-arrays into (..),(..),(..).
                sql.query(
                    `INSERT INTO OrderItems
                        (OrderId, ProductId, ProductName, UnitPrice, Qty)
                     VALUES ?`,
                    [itemRows(orderId, data.items)],
                    (itemsErr) => {
                        if (itemsErr) return fail(itemsErr);

                        // 2c. All inserts succeeded — commit makes them permanent.
                        sql.commit((commitErr) => {
                            if (commitErr) return fail(commitErr);
                            res.status(201).json({ message: 'Order saved.', orderId });
                        });
                    }
                );
            }
        );
    });
};

// GET /api/orders — list every order, newest first.
// CCNumber and CVV are intentionally NOT selected: a listing endpoint should
// never hand back full card data.
const getAllOrders = (req, res) => {
    sql.query(
        `SELECT OrderId, FullName, Email, PhoneNumber, City, Address,
                PostalCode, ExpirationDate, CreatedAt
         FROM Orders
         ORDER BY CreatedAt DESC`,
        (err, rows) => {
            if (err) {
                // A read failure is a server-side problem, so 500 (not 400).
                console.error('GET /api/orders failed:', err);
                return res.status(500).json({ error: 'Could not fetch orders.' });
            }
            res.json(rows);
        }
    );
};

// GET /api/orders/:id — one order plus its line items.
const getOrderById = (req, res) => {
    // The route param arrives as a string; only a positive integer is a real id.
    const orderId = Number(req.params.id);
    if (!Number.isInteger(orderId) || orderId < 1) {
        return res.status(400).json({ error: 'Invalid order id.' });
    }

    // 1. The order itself (card fields excluded, same as the list route).
    sql.query(
        `SELECT OrderId, FullName, Email, PhoneNumber, City, Address,
                PostalCode, ExpirationDate, CreatedAt
         FROM Orders
         WHERE OrderId = ?`,
        [orderId],
        (err, orders) => {
            if (err) {
                console.error(`GET /api/orders/${orderId} failed:`, err);
                return res.status(500).json({ error: 'Could not fetch the order.' });
            }
            // No row means the id doesn't exist -> 404, not an empty 200.
            if (orders.length === 0) {
                return res.status(404).json({ error: 'Order not found.' });
            }

            // 2. Its line items (the "many" side), fetched separately.
            sql.query(
                `SELECT OrderItemId, ProductId, ProductName, UnitPrice, Qty
                 FROM OrderItems
                 WHERE OrderId = ?`,
                [orderId],
                (itemsErr, items) => {
                    if (itemsErr) {
                        console.error(`GET /api/orders/${orderId} failed:`, itemsErr);
                        return res.status(500).json({ error: 'Could not fetch the order.' });
                    }
                    // 3. Stitch them into one object for the caller.
                    res.json({ ...orders[0], items });
                }
            );
        }
    );
};

// PUT /api/orders/:id — full replace of one order (fields + line items),
// all inside a transaction so the order and its items stay consistent.
const updateOrder = (req, res) => {
    const orderId = Number(req.params.id);
    if (!Number.isInteger(orderId) || orderId < 1) {
        return res.status(400).json({ error: 'Invalid order id.' });
    }

    // Same body shape as POST, so the same validator applies.
    const data = req.body;
    const error = validateOrder(data);
    if (error) return res.status(400).json({ error });

    const ccNumber = String(data.ccNumber).replace(/\s+/g, '');

    const fail = (err) => sql.rollback(() => {
        console.error(`PUT /api/orders/${orderId} failed:`, err);
        res.status(400).json({ error: err.message });
    });

    sql.beginTransaction((txErr) => {
        if (txErr) {
            console.error(`PUT /api/orders/${orderId} begin failed:`, txErr);
            return res.status(500).json({ error: 'Could not update the order.' });
        }

        // 1. Update the order row. CreatedAt is left untouched (it records
        //    when the order was first placed, not last edited).
        sql.query(
            `UPDATE Orders SET
                FullName = ?, Email = ?, PhoneNumber = ?, City = ?,
                Address = ?, PostalCode = ?, CCNumber = ?,
                ExpirationDate = ?, CVV = ?
             WHERE OrderId = ?`,
            [data.fullName, data.email, data.phoneNumber, data.city, data.address,
             data.postalCode, ccNumber, data.expirationDate, data.cvv, orderId],
            (err, updateRes) => {
                if (err) return fail(err);

                // No row updated => that id doesn't exist. Undo and 404.
                if (updateRes.affectedRows === 0) {
                    return sql.rollback(() =>
                        res.status(404).json({ error: 'Order not found.' }));
                }

                // 2. Replace the line items wholesale: delete the old set, insert
                //    the new one. Simpler and less error-prone than diffing rows.
                sql.query(
                    `DELETE FROM OrderItems WHERE OrderId = ?`,
                    [orderId],
                    (delErr) => {
                        if (delErr) return fail(delErr);

                        sql.query(
                            `INSERT INTO OrderItems
                                (OrderId, ProductId, ProductName, UnitPrice, Qty)
                             VALUES ?`,
                            [itemRows(orderId, data.items)],
                            (insErr) => {
                                if (insErr) return fail(insErr);

                                sql.commit((commitErr) => {
                                    if (commitErr) return fail(commitErr);
                                    res.json({ message: 'Order updated.', orderId });
                                });
                            }
                        );
                    }
                );
            }
        );
    });
};

// DELETE /api/orders/:id — remove one order. Its OrderItems are deleted
// automatically by the FK's ON DELETE CASCADE, so no separate cleanup here.
const deleteOrder = (req, res) => {
    const orderId = Number(req.params.id);
    if (!Number.isInteger(orderId) || orderId < 1) {
        return res.status(400).json({ error: 'Invalid order id.' });
    }

    sql.query(
        `DELETE FROM Orders WHERE OrderId = ?`,
        [orderId],
        (err, result) => {
            if (err) {
                console.error(`DELETE /api/orders/${orderId} failed:`, err);
                return res.status(500).json({ error: 'Could not delete the order.' });
            }
            // Nothing deleted => the id wasn't there.
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Order not found.' });
            }
            res.json({ message: 'Order deleted.', orderId });
        }
    );
};

module.exports = { createOrder, getAllOrders, getOrderById, updateOrder, deleteOrder };
