
const API = "http://localhost:8080/api";

const token = sessionStorage.getItem("token");

async function loadDashboard() {

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {

        const response = await fetch(`${API}/admin/orders`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Unable to load dashboard");
        }

        const orders = data.orders || [];

        const total = orders.length;

        const pending = orders.filter(
            order => order.status === "Placed" ||
                     order.status === "Preparing"
        ).length;

        const completed = orders.filter(
            order => order.status === "Collected"
        ).length;

        const revenue = orders
            .filter(order => order.payment_status === "Paid")
            .reduce((sum, order) =>
                sum + Number(order.total_amount), 0
            );

        document.getElementById("totalOrders").textContent = total;

        document.getElementById("pendingOrders").textContent =
            pending;

        document.getElementById("completedOrders").textContent =
            completed;

        document.getElementById("totalRevenue").textContent =
            `₹${revenue}`;

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

loadDashboard();
