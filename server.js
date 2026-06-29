const express = require('express');
const cors = require('cors');
const sql = require('mssql/msnodesqlv8'); 

const app = express();

// הגדרות CORS המאפשרות תקשורת גם מסביבת הפיתוח וגם מהאתר בגיטהאב
app.use(cors({ 
    origin: [
        'https://kfirhadad.github.io', 
        'http://127.0.0.1:5501', 
        'http://localhost:5501'
    ] 
}));

// מאפשר לשרת לקרוא נתונים שנשלחים בפורמט JSON
app.use(express.json()); 

// מחרוזת התחברות ישירה המונעת תקלות זיהוי דרייבר
const connectionString = "Driver={ODBC Driver 17 for SQL Server};Server=DESKTOP-8NPDUDDF\\SQLEXPRESS;Database=Reservations;Trusted_Connection=yes;";

// נתיב קבלת נתוני הזמנה מהאתר ושמירתם במסד הנתונים
app.post('/api/reservations', async (req, res) => {
    try {
        // יצירת חיבור למסד הנתונים
        const pool = await sql.connect(connectionString);
        
        // חילוץ הנתונים שהגיעו מהאתר
        const data = req.body;

        // הרצת שאילתת ההכנסה באמצעות פרמטרים למניעת פרצות אבטחה
        await pool.request()
            .input('FullName', sql.NVarChar(100), data.fullName)
            .input('Email', sql.NVarChar(255), data.email)
            .input('PhoneNumber', sql.VarChar(20), data.phoneNumber)
            .input('City', sql.NVarChar(100), data.city)
            .input('Address', sql.NVarChar(255), data.address)
            .input('PostalCode', sql.VarChar(20), data.postalCode)
            .input('CCNumber', sql.Char(16), data.ccNumber)
            .input('ExpirationDate', sql.VarChar(5), data.expirationDate)
            .input('CVV', sql.VarChar(4), data.cvv)
            .query(`
                INSERT INTO ReservationDetails 
                (FullName, Email, PhoneNumber, City, Address, PostalCode, CCNumber, ExpirationDate, CVV)
                VALUES (@FullName, @Email, @PhoneNumber, @City, @Address, @PostalCode, @CCNumber, @ExpirationDate, @CVV)
            `);

        // החזרת תשובת הצלחה לאתר
        res.status(201).json({ message: 'ההזמנה נשמרה בהצלחה!' });
        
    } catch (err) {
        // הדפסת השגיאה לקונסול השרת (עבורנו) והחזרתה לאתר (עבור המשתמש)
        console.error("Database error:", err);
        res.status(400).json({ error: err.message });
    }
});

// הפעלת השרת
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
