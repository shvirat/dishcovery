const bcrypt = require("bcrypt");
const User = require("../models/User");
const crypto = require("crypto");

const connectDB = require("../db");
connectDB();

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

/* -------- DELETE ACCOUNT -------- */
exports.deleteAccount = async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  await user.deleteOne();

  res.json({ message: "Account deleted successfully" });
};


/* -------- FORGOT PASSWORD -------- */
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.json({ success: true }); // prevent email enumeration

  const token = crypto.randomBytes(32).toString("hex");

  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
  await user.save();

  res.json({
    success: true,
    resetLink: `${process.env.FRONTEND_URL}/reset-password?token=${token}`
  });
};

/* -------- RESET PASSWORD -------- */
exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  user.password = await bcrypt.hash(password, 12);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ success: true });
};
