/* ============================================================
   Wicked Wax — Database schema
   Run in SSMS or: sqlcmd -S localhost\SQLEXPRESS -E -C -i schema.sql
   Re-runnable: drops and recreates the Orders table (dev data resets).
   ============================================================ */

-- 1. Create the database only if it doesn't exist yet.
IF DB_ID('WickedWax') IS NULL
    CREATE DATABASE WickedWax;
GO

USE WickedWax;
GO

-- 2. Start clean so this script can be re-run while the schema evolves.
--    Drop the child (OrderItems) BEFORE the parent (Orders): the foreign key
--    forbids dropping a table another table still references.
IF OBJECT_ID('dbo.OrderItems', 'U') IS NOT NULL
    DROP TABLE dbo.OrderItems;
GO

IF OBJECT_ID('dbo.Orders', 'U') IS NOT NULL
    DROP TABLE dbo.Orders;
GO

-- 3. Orders: one row per completed checkout.
--    Columns mirror the checkout form's payload (cart.js reservationData).
CREATE TABLE dbo.Orders (
    OrderId        INT IDENTITY(1,1) NOT NULL,   -- surrogate PK, auto-increment
    FullName       NVARCHAR(100)     NOT NULL,
    Email          NVARCHAR(255)     NOT NULL,
    PhoneNumber    VARCHAR(20)       NOT NULL,    -- country code + digits, e.g. +972501234567
    City           NVARCHAR(100)     NOT NULL,
    Address        NVARCHAR(255)     NOT NULL,
    PostalCode     VARCHAR(20)       NOT NULL,
    CCNumber       CHAR(16)          NOT NULL,    -- exactly 16 digits
    ExpirationDate VARCHAR(7)        NOT NULL,    -- "MM/YYYY"
    CVV            VARCHAR(4)         NOT NULL,    -- 3-4 digits
    CreatedAt      DATETIME2         NOT NULL CONSTRAINT DF_Orders_CreatedAt DEFAULT SYSDATETIME(),

    CONSTRAINT PK_Orders PRIMARY KEY (OrderId),

    -- Second validation layer. Names are read by cart.js to show friendly errors.
    -- Email: something before @, something between @ and ., something after the dot.
    CONSTRAINT CHK_EMAIL    CHECK (Email LIKE '%_@_%._%'),
    -- Credit card: 16 chars, digits only (CHAR pads short values with spaces, which fail this).
    CONSTRAINT CHK_CCNUMBER CHECK (CCNumber NOT LIKE '%[^0-9]%'),
    -- Phone: at least 7 chars, only digits / + / spaces allowed.
    CONSTRAINT CHK_PHONE    CHECK (LEN(PhoneNumber) >= 7 AND PhoneNumber NOT LIKE '%[^0-9+ ]%')
);
GO

-- 4. OrderItems: the cart's line items, one row per product in an order.
--    This is the "many" side of a one-to-many with Orders (one order -> many items).
CREATE TABLE dbo.OrderItems (
    OrderItemId INT IDENTITY(1,1) NOT NULL,      -- surrogate PK, auto-increment
    OrderId     INT               NOT NULL,      -- which order this line belongs to
    ProductId   NVARCHAR(100)     NOT NULL,      -- slug ('soy-wax'), 'bundle-<ts>', or name fallback
    ProductName NVARCHAR(255)     NOT NULL,      -- display name (bundle names are long)
    UnitPrice   DECIMAL(10,2)     NOT NULL,      -- price per unit at time of purchase
    Qty         INT               NOT NULL,      -- how many of this product

    CONSTRAINT PK_OrderItems PRIMARY KEY (OrderItemId),

    -- Link each item to its order. ON DELETE CASCADE: deleting an order
    -- automatically removes its items (no orphan rows left behind).
    CONSTRAINT FK_OrderItems_Orders FOREIGN KEY (OrderId)
        REFERENCES dbo.Orders(OrderId) ON DELETE CASCADE,

    -- Can't order zero or a negative quantity.
    CONSTRAINT CHK_QTY CHECK (Qty > 0)
);
GO

-- 5. ContactMessages: one row per submitted "Contact Us" message.
--    Standalone table — no foreign key to Orders, so this block can be run on
--    its own without dropping (and losing) real order data. Columns mirror the
--    contact form's fields (contact.js: name / email / subject / message).
IF OBJECT_ID('dbo.ContactMessages', 'U') IS NOT NULL
    DROP TABLE dbo.ContactMessages;
GO

CREATE TABLE dbo.ContactMessages (
    MessageId INT IDENTITY(1,1) NOT NULL,        -- surrogate PK, auto-increment
    Name      NVARCHAR(100)     NOT NULL,
    Email     NVARCHAR(255)     NOT NULL,
    Subject   NVARCHAR(200)     NOT NULL,
    Message   NVARCHAR(2000)    NOT NULL,        -- free text from the textarea
    CreatedAt DATETIME2         NOT NULL CONSTRAINT DF_ContactMessages_CreatedAt DEFAULT SYSDATETIME(),

    CONSTRAINT PK_ContactMessages PRIMARY KEY (MessageId),

    -- Second validation layer (mirrors contact.js). Constraint names must be
    -- UNIQUE across the whole database, so this is CHK_CONTACT_EMAIL, not the
    -- CHK_EMAIL already used by dbo.Orders.
    CONSTRAINT CHK_CONTACT_EMAIL CHECK (Email LIKE '%_@_%._%'),

    -- Mirror contact.js: reject messages shorter than 10 characters, so the DB
    -- can't hold a too-short message even if a request bypasses the client.
    CONSTRAINT CHK_MESSAGE_LEN CHECK (LEN(Message) >= 10)
);
GO
