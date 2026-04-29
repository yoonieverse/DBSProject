import employees from "./script";
import transactions from "./script";
import books from "./script";

function editEmployees(list) {
    const name = document.getElementById("emp-name").value.toLowerCase();
    const role = document.getElementById("emp-role").value;
    const dept = document.getElementById("emp-dept").value;
    const email = document.getElementById("emp-mail").value;
    const phone = document.getElementById("emp-phone").value;
    const since = document.getElementById("emp-since").value;

    if (!name || !role || !dept || !email || !phone || !since) {
        //all fields are empty so nothing happens
        return;
    }
}
