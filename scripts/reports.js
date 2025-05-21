const API = "http://localhost:8080/syos-backend/api/reports";

document.addEventListener("DOMContentLoaded", () => {
  // Set default date to yesterday
  const dateInput = document.getElementById("reportDate");
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  dateInput.value = yesterday.toISOString().split("T")[0];

  // 1. Hook up tab clicks
  document.querySelectorAll("#reportTabs .nav-link").forEach((tab) => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();
      document
        .querySelectorAll("#reportTabs .nav-link")
        .forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      loadReport(tab.dataset.target);
    });
  });

  // 2. Hook up date-change
  dateInput.addEventListener("change", () => {
    const active = document.querySelector("#reportTabs .active").dataset.target;
    loadReport(active);
  });

  // 3. Initial load of the first tab
  loadReport("daily-sales");
});

async function loadReport(type) {
  const date = document.getElementById("reportDate").value;
  let url = `${API}/${type}`;
  if (date && ["daily-sales", "reshelve", "bills"].includes(type)) {
    url += `?date=${date}`;
  }

  const res = await fetch(url);
  if (!res.ok) {
    document.getElementById(
      "reportContainer"
    ).innerHTML = `<div class="alert alert-danger">Error ${res.status}</div>`;
    return;
  }

  const data = await res.json();
  renderReport(type, data);
}

function renderReport(type, data) {
  const c = document.getElementById("reportContainer");
  c.innerHTML = "";

  if (!Array.isArray(data) || data.length === 0) {
    c.innerHTML = `
      <div class="alert alert-info">
        No records found for <strong>${type.replace("-", " ")}</strong>.
      </div>`;
    return;
  }

  // Build table
  const table = document.createElement("table");
  table.className = "table table-striped table-bordered";

  // Header
  const thead = table.createTHead();
  const headerRow = thead.insertRow();
  const keys = Object.keys(data[0]);
  keys.forEach((key) => {
    const th = document.createElement("th");
    th.textContent = key
      .replace(/([A-Z])/g, " $1")
      .replace(/-/g, " ")
      .replace(/^./, (s) => s.toUpperCase());
    headerRow.appendChild(th);
  });

  // Body
  const tbody = table.createTBody();
  data.forEach((item) => {
    const row = tbody.insertRow();
    keys.forEach((key) => {
      const cell = row.insertCell();
      const val = item[key];
      cell.textContent = typeof val === "number" ? val.toFixed(2) : val ?? "";
    });
  });

  // Inject into DOM
  const title = document.createElement("h3");
  title.textContent = type.replace("-", " ");
  c.appendChild(title);
  c.appendChild(table);
}
