const jwt = require('jsonwebtoken');

module.exports = function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Missing Authorization header' });

  const [, token] = header.split(' ');
  if (!token) return res.status(401).json({ error: 'Malformed token' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;        // { userId: ... }
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};
