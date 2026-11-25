
const API = "http://localhost:8080/api";

let allItems = [];

const menuContainer = document.getElementById("menuContainer");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");

// Fetch all menu items
async function loadMenu() {
    try {
        const response = await fetch(`${API}/menu`);
        const data = await response.json();

        allItems = data.items || [];

        displayMenu(allItems);
        loadCategories();

    } catch (error) {
        menuContainer.innerHTML = "<p>Unable to load menu.</p>";
        console.error(error);
    }
}

// Fetch categories
async function loadCategories() {
    try {
        const response = await fetch(`${API}/categories`);
        const data = await response.json();

        const categories = data.categories || [];

        categories.forEach(category => {
            const option = document.createElement("option");

            option.value = category.ID;
            option.textContent = category.category_name;

            categoryFilter.appendChild(option);
        });

    } catch (error) {
        console.error(error);
    }
}

// Display food items
function displayMenu(items) {

    menuContainer.innerHTML = "";

    if (items.length === 0) {
        menuContainer.innerHTML = "<p>No food items found.</p>";
        return;
    }

    items.forEach(item => {

        const card = document.createElement("div");
        card.className = "menu-card";

        card.innerHTML = `
            <div class="food-emoji">🍔</div>

            <h3>${escapeHTML(item.item_name)}</h3>

            <p>${escapeHTML(item.description || "Delicious cafeteria food")}</p>

            <div class="menu-price">₹${item.price}</div>

            <button class="add-cart-btn">
                Add to Cart +
            </button>
        `;

        card.querySelector("button").addEventListener("click", () => {
            addToCart(item.ID);
        });

        menuContainer.appendChild(card);
    });
}

// Search and category filtering
function filterMenu() {

    const search = searchInput.value.toLowerCase();
    const category = categoryFilter.value;

    const filteredItems = allItems.filter(item => {

        const matchesSearch =
            item.item_name.toLowerCase().includes(search);

        const matchesCategory =
            category === "" ||
            String(item.category_id) === category;

        return matchesSearch && matchesCategory;
    });

    displayMenu(filteredItems);
}

// Add item to cart
function addToCart(id) {

    const token = sessionStorage.getItem("token");
    const user = JSON.parse(sessionStorage.getItem("user") || "null");

    if (!token || !user || user.role !== "student") {
        alert("Please login with a student account to add items to cart.");

        window.location.href = "login.html";
        return;
    }

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existingItem = cart.find(
        item => String(item.menu_item_id) === String(id)
    );

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            menu_item_id: id,
            quantity: 1
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    alert("Item added to cart!");
}


// Escape menu text before inserting it into HTML
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

searchInput.addEventListener("input", filterMenu);
categoryFilter.addEventListener("change", filterMenu);

loadMenu();
