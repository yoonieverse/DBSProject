require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors'); // Run: npm install cors
const app = express();

app.use(cors()); // Allows your HTML file to talk to this server
app.use(express.json());

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASSWORD,
  database: 'Bookstore'
};

// This creates an API endpoint: http://localhost:3000/api/employees
app.get('/api/employees', async (req, res) => {
  const { name, position } = req.query;
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      `SELECT * FROM Employee WHERE (Fname LIKE ? OR Lname LIKE ?) AND (Position = ? OR ? = '');`, 
      [`%${name}%`, `%${name}%`, position, position]
    );

    await connection.end();
    res.json(rows); // Send the data back to the browser
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/books', async (req, res) => {
  const isbn = req.query.isbn || '';
  const title = req.query.title || '';
  const author = req.query.author || '';
  const genre = req.query.genre || '';
  const minprice = parseFloat(req.query.minprice) || 0;
  const maxprice = parseFloat(req.query.maxprice) || 999999;

  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // This query uses (Column LIKE ? OR ? = '') which is safer for NULLs 
    // and correctly ignores empty search fields.
    const query = `
      SELECT * FROM Books
      WHERE (ISBN LIKE ? OR ? = '')
      AND (TITLE LIKE ? OR ? = '')
      AND (AUTHOR LIKE ? OR ? = '')
      AND (GENRE LIKE ? OR ? = '')
      AND PRICE BETWEEN ? AND ?`;

    const params = [
      `%${isbn}%`, isbn,
      `%${title}%`, title,
      `%${author}%`, author,
      `%${genre}%`, genre,
      minprice, maxprice
    ];

    const [rows] = await connection.execute(query, params);
    await connection.end();
    res.json(rows);
  } catch (error) {
    console.error("DB Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/transactions', async (req, res) => {
  const transactionId = req.query.tID || 0;
  const customerName = req.query.cName || '';
  const employeeName = req.query.eName || '';
  const fromDate = req.query.fromDate || '1900-01-01';
  const toDate = req.query.toDate || '9999-12-31';

  try {
    const connection = await mysql.createConnection(dbConfig);
    const query = `SELECT 
    T.*, 
    E.Fname AS EmployeeFname, 
    E.Lname AS EmployeeLname,
    LP.Fname AS CustomerFname,
    LP.Lname AS CustomerLname
FROM Transactions T
INNER JOIN Employee E 
    ON T.AssistingEmployee = E.EmployeeID
LEFT JOIN LoyaltyTransaction LT 
    ON T.TransactionID = LT.TransactionID
LEFT JOIN LoyaltyProgram LP 
    ON LT.CustomerID = LP.CustomerID
WHERE (T.TransactionID = ? OR ? = 0)
      AND (LP.Fname LIKE ? OR LP.Lname LIKE ? OR ? = '')
      AND (E.Fname LIKE ? OR E.Lname LIKE ? OR ? = '')
      AND (T.Date BETWEEN ? AND ?);`
    const params = [transactionId, transactionId,
    `%${customerName}%`, `%${customerName}%`, customerName,
    `%${employeeName}%`, `%${employeeName}%`, employeeName,
    fromDate, toDate];

    const [rows] = await connection.execute(query, params);
    await connection.end();
    res.json(rows);

  } catch (error) {
    console.error("DB Error:", error);
    res.status(500).json({ error: error.message });
  }


});
app.listen(3000, () => console.log('Server running on http://localhost:3000'));