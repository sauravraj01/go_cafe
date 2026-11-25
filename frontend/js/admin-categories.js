
const API = "http://localhost:8080/api";

const token = sessionStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}

const categoryForm = document.getElementById("categoryForm");
const categoryID = document.getElementById("categoryID");
const categoryName = document.getElementById("categoryName");
const categoryList = document.getElementById("categoryList");
const message = document.getElementById("message");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");

async function loadCategories() {
    try {
        const response = await fetch(`${API}/categories`);
        const categories = await response.json();

        categoryList.innerHTML = "";

        if (categories.length === 0) {
            categoryList.innerHTML = "<p>No categories found.</p>";
            return;
        }

        categories.forEach(category => {
            categoryList.innerHTML += `
                <div class="menu-admin-item">
                    <h3>${category.category_name}</h3>

                    <button class="btn"
                        onclick="editCategory(${category.ID}, '${category.category_name}')">
                        Edit
                    </button>

                    <button class="btn"
                        onclick="deleteCategory(${category.ID})">
                        Delete
                    </button>
                </div>
            `;
        });

    } catch (error) {
        categoryList.innerHTML = "<p>Unable to load categories.</p>";
    }
}

categoryForm.addEventListener("submit", async function(e) {
    e.preventDefault();

    const id = categoryID.value;

    const body = {
        category_name: categoryName.value.trim()
    };

    if (!body.category_name) {
        message.textContent = "Enter category name.";
        return;
    }

    const url = id
        ? `${API}/admin/categories/${id}`
        : `${API}/admin/categories`;

    const method = id ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.error || "Operation failed.";
            return;
        }

        message.textContent = data.message;
        resetForm();
        loadCategories();

    } catch (error) {
        message.textContent = "Server error.";
    }
});

function editCategory(id, name) {
    categoryID.value = id;
    categoryName.value = name;

    document.getElementById("formTitle").textContent = "Edit Category";
    saveBtn.textContent = "Update Category";
    cancelBtn.style.display = "block";
}


async function deleteCategory(id) {
    if (!confirm("Are you sure you want to delete this category?")) {
        return;
    }

    try {
        const response = await fetch(`${API}/admin/categories/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const text = await response.text();
        console.log("Delete response:", response.status, text);

        let data = {};
        try {
            data = JSON.parse(text);
        } catch (e) {
            data.error = text;
        }

        if (!response.ok) {
            alert(data.error || "Delete failed");
            return;
        }

        alert(data.message || "Category deleted successfully");
        loadCategories();

    } catch (error) {
        console.error("Delete error:", error);
        alert("Request failed. Check browser console.");
    }
}


function resetForm() {
    categoryForm.reset();
    categoryID.value = "";

    document.getElementById("formTitle").textContent = "Add New Category";
    saveBtn.textContent = "Add Category";
    cancelBtn.style.display = "none";
}

cancelBtn.addEventListener("click", resetForm);

loadCategories();
