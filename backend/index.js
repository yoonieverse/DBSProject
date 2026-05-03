require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors'); // Run: npm install cors
const app = express();
const path = require("path");
app.use(express.static(path.join(__dirname, "../frontend")));

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

app.post('/api/insert-transaction', async (req, res) => {
  const {
    TransactionID,
    Date: transactionDate,
    TotalPrice,
    CardNumber,
    AssistingEmployee,
    CustomerID
  } = req.body;

  const transactionId = Number.parseInt(TransactionID, 10);
  const totalPrice = Number.parseFloat(TotalPrice);
  const assistingEmployee = Number.parseInt(AssistingEmployee, 10);
  const customerId = CustomerID === undefined || CustomerID === null || CustomerID === ''
    ? null
    : Number.parseInt(CustomerID, 10);
  const cardNumber = String(CardNumber || '').trim();
  const normalizedDate = String(transactionDate || '').trim().replace('T', ' ');

  if (!/^\d+$/.test(String(TransactionID))) {
    return res.status(400).json({ error: 'TransactionID must be an integer.' });
  }

  if (!normalizedDate) {
    return res.status(400).json({ error: 'Date is required.' });
  }

  if (!/^\d+(\.\d{1,2})?$/.test(String(TotalPrice)) || !Number.isFinite(totalPrice)) {
    return res.status(400).json({ error: 'TotalPrice must be a valid decimal amount.' });
  }

  if (!cardNumber || cardNumber.length > 16) {
    return res.status(400).json({ error: 'CardNumber is required and must be 16 characters or fewer.' });
  }

  if (!/^\d+$/.test(String(AssistingEmployee))) {
    return res.status(400).json({ error: 'AssistingEmployee must be an integer.' });
  }

  if (CustomerID !== undefined && CustomerID !== null && CustomerID !== '' && !/^\d+$/.test(String(CustomerID))) {
    return res.status(400).json({ error: 'CustomerID must be an integer when provided.' });
  }

  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction();

    const query = `
      INSERT INTO Transactions
        (TransactionID, Date, TotalPrice, CardNumber, AssistingEmployee)
      VALUES (?, ?, ?, ?, ?)`;

    await connection.execute(query, [
      transactionId,
      normalizedDate,
      totalPrice,
      cardNumber,
      assistingEmployee
    ]);

    if (customerId !== null) {
      await connection.execute(
        `INSERT INTO LoyaltyTransaction (TransactionID, CustomerID) VALUES (?, ?)`,
        [transactionId, customerId]
      );
    }

    await connection.commit();
    res.status(201).json({ message: 'Transaction inserted successfully.' });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("DB Error:", error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'A transaction with that ID already exists.' });
    }

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'AssistingEmployee and CustomerID must reference existing records.' });
    }

    res.status(500).json({ error: error.message });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

app.get('/api/managers', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const query = `SELECT EmployeeID FROM Employee WHERE Position = 'Manager'`;
    const [rows] = await connection.execute(query);
    await connection.end();
    res.json(rows);
  } catch (error) {
    console.error("DB Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));