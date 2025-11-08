const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '1h';

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password || !name) return res.status(400).json({ message: 'Name, email and password are required.' });

  // Basic validation
  const emailLower = String(email).toLowerCase().trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower)) {
    return res.status(400).json({ message: 'Invalid email address.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }

  try {
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const stmt = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');
    stmt.run(name.trim(), emailLower, password_hash, function (err) {
      if (err) {
        if (err.message && err.message.includes('UNIQUE')) {
          return res.status(409).json({ message: 'Email already registered.' });
        }
        console.error('DB insert error', err);
        return res.status(500).json({ message: 'Database error.' });
      }

      const user = { id: this.lastID, name: name.trim(), email: emailLower };
      const token = generateToken(user);
      return res.status(201).json({ token, user });
    });
  } catch (err) {
    console.error('Signup error', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

  const emailLower = String(email).toLowerCase().trim();

  db.get('SELECT id, name, email, password_hash FROM users WHERE email = ?', [emailLower], async (err, row) => {
    if (err) {
      console.error('DB select error', err);
      return res.status(500).json({ message: 'Database error.' });
    }

    if (!row) return res.status(401).json({ message: 'Invalid email or password.' });

    const valid = await bcrypt.compare(password, row.password_hash);
    if (!valid) return res.status(401).json({ message: 'Invalid email or password.' });

    const user = { id: row.id, name: row.name, email: row.email };
    const token = generateToken(user);
    return res.json({ token, user });
  });
};
