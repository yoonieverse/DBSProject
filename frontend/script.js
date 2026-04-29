

// /* Employees */
// const employees = [
//   {

//     /*Example Output*/

//     id: "E001",
//     name: "Mango Mango",
//     role: "Manager",
//     dept: "Management",
//     email: "m.Mango@dbs.com",
//     phone: "111-111-111",
//     since: "2026"
//   }
// ];

// function renderEmployees(list) {
//   const tbody = document.getElementById("emp-tbody");
//   const tbodyAdmin = document.getElementById("emp-tbody-admin");
//   const tableWrap = document.getElementById("emp-table");
//   if (!tbody && !tbodyAdmin) return;

//   tableWrap.style.display = "block";


//   // If there is no employees
//   if (list.length === 0) {
//     tbody.innerHTML = '<tr class="empty-row"><td colspan="7">No employees found.</td></tr>';
//     return;
//   }

//   if( tbodyAdmin ) {
//     tbodyAdmin.innerHTML = list.map(e => `
//     <tr>
//       <td class="id-cell">${e.id}</td>
//       <td>${e.name}</td>
//       <td>${e.role}</td>
//       <td>${e.dept}</td>
//       <td>${e.email}</td>
//       <td>${e.phone}</td>
//       <td>${e.since}</td>
// <!--      <td><button class="btn-ghost">Edit</button></td>-->
//       <td><a href="edit.html" class="logo">Edit</a></td>
//     </tr>
//   `).join("");
//   } else {
//     tbody.innerHTML = list.map(e => `
//     <tr>
//       <td class="id-cell">${e.id}</td>
//       <td>${e.name}</td>
//       <td>${e.role}</td>
//       <td>${e.dept}</td>
//       <td>${e.email}</td>
//       <td>${e.phone}</td>
//       <td>${e.since}</td>
//     </tr>
//   `).join("");
//   }
// }

// function filterEmployees() {
//   const name = document.getElementById("emp-name").value.toLowerCase();
//   const dept = document.getElementById("emp-dept").value;
//   const role = document.getElementById("emp-role").value;

//   renderEmployees(employees.filter(e =>
//     (!name || e.name.toLowerCase().includes(name)) &&
//     (!dept || e.dept === dept) &&
//     (!role || e.role === role)
//   ));
// }

// function filterManager() {
//   const id = document.getElementById("emp-id").value.trim().toLowerCase();
//   const isManager = employees.some(e =>
//       e.id.toLowerCase() === id &&
//       e.role === 'Manager')
//   if (isManager) {
//     document.querySelector('.filter-panel').removeAttribute('hidden');
//     document.querySelector('.filter-panel').style.display = 'block';
//   } else {
//     document.querySelector('.filter-panel').setAttribute('hidden', 'true');
//     document.querySelector('.filter-panel').style.display = 'none';
//   }
// }

// function resetEmp() {
//   document.getElementById("emp-name").value = "";
//   document.getElementById("emp-dept").value = "";
//   document.getElementById("emp-role").value = "";
//   const tableWrap = document.getElementById("emp-table");
//   if (tableWrap) tableWrap.style.display = "none";
// }

/* Employees */
const employees = [
  {
    id: "E001",
    name: "Mango Mango",
    position: "Manager"
  },
  {
    id: "E002",
    name: "Jane Doe",
    position: "Sales Associate"
  }
];

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
// --- OLD filterEmployees() ---
//_______________________________
// function filterEmployees() {
//   const name = document.getElementById("emp-name").value.toLowerCase();
//   const position = document.getElementById("emp-position").value;

//   renderEmployees(employees.filter(e =>
//     (!name || e.name.toLowerCase().includes(name)) &&
//     (!position || e.position === position)
//   ));
// }

function filterManager() {
  const id = document.getElementById("emp-id").value.trim().toLowerCase();
  const isManager = employees.some(e =>
      e.id.toLowerCase() === id &&
      e.position === 'Manager')
  if (isManager) {
    document.querySelector('.filter-panel').removeAttribute('hidden');
    document.querySelector('.filter-panel').style.display = 'block';
  } else {
    document.querySelector('.filter-panel').setAttribute('hidden', 'true');
    document.querySelector('.filter-panel').style.display = 'none';
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
    tbody.innerHTML = '<tr class="empty-row"><td colspan="8">No transactions found.</td></tr>';
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

// function filterTxns() {
//   const id   = document.getElementById("txn-id").value.toLowerCase();
//   const cust = document.getElementById("cust-name").value.toLowerCase();
//   const stat = document.getElementById("txn-status").value;
//   const meth = document.getElementById("txn-method").value;
//   const emp  = document.getElementById("emp-filter").value.toLowerCase();
//   const from = document.getElementById("date-from").value;
//   const to   = document.getElementById("date-to").value;

//   renderTxns(transactions.filter(t =>
//     (!id   || t.id.toLowerCase().includes(id)) &&
//     (!cust || t.customer.toLowerCase().includes(cust)) &&
//     (!stat || t.status === stat) &&
//     (!meth || t.method === meth) &&
//     (!emp  || t.employee.toLowerCase().includes(emp)) &&
//     (!from || t.date >= from) &&
//     (!to   || t.date <= to)
//   ));
// }
