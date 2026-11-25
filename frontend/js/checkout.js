
const API = "http://localhost:8080/api";

const token = sessionStorage.getItem("token");

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let menuItems = [];
let currentOrder = null;

const checkoutItems = document.getElementById("checkoutItems");
const checkoutTotal = document.getElementById("checkoutTotal");
const placeOrderBtn = document.getElementById("placeOrderBtn");
const payBtn = document.getElementById("payBtn");
const message = document.getElementById("checkoutMessage");

async function loadCheckout() {

    if (!token) {
        alert("Please login first.");
        window.location.href = "login.html";
        return;
    }

    if (cart.length === 0) {
        checkoutItems.textContent = "Your cart is empty.";
        placeOrderBtn.disabled = true;
        return;
    }

    try {
        const response = await fetch(`${API}/menu`);
        if (!response.ok) throw new Error("Could not load menu");

        const data = await response.json();
        menuItems = data.items || [];

        displayCheckout();

    } catch (error) {
        message.textContent = "Unable to load checkout.";
        console.error(error);
    }
}

function displayCheckout() {

    checkoutItems.innerHTML = "";

    let total = 0;

    for (const item of cart) {

        const food = menuItems.find(
            f => String(f.ID ?? f.id) === String(item.menu_item_id)
        );

        if (!food || food.available === false ||
            food.Available === false || item.quantity <= 0) {

            checkoutItems.textContent =
                "Some cart items are unavailable. Please update your cart.";

            placeOrderBtn.disabled = true;
            checkoutTotal.textContent = "₹0";
            return;
        }

        const price = Number(food.price ?? food.Price);
        const subtotal = price * item.quantity;

        total += subtotal;

        const row = document.createElement("div");
        row.className = "checkout-row";

        const name = document.createElement("span");
        name.textContent =
            `${food.item_name ?? food.ItemName} × ${item.quantity}`;

        const amount = document.createElement("strong");
        amount.textContent = `₹${subtotal}`;

        row.append(name, amount);
        checkoutItems.appendChild(row);
    }

    checkoutTotal.textContent = `₹${total}`;
    placeOrderBtn.disabled = false;
}


// Place order
placeOrderBtn.addEventListener("click", async () => {

    placeOrderBtn.disabled = true;
    message.textContent = "Placing your order...";

    try {
        const response = await fetch(`${API}/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                items: cart.map(item => ({
                    menu_item_id: item.menu_item_id,
                    quantity: item.quantity
                }))
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Order placement failed");
        }

        currentOrder = data.order;

        message.textContent = "Order placed! Proceed to payment.";

        payBtn.disabled = false;

    } catch (error) {
        message.textContent = error.message;
        placeOrderBtn.disabled = false;
    }
});

// Simulated payment
payBtn.addEventListener("click", async () => {

    if (!currentOrder) return;

    payBtn.disabled = true;
    message.textContent = "Processing simulated payment...";

    try {
        const response = await fetch(
            `${API}/orders/${currentOrder.ID}/pay`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Payment failed");
        }

        localStorage.removeItem("cart");

        document.getElementById("successCard").hidden = false;
        document.getElementById("orderToken").textContent =
            data.order_token;
        sessionStorage.setItem("lastOrderID", currentOrder.ID);

        document.getElementById("paymentStatus").textContent =
            "Payment Status: " + data.payment_status;

        message.textContent = "Payment successful!";

        payBtn.style.display = "none";
        placeOrderBtn.style.display = "none";

    } catch (error) {
        message.textContent = error.message;
        payBtn.disabled = false;
    }
});

loadCheckout();
