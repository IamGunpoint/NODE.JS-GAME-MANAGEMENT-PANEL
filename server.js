// server.js — AstraPanel 🌌
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const fs = require("fs-extra");
const path = require("path");
const bcrypt = require("bcrypt");
const os = require("os");

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

// Ensure data folder and admin user exist
fs.ensureDirSync(DATA_DIR);

if (!fs.existsSync(USERS_FILE)) {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync("Mishra@123", salt);
  const initial = {
    users: [
      {
        username: "IamAman",
        passwordHash: hash,
        role: "admin",
      },
    ],
  };
  fs.writeJsonSync(USERS_FILE, initial, { spaces: 2 });
  console.log("🟢 Created default admin: IamAman");
}

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  session({
    secret: "astrapanel_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 86400000 }, // 1 day
  })
);

// Helper to read users
function readUsers() {
  try {
    return fs.readJsonSync(USERS_FILE);
  } catch {
    return { users: [] };
  }
}

// Login API
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ ok: false, message: "Missing fields" });

  const data = readUsers();
  const user = data.users.find((u) => u.username === username);
  if (!user) return res.status(401).json({ ok: false, message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ ok: false, message: "Invalid credentials" });

  req.session.user = { username: user.username, role: user.role };
  res.json({ ok: true });
});

// Auth middleware
function requireAuth(req, res, next) {
  if (req.session?.user) return next();
  res.status(401).json({ ok: false, message: "Unauthorized" });
}

// Dashboard stats
app.get("/api/stats", requireAuth, (req, res) => {
  const totalServers = 3; // Placeholder for later integration
  const users = readUsers().users.length;
  const availableRamMB = Math.round(os.freemem() / 1024 / 1024);

  res.json({
    ok: true,
    stats: {
      totalServers,
      totalUsers: users,
      availableRamMB,
    },
  });
});

// Logout
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

// Serve dashboard page
app.get("/dashboard", (req, res) => {
  if (!req.session?.user) return res.redirect("/");
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AstraPanel running at http://localhost:${PORT}`);
});
