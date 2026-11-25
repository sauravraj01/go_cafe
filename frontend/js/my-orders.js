
const API = "http://localhost:8080/api";

const token = sessionStorage.getItem("token");
const user = JSON.parse(sessionStorage.getItem("user") || "null");

const ordersContainer = document.getElementById("ordersContainer");
const message = document.getElementById("message");
const refreshBtn = document.getElementById("refreshBtn");

async function loadOrders() {
    if (!token || !user || user.role !== "student") {
        alert("Please login with a student account.");
        window.location.href = "login.html";
        return;
    }

    ordersContainer.innerHTML = "Loading orders...";

    try {
        const response = await fetch(`${API}/orders`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Unable to load orders");
        }

        displayOrders(data.orders || []);

    } catch (error) {
        ordersContainer.innerHTML = "";
        message.textContent = error.message;
    }
}

function displayOrders(orders) {
    ordersContainer.innerHTML = "";
    message.textContent = "";

    if (orders.length === 0) {
        ordersContainer.innerHTML = "<p>You haven't placed any orders yet.</p>";
        return;
    }

    orders.forEach(order => {
        const card = document.createElement("div");
        card.className = "history-order-card";

        const itemsHTML = (order.Items || []).map(item => `
            <p>${escapeHTML(item.item_name)} × ${item.quantity}
            - ₹${item.subtotal}</p>
        `).join("");

        card.innerHTML = `
            <h3>Order ${escapeHTML(order.token)}</h3>
            <p><strong>Status:</strong> ${escapeHTML(order.status)}</p>
            <p><strong>Payment:</strong> ${escapeHTML(order.payment_status)}</p>
            <div>${itemsHTML}</div>
            <h3>Total: ₹${order.total_amount}</h3>
            <button class="btn track-btn">Track Order</button>
        `;

        card.querySelector(".track-btn").addEventListener("click", () => {
            sessionStorage.setItem("lastOrderID", order.ID);
            window.location.href = "orders.html";
        });

        ordersContainer.appendChild(card);
    });
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

refreshBtn.addEventListener("click", loadOrders);

loadOrders();
