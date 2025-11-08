const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const dirname = path.resolve(__dirname);

const DB_FILE = process.env.DB_FILE || path.join(dirname, 'data', 'dishcovery.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_FILE);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new sqlite3.Database(DB_FILE);

// Initialize users table
db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password_hash TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  );
});

module.exports = db;
