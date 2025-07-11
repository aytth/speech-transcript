const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();
const SALT_ROUNDS = 12;

// POST Request for Register
router.post('/register', async (req, res) => {
  let { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ status: 'error', message: 'Missing fields' });
  }

  username = username.trim();
  email = email.trim().toLowerCase();

  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);

    const stmt = db.prepare(
      'INSERT INTO users (username, email, password_hash) VALUES (?,?,?)'
    );
    const info = stmt.run(username, email, hash);

    const token = jwt.sign(
      { userId: info.lastInsertRowid },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      status: 'success',
      userId: info.lastInsertRowid,
      token
    });
  } catch (e) {
    if (/UNIQUE/.test(e.message)) {
      return res
        .status(400)
        .json({ status: 'error', message: 'Username or email already taken' });
    }
    return res.status(500).json({ status: 'error', message: e.message });
  }
});

// POST Request for Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ status: 'error', message: 'Missing credentials' });
  }

  const user = db
    .prepare('SELECT * FROM users WHERE username = ?')
    .get(username.trim());
  if (!user) {
    return res
      .status(401)
      .json({ status: 'error', message: 'Invalid username or password' });
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return res
      .status(401)
      .json({ status: 'error', message: 'Invalid username or password' });
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
  return res.json({ status: 'success', userId: user.id, token });
});

module.exports = router;
