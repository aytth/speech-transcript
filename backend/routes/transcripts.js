const express = require('express');
const multer  = require('multer');
const fs      = require('fs');
const { OpenAI } = require('openai');
const db      = require('../db');
const auth    = require('../middleware/auth');
const upload = multer({ dest: 'uploads/' });
const router = express.Router();

if (typeof globalThis.File === 'undefined') {
  globalThis.File = require('node:buffer').File;
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST Request for OpenAI Whisper API Request 
router.post('/upload', auth, upload.single('audio'), async (req, res) => {
  const { path, originalname, mimetype } = req.file;
  try {
    const data = fs.readFileSync(path);
    const file = new File([data], originalname, { type: mimetype });
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      response_format: 'verbose_json',
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

// GET Request for Fetching transcripts
router.get('/', auth, (req, res) => {
  const rows = db.prepare(`
    SELECT id, created_at, transcript_json
      FROM transcripts
     WHERE user_id = ?
  ORDER BY created_at DESC
  `).all(req.user.userId);

  return res.json(
    rows.map(r => ({
      id: r.id,
      createdAt: r.created_at,
      transcription: JSON.parse(r.transcript_json),
    }))
  );
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