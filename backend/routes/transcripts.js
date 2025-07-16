const express = require('express');
const multer  = require('multer');
const fs      = require('fs');
const { OpenAI } = require('openai');
const db      = require('../db');
const auth    = require('../middleware/auth');

const upload = multer({ dest: 'uploads/' });
const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST Request for fetching whisper model API thru OpenAI
router.post('/upload', auth, upload.single('audio'), async (req, res) => {
  const path = req.file.path;
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(path),
      model: 'whisper-1',
      response_format: 'verbose_json'
    });

    fs.unlinkSync(path);
    const info = db.prepare(
      'INSERT INTO transcripts (user_id, transcript_json) VALUES (?,?)'
    ).run(req.user.userId, JSON.stringify(transcription));
    return res.json({ id: info.lastInsertRowid, transcription });
  } catch (e) {
    console.error('OpenAI Whisper error:', e);
    if (fs.existsSync(path)) fs.unlinkSync(path);
    return res.status(500).json({ error: 'Transcription failed' });
  }
});

// GET Request for Storing transcripts
router.get('/', auth, (req, res) => {
  const rows = db.prepare(`
    SELECT id, created_at, transcript_json
      FROM transcripts
     WHERE user_id = ?
  ORDER BY created_at DESC
  `).all(req.user.userId);

  const result = rows.map(r => ({
    id: r.id,
    createdAt: r.created_at,
    transcription: JSON.parse(r.transcript_json)
  }));
  return res.json(result);
});

// PUT Request for Storing transcripts
router.put('/:id', auth, (req, res) => {
  const { id } = req.params;
  const { transcription } = req.body;

  db.prepare(`
    UPDATE transcripts
       SET transcript_json = ?
     WHERE id = ? AND user_id = ?
  `).run(JSON.stringify(transcription), id, req.user.userId);

  return res.json({ success: true });
});

module.exports = router;