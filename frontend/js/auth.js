
const API = "http://localhost:8080/api";

// Registration
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const message = document.getElementById("message");

        const userData = {
            name: document.getElementById("name").value,
            email: document.getElementById("email").value,
            password: document.getElementById("password").value
        };

        try {
            const response = await fetch(`${API}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (response.ok) {
                message.style.color = "green";
                message.textContent = "Registration successful! Please login.";

                registerForm.reset();
            } else {
                message.style.color = "red";
                message.textContent = data.error || data.message || "Registration failed";
            }

        } catch (error) {
            message.style.color = "red";
            message.textContent = "Cannot connect to server.";
            console.error(error);
        }
    });
}


// Login
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const message = document.getElementById("message");

        const loginData = {
            email: document.getElementById("email").value,
            password: document.getElementById("password").value
        };

        try {
            const response = await fetch(`${API}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(loginData)
            });

            const data = await response.json();

            if (response.ok && data.token) {
                sessionStorage.setItem("token", data.token);
                sessionStorage.setItem("user", JSON.stringify(data.user));

                message.style.color = "green";
                message.textContent = "Login successful!";

                setTimeout(() => {
                    if (data.user.role === "admin") {
                        window.location.href = "admin.html";
                    } else {
                        window.location.href = "menu.html";
                    }
                }, 1000);

            } else {
                message.style.color = "red";
                message.textContent = data.error || data.message || "Login failed";
            }

        } catch (error) {
            message.style.color = "red";
            message.textContent = "Cannot connect to server.";
            console.error(error);
        }
    });
}
