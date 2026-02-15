const bcrypt = require("bcrypt");
const User = require("../models/User");
const crypto = require("crypto");
const sendEmail = require("../utils/mailService");

const connectDB = require("../db");

/* -------- TOGGLE FAVORITE -------- */
exports.toggleFavorite = async (req, res) => {
  try {
    await connectDB();

    const { mealId } = req.params;

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
    await connectDB();
    const user = await User.findById(req.user.id).select("favorites");
    res.json({ favorites: user.favorites });
  } catch (err) {
    console.error("Get favorite error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* -------- UPDATE PROFILE -------- */
exports.updateProfile = async (req, res) => {
  try {
    await connectDB();
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
  } catch (err) {
    console.error("Update profile error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* -------- DELETE ACCOUNT -------- */
exports.deleteAccount = async (req, res) => {
  try {
    await connectDB();
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("Delete account error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


/* -------- FORGOT PASSWORD -------- */
exports.forgotPassword = async (req, res) => {
  try {
    await connectDB();
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

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const htmlMessage = `
<!DOCTYPE html>
<html>
<head>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
        body { font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #ffffff; margin: 0; padding: 0; background-color: #000000; }
        .container { max-width: 600px; margin: 20px auto; background: #0d0d0d; border: 1px solid rgba(255, 102, 0, 0.2); border-radius: 12px; overflow: hidden; }
        .header { background: #000000; padding: 30px; text-align: center; border-bottom: 2px solid #ff6600; }
        .header h1 { color: #ff6600; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px; }
        .content { padding: 40px; background: #0d0d0d; }
        .content h2 { color: #ffffff; margin-top: 0; font-weight: 600; }
        .content p { color: #dcdcdc; }
        .btn-container { text-align: center; margin: 30px 0; }
        .btn { background-color: #ff6600; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 50px; font-weight: 600; display: inline-block; box-shadow: 0 4px 15px rgba(255, 102, 0, 0.3); }
        .footer { padding: 20px; text-align: center; font-size: 13px; color: #999999; background-color: #000000; border-top: 1px solid rgba(255, 255, 255, 0.1); }
        .expire-text { font-size: 14px; color: #ff7755; margin-top: 20px; font-weight: 500; }
        .link-alt { word-break: break-all; font-size: 12px; color: #999999; margin-top: 25px; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 20px; }
        .link-alt p { margin: 5px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Dishcovery</h1>
        </div>
        <div class="content">
            <h2>Reset Your Password</h2>
            <p>Hello ${user?.name?.trim().split(/\s+/)[0] || "there"},</p>
            <p>We received a request to reset the password for your Dishcovery account. Click the button below to choose a new password:</p>
            <div class="btn-container">
                <a href="${resetLink}" class="btn">Reset Password</a>
            </div>
            <p class="expire-text">⚠️ This link will expire in 15 minutes for security reasons.</p>
            <p>If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            <div class="link-alt">
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="color: #ff6600;">${resetLink}</p>
            </div>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Dishcovery. Built with ❤️ for food lovers.</p>
        </div>
    </div>
</body>
</html>
    `;

    await sendEmail({
      to: user.email,
      subject: "Reset your Dishcovery password",
      html: htmlMessage,
      text: `Reset Your Password\n\nPlease use the following link to reset your password: ${resetLink}\n\nThis link will expire in 15 minutes.`
    });


    res.json({
      success: true,
      message: "Password reset link sent to your email."
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* -------- RESET PASSWORD -------- */
exports.resetPassword = async (req, res) => {
  try {
    await connectDB();
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
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
