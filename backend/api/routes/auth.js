const express = require('express');
const router = express.Router();
const { signup, login, me } = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

// POST /api/auth/signup
router.post('/signup', signup);

// POST /api/auth/login
router.post('/login', login);

router.get("/me", authMiddleware, me);

module.exports = router;
