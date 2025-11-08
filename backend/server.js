require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Basic security headers
app.use(helmet());

// CORS - allow local development origins (any port on localhost / 127.0.0.1)
const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like curl, mobile apps)
    if (!origin) return callback(null, true);
    // allow localhost and 127.0.0.1 on any port
    const allowed = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;
    if (allowed.test(origin)) return callback(null, true);
    // fallback: deny
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};
app.use(cors(corsOptions));

// Simple request logger to help debug 405/other issues
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.originalUrl, 'Origin:', req.headers.origin || '-');
  next();
});

// Rate limiter for auth endpoints - skip OPTIONS (preflight)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS'
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// initialize DB (ensure file is created)
require('./db');

// Ensure preflight (OPTIONS) requests for auth routes are handled before rate limiter
app.options('/api/auth/*', cors());

// Add a small body logger for auth routes to aid debugging (will log POST bodies)
app.use('/api/auth', (req, res, next) => {
  if (req.method === 'POST') console.log('auth body:', req.body);
  next();
});

// Routes mounted under the same origin as frontend to avoid CORS issues when serving static files
app.use('/api/auth', authLimiter, require('./routes/auth'));

// Serve frontend statically so the site and API share the same origin (avoids CORS issues)
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

// SPA fallback: serve index.html for any unknown GET (so client-side routing works)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Simple health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
