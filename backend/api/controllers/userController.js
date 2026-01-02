const bcrypt = require("bcrypt");
const User = require("../models/User");

/* -------- TOGGLE FAVORITE -------- */
exports.toggleFavorite = async (req, res) => {
  const { mealId } = req.params;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const index = user.favorites.indexOf(mealId);

    if (index > -1) {
      user.favorites.splice(index, 1);
    } else {
      user.favorites.push(mealId);
    }

    await user.save();

    res.json({ favorites: user.favorites });
  } catch (err) {
    console.error("Toggle favorite error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* -------- GET FAVORITES -------- */
exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("favorites");
    res.json({ favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

/* -------- UPDATE PROFILE -------- */
exports.updateProfile = async (req, res) => {
  const { name, password } = req.body;
  const user = await User.findById(req.user.id);

  if (!user) return res.status(404).json({ message: "User not found" });

  if (name) user.name = name.trim();

  if (password) {
    if (password.length < 8)
      return res.status(400).json({ message: "Password must be at least 8 characters" });

    user.password = await bcrypt.hash(password, 12);
  }

  await user.save();

  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    favorites: user.favorites
  });
};

exports.deleteAccount = async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  await user.deleteOne();

  res.json({ message: "Account deleted successfully" });
};
