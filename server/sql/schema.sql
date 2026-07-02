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
