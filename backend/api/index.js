require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const connectDB = require("./db");

const app = express();

/* ------------------ DB CONNECT ------------------ */
connectDB();

/* ------------------ MIDDLEWARE ------------------ */
app.use(helmet());
app.use(cors({
  origin: "*", // frontend hosted separately on Vercel
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

module.exports = app;
