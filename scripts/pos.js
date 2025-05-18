const API = "http://localhost:8080/syos-backend/api";

let lines = [];

document.getElementById("lineForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const code = document.getElementById("code").value.trim();
  const qty = parseInt(document.getElementById("qty").value, 10);
  if (!code || qty < 1) return;

  // fetch item details
  const res = await fetch(`${API}/items/${code}`);
  if (!res.ok) return alert("Item not found");
  const item = await res.json();

  lines.push({
    code,
    name: item.name,
    qty,
    unitPrice: item.unitPrice,
    lineTotal: item.unitPrice * qty,
  });

  renderLines();
});

function renderLines() {
  const tbody = document.getElementById("tbody");
  tbody.innerHTML = "";
  let total = 0;
  lines.forEach((l) => {
    total += l.lineTotal;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${l.code}</td>
      <td>${l.name}</td>
      <td>${l.qty}</td>
      <td>${l.unitPrice.toFixed(2)}</td>
      <td>${l.lineTotal.toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  });
  document.getElementById("total").textContent = total.toFixed(2);
}

document.getElementById("checkoutBtn").addEventListener("click", async () => {
  const cashTendered = parseFloat(document.getElementById("cash").value);
  if (isNaN(cashTendered)) return;

  const payload = {
    items: Object.fromEntries(lines.map((l) => [l.code, l.qty])),
    cashTendered,
  };
  const res = await fetch(`${API}/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (res.ok) {
    document.getElementById("change").textContent =
      data.changeAmount.toFixed(2);
    lines = [];
    renderLines();
  } else {
    alert(data.error || "Checkout failed");
  }
});
