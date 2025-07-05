const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const db = require('../db');
const axios = require('axios');
const fs = require('fs');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

function auth(req, res, next) {
  const h = req.headers.authorization?.split(' ')[1];
  if (!h) return res.status(401).end();
  try {
    req.user = jwt.verify(h, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).end();
  }
}

router.post('/upload', auth, upload.single('audio'), async (req, res) => {
  const { path, mimetype } = req.file;
  const OpenAI = require('openai').OpenAI;
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const transcription = await client.audio.transcriptions.create({
    file: fs.createReadStream(path),
    model: 'whisper-1',
    response_format: 'verbose_json'
  });
  fs.unlinkSync(path);

  const stmt = db.prepare('INSERT INTO transcripts (user_id, transcript_json) VALUES (?, ?)');
  const info = stmt.run(req.user.userId, JSON.stringify(transcription));
  res.json({ id: info.lastInsertRowid, transcription });
});

router.get('/', auth, (req, res) => {
  const rows = db.prepare('SELECT id, created_at, transcript_json FROM transcripts WHERE user_id = ?').all(req.user.userId);
  res.json(rows.map(r => ({ ...r, transcription: JSON.parse(r.transcript_json) })));
});

router.put('/:id', auth, (req, res) => {
  const { id } = req.params;
  const { transcription } = req.body;
  db.prepare('UPDATE transcripts SET transcript_json = ? WHERE id = ? AND user_id = ?')
    .run(JSON.stringify(transcription), id, req.user.userId);
  res.json({ success: true });
});

module.exports = router;
