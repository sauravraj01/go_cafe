const token = sessionStorage.getItem("token");

if (!token) {
    alert("Please login to access your cart.");
    window.location.href = "login.html";
}

const API = "http://localhost:8080/api";

const cartItems = document.getElementById("cartItems");
const totalItems = document.getElementById("totalItems");
const totalAmount = document.getElementById("totalAmount");
const checkoutBtn = document.getElementById("checkoutBtn");

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let menuItems = [];

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

async function loadCart() {
    try {
        const response = await fetch(`${API}/menu`);

        if (!response.ok) {
            throw new Error("Unable to fetch menu");
        }

        const data = await response.json();
        menuItems = data.items || [];

        displayCart();

    } catch (error) {
        cartItems.textContent = "Unable to load cart. Please try again.";
        console.error(error);
    }
}

function displayCart() {

    cartItems.innerHTML = "";

    let total = 0;
    let count = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <h2>Your cart is empty!</h2>
                <p>Add some delicious food from our menu.</p>
                <br>
                <a href="menu.html" class="btn">Explore Menu</a>
            </div>
        `;

        totalItems.textContent = 0;
        totalAmount.textContent = "₹0";
        checkoutBtn.disabled = true;
        return;
    }

    cart.forEach(item => {

        const food = menuItems.find(
            menuItem => String(menuItem.ID) === String(item.menu_item_id)
        );

        if (!food || !food.available || item.quantity <= 0) {
            return;
        }

        const subtotal = food.price * item.quantity;

        total += subtotal;
        count += item.quantity;

        const div = document.createElement("div");
        div.className = "cart-item";

        const details = document.createElement("div");

        const name = document.createElement("h3");
        name.textContent = food.item_name;

        const price = document.createElement("p");
        price.textContent = `Price: ₹${food.price}`;

        const subtotalText = document.createElement("p");
        subtotalText.className = "cart-item-price";
        subtotalText.textContent = `Subtotal: ₹${subtotal}`;

        details.append(name, price, subtotalText);

        const controls = document.createElement("div");
        controls.className = "quantity-controls";

        const minus = document.createElement("button");
        minus.textContent = "-";

        const quantity = document.createElement("span");
        quantity.textContent = item.quantity;

        const plus = document.createElement("button");
        plus.textContent = "+";

        const remove = document.createElement("button");
        remove.textContent = "Remove";
        remove.className = "remove-btn";

        minus.addEventListener("click", () => {
            changeQuantity(item.menu_item_id, -1);
        });

        plus.addEventListener("click", () => {
            changeQuantity(item.menu_item_id, 1);
        });

        remove.addEventListener("click", () => {
            removeItem(item.menu_item_id);
        });

        controls.append(minus, quantity, plus);

        const actions = document.createElement("div");
        actions.append(controls, remove);

        div.append(details, actions);

        cartItems.appendChild(div);
    });

    totalItems.textContent = count;
    totalAmount.textContent = `₹${total}`;

    checkoutBtn.disabled = count === 0;
}

function changeQuantity(id, change) {

    const item = cart.find(
        item => String(item.menu_item_id) === String(id)
    );

    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        removeItem(id);
        return;
    }

    saveCart();
    displayCart();
}

function removeItem(id) {

    cart = cart.filter(
        item => String(item.menu_item_id) !== String(id)
    );

    saveCart();
    displayCart();
}

checkoutBtn.addEventListener("click", () => {
    window.location.href = "checkout.html";
});

loadCart();
