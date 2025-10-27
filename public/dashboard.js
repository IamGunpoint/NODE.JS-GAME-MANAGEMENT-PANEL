// 🌌 AstraPanel Dashboard Logic

// Login Form
async function login(e) {
  e.preventDefault();

  const form = document.getElementById("loginForm");
  const formData = new FormData(form);
  const data = {
    username: formData.get("username"),
    password: formData.get("password"),
  };

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const j = await res.json();

    if (!j.ok) {
      alert("❌ Login failed: " + (j.message || ""));
      return;
    }

    document.getElementById("loginCard").style.display = "none";
    document.getElementById("dashboardGrid").style.display = "grid";
    document.getElementById("welcomeText").innerText = `Welcome back, ${data.username}`;
    fetchStats();
  } catch (err) {
    alert("Error connecting to server!");
    console.error(err);
  }
}

// Fetch dashboard stats
async function fetchStats() {
  try {
    const res = await fetch("/api/stats");
    if (res.status === 401) {
      alert("Unauthorized — please log in again.");
      location.reload();
      return;
    }

    const j = await res.json();
    if (!j.ok) {
      alert("Failed to load stats");
      return;
    }

    const s = j.stats;
    document.getElementById("totalServers").innerText = s.totalServers;
    document.getElementById("totalUsers").innerText = s.totalUsers;
    document.getElementById("availableRam").innerText = s.availableRamMB;
  } catch (err) {
    console.error("Error fetching stats:", err);
  }
}

// Logout
async function logout() {
  try {
    await fetch("/api/logout", { method: "POST" });
    location.reload();
  } catch (err) {
    alert("Logout failed!");
  }
}

// Navigation highlighting (underline on active)
const navLinks = document.querySelectorAll(".nav-link");
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.forEach((l) => l.classList.remove("active"));
    link.classList.add("active");
  });
});

// Event listeners
document.getElementById("loginForm").addEventListener("submit", login);
document.getElementById("logoutBtn").addEventListener("click", logout);
