
const API = "http://localhost:8080/api";

const token = sessionStorage.getItem("token");

const updateBtn = document.getElementById("updateBtn");
const message = document.getElementById("message");

updateBtn.addEventListener("click", async () => {

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    const orderID = document.getElementById("orderID").value;
    const status = document.getElementById("status").value;

    if (!orderID) {
        message.textContent = "Please enter an Order ID.";
        return;
    }

    updateBtn.disabled = true;
    message.textContent = "Updating order...";

    try {

        const response = await fetch(
            `${API}/admin/orders/${orderID}/status`,
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
            throw new Error(data.error || "Could not update order.");
        }

        message.textContent = "Order status updated successfully!";

    } catch (error) {
        message.textContent = error.message;
    } finally {
        updateBtn.disabled = false;
    }
});
