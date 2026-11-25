
const API = "http://localhost:8080/api";
const token = sessionStorage.getItem("token");

const menuForm = document.getElementById("menuForm");
const menuList = document.getElementById("menuList");
const message = document.getElementById("message");

if (!token) {
    window.location.href = "login.html";
}

async function loadCategories() {
    const response = await fetch(`${API}/categories`);
    const categories = await response.json();

    const categorySelect = document.getElementById("categoryID");

    categorySelect.innerHTML = '<option value="">Select Category</option>';

    categories.forEach(category => {
        categorySelect.innerHTML += `
            <option value="${category.ID}">
                ${category.category_name}
            </option>
        `;
    });
}


async function loadMenu() {

    const response = await fetch(`${API}/admin/menu`, {headers: {"Authorization": `Bearer ${token}`}});
    const data = await response.json();

    menuList.innerHTML = "";

    (data.items || []).forEach(item => {

        const card = document.createElement("div");
        card.className = "menu-admin-item";

        const heading = document.createElement("h3");
        heading.textContent = item.item_name;

        const price = document.createElement("p");
        price.textContent = `Price: ₹${item.price}`;

        const category = document.createElement("p");
        category.textContent =
            `Category: ${item.category?.category_name || "N/A"}`;

        const availability = document.createElement("p");
        availability.textContent =
            `Available: ${item.available ? "Yes" : "No"}`;

        const editBtn = document.createElement("button");
        editBtn.className = "btn";
        editBtn.textContent = "Edit";

        editBtn.addEventListener("click", () => editItem(item));

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn";
        deleteBtn.textContent = "Delete";

        deleteBtn.addEventListener("click", () => deleteItem(item.ID));

        card.append(
            heading, price, category, availability,
            editBtn, deleteBtn
        );

        menuList.appendChild(card);
    });

    if (!data.items || data.items.length === 0) {
        menuList.textContent = "No food items found.";
    }
}

menuForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const id = document.getElementById("itemID").value;

    const body = {
        item_name: document.getElementById("itemName").value,
        category_id: Number(document.getElementById("categoryID").value),
        price: Number(document.getElementById("price").value),
        description: document.getElementById("description").value,
        available: document.getElementById("available").checked
    };

    const url = id
        ? `${API}/admin/menu/${id}`
        : `${API}/admin/menu`;

    const method = id ? "PUT" : "POST";

    try {

        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Operation failed");
        }

        message.textContent = id
            ? "Food item updated successfully!"
            : "Food item added successfully!";

        resetForm();
        loadMenu();

    } catch (error) {
        message.textContent = error.message;
    }
});

function editItem(item) {

    document.getElementById("itemID").value = item.ID;
    document.getElementById("itemName").value = item.item_name;
    document.getElementById("categoryID").value = item.category_id;
    document.getElementById("price").value = item.price;
    document.getElementById("description").value = item.description;
    document.getElementById("available").checked = item.available;

    document.getElementById("formTitle").textContent = "Edit Food Item";
    document.getElementById("saveBtn").textContent = "Update Food Item";
    document.getElementById("cancelBtn").style.display = "block";

    window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deleteItem(id) {

    if (!confirm("Are you sure you want to delete this food item?")) {
        return;
    }

    try {

        const response = await fetch(`${API}/admin/menu/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Delete failed");
        }

        message.textContent = "Food item deleted successfully!";
        loadMenu();

    } catch (error) {
        message.textContent = error.message;
    }
}

function resetForm() {

    menuForm.reset();

    document.getElementById("itemID").value = "";
    document.getElementById("formTitle").textContent = "Add New Food Item";
    document.getElementById("saveBtn").textContent = "Add Food Item";
    document.getElementById("cancelBtn").style.display = "none";
}

document.getElementById("cancelBtn")
    .addEventListener("click", resetForm);

async function initialize() {
    try {
        await loadCategories();
        await loadMenu();
    } catch (error) {
        message.textContent = error.message;
    }
}

initialize();
