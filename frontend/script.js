/* Employees */

function renderEmployees(list) {
  const tbody = document.getElementById("emp-tbody");
  const tbodyAdmin = document.getElementById("emp-tbody-admin");
  const tableWrap = document.getElementById("emp-table");
  if (!tbody && !tbodyAdmin) return;

  tableWrap.style.display = "block";

  // If there is no employees
  if (list.length === 0) {
    const colSpan = tbodyAdmin ? 4 : 3;
    const target = tbodyAdmin || tbody;
    target.innerHTML = `<tr class="empty-row"><td colspan="${colSpan}">No employees found.</td></tr>`;
    return;
  }

  if( tbodyAdmin ) {
    tbodyAdmin.innerHTML = list.map(e => `
    <tr>
      <td class="id-cell">${e.id}</td>
      <td>${e.name}</td>
      <td>${e.position}</td>
      <td><a href="edit.html" class="logo">Edit</a></td>
    </tr>
  `).join("");
  } else {
    tbody.innerHTML = list.map(e => `
    <tr>
      <td class="id-cell">${e.id}</td>
      <td>${e.name}</td>
      <td>${e.position}</td>
    </tr>
  `).join("");
  }
}

async function filterEmployees() {
  const name = document.getElementById("emp-name").value;
  const position = document.getElementById("emp-position").value;

  try {
    const response = await fetch(`http://localhost:3000/api/employees?name=${name}&position=${position}`);
    const data = await response.json();

    const formattedEmployees = data.map(emp => ({
      id: emp.EmployeeID, 
      name: `${emp.Fname} ${emp.Lname}`,
      position: emp.Position
    }));
    
    renderEmployees(formattedEmployees);
  } catch (error) {
    console.error("Could not fetch employees:", error);
  }
}


async function filterManager() {
  const id = document.getElementById("emp-id").value.trim().toLowerCase();
  const filterPanel = document.querySelector('.filter-panel');

  try {
    const response = await fetch('http://localhost:3000/api/managers');
    if (!response.ok) throw new Error('Failed to fetch managers');

    const managers = await response.json();
    const isManager = managers.some(manager =>
      String(manager.EmployeeID).toLowerCase() === id
    );

    if (isManager) {
      filterPanel.removeAttribute('hidden');
      filterPanel.style.display = 'block';
    } else {
      filterPanel.setAttribute('hidden', 'true');
      filterPanel.style.display = 'none';
    }
  } catch (error) {
    console.error("Could not fetch managers:", error);
    filterPanel.setAttribute('hidden', 'true');
    filterPanel.style.display = 'none';
  }
}

function resetEmp() {
  document.getElementById("emp-name").value = "";
  document.getElementById("emp-position").value = "";
  const tableWrap = document.getElementById("emp-table");
  if (tableWrap) tableWrap.style.display = "none";
}

/* Books Section */

async function filterBooks() {
  // Grab values using the exact IDs from your HTML
  const title = document.getElementById("title").value;
  const author = document.getElementById("author").value;
  const isbn = document.getElementById("isbn").value;
  const genre = document.getElementById("genre").value;
  const minPrice = document.getElementById("price_min").value;
  const maxPrice = document.getElementById("price_max").value;

  try {
    // Construct the URL to match your Express backend keys
    const url = `http://localhost:3000/api/books?isbn=${isbn}&title=${title}&author=${author}&genre=${genre}&minprice=${minPrice}&maxprice=${maxPrice}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch books');
    
    const data = await response.json();

    // Mapping the DB rows to the table format
    // Ensure these keys (e.g., book.TITLE) match your MySQL column names exactly
    const formattedBooks = data.map(book => ({
      title: book.Title,
      author: book.Author,
      genre: book.Genre,
      isbn: book.ISBN,
      price: book.Price,
      stock: book.NumberInStock // Added stock since it's in your table header
    }));

    renderBooks(formattedBooks);
  } catch (error) {
    console.error("Error filtering books:", error);
  }
}

function renderBooks(list) {
  const tbody = document.getElementById("book-tbody");
  const tableWrap = document.getElementById("book-table");
  if (!tbody) return;

  tableWrap.style.display = "block";

  if (list.length === 0) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="6">No books found.</td></tr>';
    return;
  }

  tbody.innerHTML = list.map(b => `
    <tr>
      <td>${b.title}</td>
      <td>${b.author}</td>
      <td>${b.genre}</td>
      <td class="id-cell">${b.isbn}</td>
      <td>$${parseFloat(b.price).toFixed(2)}</td>
      <td>${b.stock}</td>
    </tr>
  `).join("");
}

// Rename this to match the 'onclick' in your HTML
function resetForm() {
  document.getElementById("title").value = "";
  document.getElementById("author").value = "";
  document.getElementById("isbn").value = "";
  document.getElementById("genre").value = "";
  document.getElementById("price_min").value = "";
  document.getElementById("price_max").value = "";
  const tableWrap = document.getElementById("book-table");
  if (tableWrap) tableWrap.style.display = "none";
}

/* Transactions */

function statusBadge(s) {
  const cls = s === "Completed" ? "badge-completed"
            : s === "Pending"   ? "badge-pending"
            :                     "badge-refunded";
  return `<span class="badge ${cls}">${s}</span>`;
}

function renderTxns(list) {
  const tbody = document.getElementById("txn-tbody");
  const tbodyAdmin = document.getElementById("txn-tbody-admin");
  const tableWrap = document.getElementById("txn-table");
  if (!tbody && !tbodyAdmin) return;

  tableWrap.style.display = "block";

  if (list.length === 0) {
    const target = tbodyAdmin || tbody;
    const colSpan = tbodyAdmin ? 6 : 5;
    target.innerHTML = `<tr class="empty-row"><td colspan="${colSpan}">No transactions found.</td></tr>`;
    updateStats(list);
    return;
  }

  if( tbodyAdmin ) {
    tbodyAdmin.innerHTML = list.map(t => `
    <tr>
      <td class="id-cell">${t.id}</td>
      <td>${t.date}</td>
      <td>${t.customer}</td>
      <td>${t.employee}</td>
      <td>$${t.total}</td>
      <td><button>Edit</button></td>
    </tr>
  `).join("");
  } else {
    tbody.innerHTML = list.map(t => `
      <tr>
        <td class="id-cell">${t.id}</td>
        <td>${t.date}</td>
        <td>${t.customer}</td>
        <td>${t.employee}</td>
        <td>$${t.total}</td>
      </tr>
    `).join("");
  }

  updateStats(list);
}

function updateStats(list) {
  if (!document.getElementById("stat-total")) return;

  document.getElementById("stat-total").textContent = list.length;

  const revenue = list
    // .filter(t => t.status !== "Refunded") // Removed since 'status' isn't in your mapped data anymore
    .reduce((s, t) => s + parseFloat(t.total || 0), 0); // Convert string to number

  document.getElementById("stat-rev").textContent = "$" + revenue.toFixed(2);
}

async function filterTransactions() {
  const tID = document.getElementById("txn-id").value;
  const cust = document.getElementById("cust-name").value;
  const emp = document.getElementById("emp-filter").value;
  const fromDate = document.getElementById("date-from").value;
  const toDate = document.getElementById("date-to").value;
  
  try {
    const url = `http://localhost:3000/api/transactions?tID=${tID}&cName=${cust}&eName=${emp}&fromDate=${fromDate}&toDate=${toDate}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch transactions');
    
    const data = await response.json();

    const formattedTxns = data.map(txn => ({
      id: txn.TransactionID,
      date: txn.Date,
      customer: txn.CustomerFname + " " + txn.CustomerLname,
      employee: txn.EmployeeFname + " " + txn.EmployeeLname,
      total: txn.TotalPrice,
    }));

    renderTxns(formattedTxns);
  } catch (error) {
    console.error("Error filtering transactions:", error);
  }
}

function setInsertTransactionMessage(message, isError = false) {
  const messageEl = document.getElementById("insert-txn-message");
  if (!messageEl) return;

  messageEl.textContent = message;
  messageEl.style.color = isError ? "#b00020" : "#1f7a1f";
}

function getInsertTransactionPayload() {
  const transactionId = document.getElementById("insert-txn-id").value.trim();
  const date = document.getElementById("insert-txn-date").value.trim();
  const totalPrice = document.getElementById("insert-txn-total").value.trim();
  const cardNumber = document.getElementById("insert-txn-card").value.trim();
  const assistingEmployee = document.getElementById("insert-txn-employee").value.trim();
  const customerId = document.getElementById("insert-txn-customer").value.trim();

  if (!/^\d+$/.test(transactionId)) {
    throw new Error("Transaction ID must be an integer.");
  }

  if (!date) {
    throw new Error("Date is required.");
  }

  if (!/^\d+(\.\d{1,2})?$/.test(totalPrice)) {
    throw new Error("Total Price must be a valid decimal amount with up to 2 decimal places.");
  }

  if (!cardNumber || cardNumber.length > 16) {
    throw new Error("Card Number is required and must be 16 characters or fewer.");
  }

  if (!/^\d+$/.test(assistingEmployee)) {
    throw new Error("Assisting Employee must be an integer employee ID.");
  }

  if (customerId && !/^\d+$/.test(customerId)) {
    throw new Error("Customer ID must be an integer when provided.");
  }

  const payload = {
    TransactionID: Number(transactionId),
    Date: date,
    TotalPrice: Number(totalPrice),
    CardNumber: cardNumber,
    AssistingEmployee: Number(assistingEmployee)
  };

  if (customerId) {
    payload.CustomerID = Number(customerId);
  }

  return payload;
}

async function insertTransaction() {
  try {
    setInsertTransactionMessage("");
    const payload = getInsertTransactionPayload();

    const response = await fetch("http://localhost:3000/api/insert-transaction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to insert transaction.");
    }

    setInsertTransactionMessage(result.message || "Transaction inserted successfully.");
    resetInsertTransaction(false);
    await filterTransactions();
  } catch (error) {
    console.error("Error inserting transaction:", error);
    setInsertTransactionMessage(error.message, true);
  }
}

function resetInsertTransaction(clearMessage = true) {
  const fields = [
    "insert-txn-id",
    "insert-txn-date",
    "insert-txn-total",
    "insert-txn-card",
    "insert-txn-employee",
    "insert-txn-customer"
  ];

  fields.forEach(id => {
    const field = document.getElementById(id);
    if (field) field.value = "";
  });

  if (clearMessage) {
    setInsertTransactionMessage("");
  }
}

function resetTxns() {
  // 1. Clear all the transaction filter inputs
  document.getElementById("txn-id").value = "";
  document.getElementById("cust-name").value = "";
  document.getElementById("emp-filter").value = "";
  document.getElementById("date-from").value = "";
  document.getElementById("date-to").value = "";
  
  // 2. Hide the transaction table
  const tableWrap = document.getElementById("txn-table");
  if (tableWrap) {
    tableWrap.style.display = "none";
  }

  // 3. Reset the stats cards to zero
  if (document.getElementById("stat-total")) document.getElementById("stat-total").textContent = "0";
  if (document.getElementById("stat-rev"))   document.getElementById("stat-rev").textContent   = "$0.00";
  
  // (Optional) Reset these if you still have them in your HTML
  if (document.getElementById("stat-comp"))  document.getElementById("stat-comp").textContent  = "0";
  if (document.getElementById("stat-pend"))  document.getElementById("stat-pend").textContent  = "0";
  if (document.getElementById("stat-ref"))   document.getElementById("stat-ref").textContent   = "0";
}
