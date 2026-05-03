/* Employees */
const employees = [
  {

    /*Example Output*/

    id: "E001",
    name: "Mango Mango",
    role: "Manager",
    dept: "Management",
    email: "m.Mango@dbs.com",
    phone: "111-111-111",
    since: "2026"
  }
];
const API_BASE_URL = "http://localhost:3000/api";
let currentSqlInjectionMode = false;

async function fetchSqlMode() {
  const res = await fetch(`${API_BASE_URL}/mode`);
  if (!res.ok) throw new Error("Unable to load SQL mode.");
  return res.json();
}

function renderSqlMode(modeEnabled) {
  const bar = document.getElementById("sql-mode-toggle-bar");
  const label = document.getElementById("mode-label-toggle");
  const button = document.getElementById("mode-toggle-btn");
  if (!bar || !label || !button) return;

  bar.hidden = false;
  bar.classList.remove("mode-safe", "mode-vulnerable");
  bar.classList.add(modeEnabled ? "mode-vulnerable" : "mode-safe");

  if (modeEnabled) {
    label.innerHTML = "Mode: <strong>Vulnerable (String Concatenation)</strong>";
    button.textContent = "Switch to Safe";
    button.classList.remove("btn-mode-safe");
    button.classList.add("btn-mode-vulnerable");
  } else {
    label.innerHTML = "Mode: <strong>Safe (Prepared Statements)</strong>";
    button.textContent = "Switch to Vulnerable";
    button.classList.remove("btn-mode-vulnerable");
    button.classList.add("btn-mode-safe");
  }
}

async function toggleSqlMode() {
  try {
    const res = await fetch(`${API_BASE_URL}/mode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    if (!res.ok) throw new Error("Failed to update SQL mode.");
    const data = await res.json();
    currentSqlInjectionMode = Boolean(data.sqlInjectionMode);
    renderSqlMode(currentSqlInjectionMode);
  } catch (err) {
    alert(err.message);
  }
}

function updateResultsWrapperVisibility() {
  const resultsWrapper = document.getElementById("results-wrapper");
  if (!resultsWrapper) return;

  const tableIds = ["emp-table", "book-table", "txn-table"];
  const hasVisibleTable = tableIds.some(id => {
    const el = document.getElementById(id);
    return el && el.style.display === "block";
  });

  resultsWrapper.style.display = hasVisibleTable ? "block" : "none";
}

function renderEmployees(list) {
  const tbody = document.getElementById("emp-tbody");
  const tbodyAdmin = document.getElementById("emp-tbody-admin");
  const tableWrap = document.getElementById("emp-table");
  const targetBody = tbodyAdmin || tbody;
  if (!tbody && !tbodyAdmin) return;

  tableWrap.style.display = "block";
  updateResultsWrapperVisibility();


  // If there is no employees
  if (list.length === 0) {
    targetBody.innerHTML = '<tr class="empty-row"><td colspan="8">No employees found.</td></tr>';
    return;
  }

  if( tbodyAdmin ) {
    tbodyAdmin.innerHTML = list.map(e => `
    <tr>
      <td class="id-cell">${e.id}</td>
      <td>${e.name}</td>
      <td>${e.role}</td>
      <td>${e.dept}</td>
      <td>${e.email}</td>
      <td>${e.phone}</td>
      <td>${e.since}</td>
      <td><a href="edit.html" class="btn-edit">Edit</a></td>
    </tr>
  `).join("");
  } else {
    tbody.innerHTML = list.map(e => `
    <tr>
      <td class="id-cell">${e.id}</td>
      <td>${e.name}</td>
      <td>${e.role}</td>
      <td>${e.dept}</td>
      <td>${e.email}</td>
      <td>${e.phone}</td>
      <td>${e.since}</td>
    </tr>
  `).join("");
  }
}

function filterEmployees() {
  const name = document.getElementById("emp-name").value.toLowerCase();
  const dept = document.getElementById("emp-dept").value;
  const role = document.getElementById("emp-role").value;

  renderEmployees(employees.filter(e =>
    (!name || e.name.toLowerCase().includes(name)) &&
    (!dept || e.dept === dept) &&
    (!role || e.role === role)
  ));
}

function filterManager() {
  const input = document.getElementById('emp-id').value.trim();
  const msg = document.getElementById('login-msg');

  if (!input) {
    msg.textContent = 'Please enter a Manager ID.';
    msg.className = 'login-msg error';
    return;
  }

  // Valid IDs:  
  const validIds = ['MGR-001', 'E001'];

  if (validIds.includes(input)) {
    msg.textContent = 'Logging in...';
    msg.className = 'login-msg success';
    sessionStorage.setItem("isAdmin", "true");
    setTimeout(() => {
      document.querySelector('.login-wrapper').style.display = 'none';
      document.querySelector('.filter-panel').hidden = false;
    }, 500); // brief pause so user sees the success message
  } else {
    msg.textContent = 'Invalid. Please try again.';
    msg.className = 'login-msg error';
    document.getElementById('emp-id').focus();
  }
}

function resetEmp() {
  document.getElementById("emp-name").value = "";
  document.getElementById("emp-dept").value = "";
  document.getElementById("emp-role").value = "";
  const tableWrap = document.getElementById("emp-table");
  if (tableWrap) tableWrap.style.display = "none";
  updateResultsWrapperVisibility();
}


/* Transactions */
const transactions = [
  {

    /*Example Output*/
    id: "TXN-001",
    date: "2026-04-02",
    customer: "Chaiyun",
    books: "The Great Gatsby",
    employee: "Mango Mango",
    method: "Credit Card",
    total: 14.99,
    status: "Refunded"
  }
];

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
  const targetBody = tbodyAdmin || tbody;
  if (!tbody && !tbodyAdmin) return;

  tableWrap.style.display = "block";
  updateResultsWrapperVisibility();

  if (list.length === 0) {
    targetBody.innerHTML = '<tr class="empty-row"><td colspan="9">No transactions found.</td></tr>';
    return;
  }

  if( tbodyAdmin ) {
    tbodyAdmin.innerHTML = list.map(t => `
    <tr>
      <td class="id-cell">${t.id}</td>
      <td>${t.date}</td>
      <td>${t.customer}</td>
      <td>${t.employee}</td>
      <td>$${t.total.toFixed(2)}</td>
      <td>${statusBadge(t.status)}</td>
      <td><button class="btn-edit">Edit</button></td>
    </tr>
  `).join("");
  } else {
    tbody.innerHTML = list.map(t => `
      <tr>
        <td class="id-cell">${t.id}</td>
        <td>${t.date}</td>
        <td>${t.customer}</td>
        <td>${t.employee}</td>
        <td>$${t.total.toFixed(2)}</td>
        <td>${statusBadge(t.status)}</td>
      </tr>
    `).join("");
  }

  updateStats(list);
}

function updateStats(list) {
  if (!document.getElementById("stat-total")) return;

  document.getElementById("stat-total").textContent = list.length;
  document.getElementById("stat-comp").textContent  = list.filter(t => t.status === "Completed").length;
  document.getElementById("stat-pend").textContent  = list.filter(t => t.status === "Pending").length;
  document.getElementById("stat-ref").textContent   = list.filter(t => t.status === "Refunded").length;

  const revenue = list
    .filter(t => t.status !== "Refunded")
    .reduce((s, t) => s + t.total, 0);

  document.getElementById("stat-rev").textContent = "$" + revenue.toFixed(2);
}

async function filterTxns() {
  const idRaw = document.getElementById("txn-id").value.trim();
  const cust = document.getElementById("cust-name").value.toLowerCase();
  const emp = document.getElementById("emp-filter").value.toLowerCase();
  const from = document.getElementById("date-from").value;
  const to = document.getElementById("date-to").value;

  const query = new URLSearchParams({
    tID: idRaw.replace(/[^\d]/g, "") || "0",
    cName: cust,
    eName: emp,
    fromDate: from || "1900-01-01",
    toDate: to || "9999-12-31"
  });

  try {
    const res = await fetch(`${API_BASE_URL}/transactions?${query.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch transactions.");
    const rows = await res.json();
    const mapped = rows.map(r => ({
      id: `TXN-${r.TransactionID}`,
      date: r.Date ? String(r.Date).slice(0, 10) : "",
      customer: [r.CustomerFname, r.CustomerLname].filter(Boolean).join(" ").trim() || "Walk-in",
      books: r.Books || "N/A",
      employee: [r.EmployeeFname, r.EmployeeLname].filter(Boolean).join(" ").trim(),
      method: r.PaymentMethod || "N/A",
      total: Number(r.TotalAmount || 0),
      status: r.Status || "Pending"
    }));
    renderTxns(mapped);
  } catch (err) {
    alert(err.message);
  }
}

function resetTxns() {
  ["txn-id", "cust-name", "emp-filter", "date-from", "date-to"]
    .forEach(id => document.getElementById(id).value = "");
  document.getElementById("txn-status").value = "default";
  document.getElementById("txn-method").value = "default";
  const tableWrap = document.getElementById("txn-table");
  if (tableWrap) tableWrap.style.display = "none";
  updateResultsWrapperVisibility();
}


/* Books */

const books = [
  {

    /*Example Output*/
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    genre: "Fiction",
    isbn: "978-0743273565",
    price: 10.99,
    stock: 12
  }
];

function renderBooks(list) {
  const tbody = document.getElementById("book-tbody");
  const tbodyAdmin = document.getElementById("book-tbody-admin");
  const tableWrap = document.getElementById("book-table");
  const targetBody = tbodyAdmin || tbody;
  if (!tbody && !tbodyAdmin) return;

  tableWrap.style.display = "block";
  updateResultsWrapperVisibility();

  if (list.length === 0) {
    targetBody.innerHTML = '<tr class="empty-row"><td colspan="7">No books found.</td></tr>';
    return;
  }

  if( tbodyAdmin ) {
    tbodyAdmin.innerHTML = list.map(b => `
    <tr>
      <td>${b.title}</td>
      <td>${b.author}</td>
      <td>${b.genre}</td>
      <td class="isbn-cell">${b.isbn}</td>
      <td>$${b.price.toFixed(2)}</td>
      <td class="${b.stock <= 3 ? 'stock-low' : 'stock-ok'}">${b.stock}</td>
      <td><button class="btn-edit">Edit</button></td>
    </tr>
  `).join("");
  } else {
    tbody.innerHTML = list.map(b => `
    <tr>
      <td>${b.title}</td>
      <td>${b.author}</td>
      <td>${b.genre}</td>
      <td class="isbn-cell">${b.isbn}</td>
      <td>$${b.price.toFixed(2)}</td>
      <td class="${b.stock <= 3 ? 'stock-low' : 'stock-ok'}">${b.stock}</td>
    </tr>
  `).join("");
  }
}

async function filterBooks() {
  const title  = document.getElementById("title").value.toLowerCase();
  const author = document.getElementById("author").value.toLowerCase();
  const isbn   = document.getElementById("isbn").value;
  const genre  = document.getElementById("genre").value;
  const min    = parseFloat(document.getElementById("price_min").value) || 0;
  const max    = parseFloat(document.getElementById("price_max").value) || 999999;

  const query = new URLSearchParams({
    title,
    author,
    isbn,
    genre: genre === "default" ? "" : genre,
    minprice: String(min),
    maxprice: String(max)
  });

  try {
    const res = await fetch(`${API_BASE_URL}/books?${query.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch books.");
    const rows = await res.json();
    const mapped = rows.map(r => ({
      title: r.Title,
      author: r.Author,
      genre: r.Genre,
      isbn: r.ISBN,
      price: Number(r.Price || 0),
      stock: Number(r.NumberInStock || 0)
    }));
    renderBooks(mapped);
  } catch (err) {
    alert(err.message);
  }
}

function resetForm() {
  ["title", "author", "isbn", "price_min", "price_max"]
    .forEach(id => document.getElementById(id).value = "");
  document.getElementById("genre").value = "default";
  const tableWrap = document.getElementById("book-table");
  if (tableWrap) tableWrap.style.display = "none";
  updateResultsWrapperVisibility();
}

function logoutAdmin() {
  sessionStorage.removeItem("isAdmin");
  window.location.href = "admin.html";
}

/* Auto Load */
window.onload = function () {
  const el = document.getElementById("footer-time");
  if (el) el.textContent = new Date().toLocaleString();

  const loginWrapper = document.querySelector(".login-wrapper");
  const filterPanel = document.querySelector(".filter-panel");
  if (loginWrapper && filterPanel) {
    const isAdmin = sessionStorage.getItem("isAdmin") === "true";
    loginWrapper.style.display = isAdmin ? "none" : "flex";
    filterPanel.hidden = !isAdmin;
  }

  fetchSqlMode()
    .then(data => {
      currentSqlInjectionMode = Boolean(data.sqlInjectionMode);
      renderSqlMode(currentSqlInjectionMode);
    })
    .catch(() => {
      // Keep the page usable even if backend is down.
    });
};