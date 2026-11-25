
const API = "http://localhost:8080/api";

const token = sessionStorage.getItem("token");
const orderID = sessionStorage.getItem("lastOrderID");

const steps = ["Placed", "Preparing", "Ready", "Collected"];

async function loadOrder() {

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    if (!orderID) {
        document.getElementById("orderStatus").textContent =
            "No recent order found.";
        return;
    }

    try {
        const response = await fetch(`${API}/orders/${orderID}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Unable to fetch order");
        }

        const order = data.order;

        document.getElementById("orderToken").textContent =
            order.token;

        document.getElementById("paymentStatus").textContent =
            order.payment_status;

        document.getElementById("orderTotal").textContent =
            `₹${order.total_amount}`;

        const itemsContainer = document.getElementById("orderItems");
        itemsContainer.innerHTML = "";

        order.items.forEach(item => {
            const div = document.createElement("div");
            div.className = "checkout-row";

            const name = document.createElement("span");
            name.textContent = `${item.item_name} × ${item.quantity}`;

            const price = document.createElement("strong");
            price.textContent = `₹${item.subtotal}`;

            div.append(name, price);
            itemsContainer.appendChild(div);
        });

        showProgress(order.status);

    } catch (error) {
        document.getElementById("orderStatus").textContent =
            error.message;

        console.error(error);
    }
}

function showProgress(currentStatus) {

    const container = document.getElementById("orderStatus");
    container.innerHTML = "";

    const currentIndex = steps.indexOf(currentStatus);

    steps.forEach((step, index) => {

        const div = document.createElement("div");

        div.className = "status-step";

        if (index < currentIndex) {
            div.classList.add("completed");
            div.textContent = "✓ " + step;
        } 
        else if (index === currentIndex) {
            div.classList.add("active");
            div.textContent = "● " + step + " (Current Status)";
        } 
        else {
            div.textContent = "○ " + step;
        }

        container.appendChild(div);
    });
}

document.getElementById("refreshBtn")
    .addEventListener("click", loadOrder);

loadOrder();
