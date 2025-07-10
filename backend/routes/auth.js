const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

// POST Request for Registering a new user
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ status: 'error', message: 'Missing fields' });

  const hash = await bcrypt.hash(password, 12);
  try {
    const stmt = db.prepare('INSERT INTO users (username, email, password_hash) VALUES (?,?,?)');
    const info = stmt.run(username, email, hash);
    const userId = info.lastInsertRowid;
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ status: 'success', userId, token });
  } catch (e) {
    if (e.message.includes('UNIQUE')) {
      return res.status(400).json({ status: 'error', message: 'Username or email already taken' });
    }
    res.status(500).json({ status: 'error', message: e.message });
  }
});

// POST Request for Logging in a user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(401).json({ status: 'error', message: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ status: 'error', message: 'Invalid credentials' });

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ status: 'success', userId: user.id, token });
});

module.exports = router;
