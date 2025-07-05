const Database = require('better-sqlite3');
const db = new Database(process.env.DB_PATH || './data.sqlite');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password_hash TEXT
  );
  CREATE TABLE IF NOT EXISTS transcripts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    transcript_json TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

module.exports = db;
