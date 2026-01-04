require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const connectDB = require("./db");

const app = express();

/* ------------------ DB CONNECT ------------------ */
// connectDB();

/* ------------------ MIDDLEWARE ------------------ */
app.use(helmet());
app.use(cors({
  origin: ["https://dishcovery-pi.vercel.app","https://dishcovery-v2.vercel.app"], //Default:"*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ------------------ REQUEST LOGGER ----------------- */
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    const safeBody = { ...req.body };

    // Mask sensitive fields
    const SENSITIVE_FIELDS = [
      "password",
      "confirmPassword",
      "token",
      "jwt",
      "authorization"
    ];

    SENSITIVE_FIELDS.forEach(field => {
      if (safeBody && safeBody[field]) {
        safeBody[field] = "****";
      }
    });

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🕒 Time:", new Date().toISOString());
    console.log("➡️  Method:", req.method);
    console.log("📍 URL:", req.originalUrl);

    if (Object.keys(req.query || {}).length) {
      console.log("🔍 Query:", req.query);
    }

    if (Object.keys(safeBody || {}).length) {
      console.log("📦 Body:", safeBody);
    }

    next();
  });
}

/* ------------------ RATE LIMIT ------------------ */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: req => req.method === "OPTIONS"
});

/* ------------------ ROUTES ------------------ */
app.use("/api/auth", authLimiter, require("./routes/auth"));
app.use("/api/user", require("./routes/user"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 5000;

// Only start server locally (NOT on Vercel)
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Backend running locally on port ${PORT}`);
  });
}

app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.status(200).send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Dishcovery API</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <style>
    :root {
      --bg: #020617;
      --card: #020617;
      --accent: #22d3ee;
      --accent-2: #a78bfa;
      --text: #e5e7eb;
      --muted: #94a3b8;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      height: 100vh;
      background:
        radial-gradient(circle at top left, rgba(34,211,238,0.15), transparent 40%),
        radial-gradient(circle at bottom right, rgba(167,139,250,0.15), transparent 40%),
        var(--bg);
      color: var(--text);
      font-family: system-ui, -apple-system, BlinkMacSystemFont;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .container {
      max-width: 720px;
      width: 90%;
      padding: 40px;
      border-radius: 20px;
      background: linear-gradient(
        180deg,
        rgba(255,255,255,0.06),
        rgba(255,255,255,0.02)
      );
      backdrop-filter: blur(16px);
      box-shadow:
        0 0 40px rgba(34,211,238,0.15),
        inset 0 0 0 1px rgba(255,255,255,0.06);
      animation: float 6s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }

    h1 {
      font-size: 2.4rem;
      font-weight: 700;
      background: linear-gradient(90deg, var(--accent), var(--accent-2));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 8px;
    }

    .subtitle {
      color: var(--muted);
      margin-bottom: 28px;
      font-size: 1rem;
    }

    .status {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: 999px;
      background: rgba(34,211,238,0.15);
      color: var(--accent);
      font-size: 0.85rem;
      margin-bottom: 24px;
    }

    .dot {
      width: 8px;
      height: 8px;
      background: var(--accent);
      border-radius: 50%;
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(34,211,238,0.6); }
      100% { box-shadow: 0 0 0 10px rgba(34,211,238,0); }
    }

    .endpoints {
      background: rgba(0,0,0,0.3);
      border-radius: 12px;
      padding: 18px;
      font-family: monospace;
      font-size: 0.95rem;
      line-height: 1.8;
      margin-bottom: 28px;
      box-shadow: inset 0 0 0 1px rgba(255,255,255,0.05);
    }

    .endpoints span {
      color: var(--accent);
    }

    .buttons {
      display: flex;
      gap: 14px;
      flex-wrap: wrap;
    }

    .btn {
      padding: 12px 18px;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 500;
      font-size: 0.95rem;
      transition: all 0.25s ease;
      border: 1px solid rgba(255,255,255,0.12);
      color: var(--text);
      background: rgba(255,255,255,0.05);
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(34,211,238,0.25);
      border-color: var(--accent);
    }

    footer {
      margin-top: 24px;
      font-size: 0.8rem;
      color: var(--muted);
      text-align: center;
    }
  </style>
</head>

<body>
  <div class="container">
    <div class="status">
      <div class="dot"></div>
      API is running
    </div>

    <h1>Dishcovery API</h1>
    <p class="subtitle">
      Secure backend powering the Dishcovery experience.
    </p>

    <div class="endpoints">
      <div><span>POST</span> /api/auth/signup</div>
      <div><span>POST</span> /api/auth/login</div>
      <div><span>GET</span> /api/auth/me</div>
      <div><span>GET</span> /api/health</div>
    </div>

    <div class="buttons">
      <a class="btn" href="https://github.com/shvirat/dishcovery" target="_blank">
        🐙 GitHub Repository
      </a>
      <a class="btn" href="https://dishcovery-v2.vercel.app" target="_blank">
        🌐 Live Website
      </a>
    </div>

    <footer>
      © ${new Date().getFullYear()} Dishcovery API • Secure Backend
    </footer>
  </div>
</body>
</html>
  `);
});


module.exports = app;
