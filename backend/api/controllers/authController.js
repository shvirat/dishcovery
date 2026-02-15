const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../utils/mailService");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY;

const connectDB = require("../db");

function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

/* ------------------ SIGNUP ------------------ */
exports.signup = async (req, res) => {
  try {
    await connectDB();

    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "Name, email and password are required." });

    const emailLower = email.toLowerCase().trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower)) {
      return res.status(400).json({ message: "Invalid email address." });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered." });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: emailLower,
      password: passwordHash
    });

    const token = generateToken(user);

    // Send Welcome Email
    const welcomeHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
        body { font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #334155; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.03); }
        .header { background: #ffffff; padding: 30px; text-align: center; border-bottom: 3px solid #ff6600; }
        .header h1 { color: #ff6600; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px; }
        .content { padding: 40px; }
        .content h2 { color: #1e293b; margin-top: 0; font-weight: 600; }
        .content p { color: #475569; }
        .features { margin: 25px 0; padding: 0; list-style: none; }
        .features li { margin-bottom: 15px; display: flex; align-items: center; color: #475569; }
        .features li:before { content: "🍳"; margin-right: 12px; font-size: 18px; }
        .btn-container { text-align: center; margin: 30px 0; }
        .btn { background-color: #ff6600; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 50px; font-weight: 600; display: inline-block; box-shadow: 0 4px 15px rgba(255, 102, 0, 0.3); }
        .footer { padding: 20px; text-align: center; font-size: 13px; color: #94a3b8; background-color: #f8fafc; border-top: 1px solid #e2e8f0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Dishcovery</h1>
        </div>
        <div class="content">
            <h2>Welcome to the Kitchen, ${user?.name?.trim().split(/\s+/)[0] || "chef"}!</h2>
            <p>We're thrilled to have you join our community of food lovers. Dishcovery is your new culinary companion, designed to make cooking easy and fun.</p>
            <p>Explore your new kitchen:</p>
            <ul class="features">
                <li>Search thousands of global recipes</li>
                <li>Save your favorites for quick access</li>
                <li>Step-by-step guides for every dish</li>
                <li>Discover new featured meals daily</li>
            </ul>
            <div class="btn-container">
                <a href="${process.env.FRONTEND_URL}" class="btn">Start Cooking Now</a>
            </div>
            <p>If you have any questions, just reply to this email. Happy cooking!</p>
            <p>Best regards,<br><strong>The Dishcovery Team</strong></p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Dishcovery. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;


    // Fire and forget email (don't await so signup isn't delayed by SMTP)
    sendEmail({
      to: user.email,
      subject: "Welcome to Dishcovery! 🍳",
      html: welcomeHtml,
      text: `Welcome to Dishcovery, ${user?.name?.trim().split(/\s+/)[0] || "chef"}! We're thrilled to have you. Start exploring recipes at ${process.env.FRONTEND_URL}`
    }).catch(err => console.error("Welcome email failed:", err));

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

/* ------------------ LOGIN ------------------ */
exports.login = async (req, res) => {
  try {
    await connectDB();

    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required." });

    const emailLower = email.toLowerCase().trim();

    const user = await User.findOne({ email: emailLower }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = generateToken(user);

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

exports.me = async (req, res) => {
  try {
    await connectDB();

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(req.user.id)
      .select("name email favorites");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        favorites: user.favorites
      }
    });
  } catch (err) {
    console.error("Me route error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
