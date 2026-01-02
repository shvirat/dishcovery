const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  toggleFavorite,
  getFavorites,
  updateProfile,
  deleteAccount,
  forgotPassword,
  resetPassword
} = require("../controllers/userController");

router.post("/favorites/:mealId", auth, toggleFavorite);
router.get("/favorites", auth, getFavorites);
router.put("/me", auth, updateProfile);
router.delete("/me", auth, deleteAccount);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
