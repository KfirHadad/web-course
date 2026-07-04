/* ============================================================
   Wicked Wax — Database schema (MySQL)
   Run (PowerShell):
     Get-Content server\sql\schema.sql -Raw |
       & "C:\Program Files\MySQL\MySQL Server 9.7\bin\mysql.exe" -u root -p
   Re-runnable: drops and recreates all tables (dev data resets).
   ============================================================ */

-- 1. Create the database only if it doesn't exist yet.
CREATE DATABASE IF NOT EXISTS WickedWax;
USE WickedWax;

-- 2. Start clean so this script can be re-run while the schema evolves.
--    Drop the child (OrderItems) BEFORE the parent (Orders): the foreign key
--    forbids dropping a table another table still references.
DROP TABLE IF EXISTS OrderItems;
DROP TABLE IF EXISTS Orders;
DROP TABLE IF EXISTS ContactMessages;

-- 3. Orders: one row per completed checkout.
--    Columns mirror the checkout form's payload (cart.js reservationData).
CREATE TABLE Orders (
    OrderId        INT          NOT NULL AUTO_INCREMENT,  -- surrogate PK
    FullName       VARCHAR(100) NOT NULL,
    Email          VARCHAR(255) NOT NULL,
    PhoneNumber    VARCHAR(20)  NOT NULL,                 -- country code + digits, e.g. +972501234567
    City           VARCHAR(100) NOT NULL,
    Address        VARCHAR(255) NOT NULL,
    PostalCode     VARCHAR(20)  NOT NULL,
    CCNumber       CHAR(16)     NOT NULL,                 -- exactly 16 digits
    ExpirationDate VARCHAR(7)   NOT NULL,                 -- "MM/YYYY"
    CVV            VARCHAR(4)   NOT NULL,                 -- 3-4 digits
    CreatedAt      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (OrderId),

    -- Second validation layer. Names are read by cart.js to show friendly errors.
    -- Email: something before @, something between @ and ., something after the dot.
    CONSTRAINT CHK_EMAIL    CHECK (Email LIKE '%_@_%._%'),
    -- Credit card: exactly 16 digits, nothing else.
    CONSTRAINT CHK_CCNUMBER CHECK (CCNumber REGEXP '^[0-9]{16}$'),
    -- Phone: at least 7 chars, only digits / + / spaces allowed.
    CONSTRAINT CHK_PHONE    CHECK (CHAR_LENGTH(PhoneNumber) >= 7 AND PhoneNumber REGEXP '^[0-9+ ]+$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. OrderItems: the cart's line items, one row per product in an order.
--    This is the "many" side of a one-to-many with Orders (one order -> many items).
CREATE TABLE OrderItems (
    OrderItemId INT           NOT NULL AUTO_INCREMENT,  -- surrogate PK
    OrderId     INT           NOT NULL,                 -- which order this line belongs to
    ProductId   VARCHAR(100)  NOT NULL,                 -- slug ('soy-wax'), 'bundle-<ts>', or name fallback
    ProductName VARCHAR(255)  NOT NULL,                 -- display name (bundle names are long)
    UnitPrice   DECIMAL(10,2) NOT NULL,                 -- price per unit at time of purchase
    Qty         INT           NOT NULL,                 -- how many of this product

    PRIMARY KEY (OrderItemId),

    -- Link each item to its order. ON DELETE CASCADE: deleting an order
    -- automatically removes its items (no orphan rows left behind).
    CONSTRAINT FK_OrderItems_Orders FOREIGN KEY (OrderId)
        REFERENCES Orders(OrderId) ON DELETE CASCADE,

    -- Can't order zero or a negative quantity.
    CONSTRAINT CHK_QTY CHECK (Qty > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. ContactMessages: one row per submitted "Contact Us" message.
--    Standalone table — no foreign key to Orders. Columns mirror the
--    contact form's fields (contact.js: name / email / subject / message).
CREATE TABLE ContactMessages (
    MessageId INT           NOT NULL AUTO_INCREMENT,  -- surrogate PK
    Name      VARCHAR(100)  NOT NULL,
    Email     VARCHAR(255)  NOT NULL,
    Subject   VARCHAR(200)  NOT NULL,
    Message   VARCHAR(2000) NOT NULL,                 -- free text from the textarea
    CreatedAt DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (MessageId),

    -- Second validation layer (mirrors contact.js). Check-constraint names must
    -- be unique across the whole database, so CHK_CONTACT_EMAIL, not CHK_EMAIL.
    CONSTRAINT CHK_CONTACT_EMAIL CHECK (Email LIKE '%_@_%._%'),

    -- Mirror contact.js: reject messages shorter than 10 characters, so the DB
    -- can't hold a too-short message even if a request bypasses the client.
    CONSTRAINT CHK_MESSAGE_LEN CHECK (CHAR_LENGTH(Message) >= 10)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
