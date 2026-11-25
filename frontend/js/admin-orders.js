
const API = "http://localhost:8080/api";

const token = sessionStorage.getItem("token");

const ordersContainer = document.getElementById("ordersContainer");
const message = document.getElementById("message");

async function loadOrders() {

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    ordersContainer.textContent = "Loading orders...";

    try {

        const response = await fetch(`${API}/admin/orders`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Unable to fetch orders");
        }

        displayOrders(data.orders || []);

    } catch (error) {
        ordersContainer.textContent = error.message;
    }
}

function displayOrders(orders) {

    ordersContainer.innerHTML = "";

    if (orders.length === 0) {
        ordersContainer.textContent = "No orders found.";
        return;
    }

    orders.forEach(order => {

        const card = document.createElement("div");
        card.className = "order-card";

        const heading = document.createElement("h3");
        heading.textContent = `Order #${order.ID}`;

        const tokenText = document.createElement("p");
        tokenText.textContent = `Token: ${order.token}`;

        const total = document.createElement("p");
        total.textContent = `Total: ₹${order.total_amount}`;

        const payment = document.createElement("p");
        payment.textContent = `Payment: ${order.payment_status}`;

        const status = document.createElement("p");
        status.textContent = `Current Status: ${order.status}`;

        const itemsTitle = document.createElement("strong");
        itemsTitle.textContent = "Items:";

        const itemsList = document.createElement("ul");

        (order.items || []).forEach(item => {
            const li = document.createElement("li");
            li.textContent =
                `${item.item_name} × ${item.quantity} - ₹${item.subtotal}`;
            itemsList.appendChild(li);
        });

        const select = document.createElement("select");

        ["Preparing", "Ready", "Collected"].forEach(value => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = value;

            if (value === order.status) {
                option.selected = true;
            }

            select.appendChild(option);
        });

        const updateBtn = document.createElement("button");
        updateBtn.className = "btn";
        updateBtn.textContent = "Update Status";

        updateBtn.addEventListener("click", () => {
            updateOrderStatus(order.ID, select.value);
        });

        card.append(
            heading,
            tokenText,
            total,
            payment,
            status,
            itemsTitle,
            itemsList,
            select,
            updateBtn
        );

        ordersContainer.appendChild(card);
    });
}

async function updateOrderStatus(id, status) {

    message.textContent = "Updating status...";

    try {

        const response = await fetch(
            `${API}/admin/orders/${id}/status`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Update failed");
        }

        message.textContent = "Order updated successfully!";
        loadOrders();

    } catch (error) {
        message.textContent = error.message;
    }
}

document.getElementById("refreshBtn")
    .addEventListener("click", loadOrders);

loadOrders();
