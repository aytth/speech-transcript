const express = require('express');
const multer = require('multer');
const fs = require('fs');
const db = require('../db');
const auth = require('../middleware/auth');
const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const upload = multer({ dest: 'uploads/' });
const router = express.Router();

// POST Request for Uploading a new audio file
router.post('/upload', auth, upload.single('audio'), async (req, res) => {
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: 'whisper-1',               
      response_format: 'verbose_json'   
    });
    fs.unlinkSync(req.file.path);
    const stmt = db.prepare(`
      INSERT INTO transcripts (user_id, transcript_json)
      VALUES (?, ?)
    `);
    const info = stmt.run(req.user.userId, JSON.stringify(transcription));
    res.json({ id: info.lastInsertRowid, transcription });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Transcription failed' });
  }
});

// GET Request for Fetching all the transcripts
router.get('/', auth, (req, res) => {
  const rows = db
    .prepare(`
      SELECT id, created_at, transcript_json
      FROM transcripts
      WHERE user_id = ?
      ORDER BY created_at DESC
    `)
    .all(req.user.userId);

  const result = rows.map(r => ({
    id: r.id,
    createdAt: r.created_at,
    transcription: JSON.parse(r.transcript_json)
  }));
  res.json(result);
});

// PUT Request for Updating a transcript
router.put('/:id', auth, (req, res) => {
  const { id } = req.params;
  const { transcription } = req.body;
  db.prepare(`
    UPDATE transcripts
       SET transcript_json = ?
     WHERE id = ? AND user_id = ?
  `).run(JSON.stringify(transcription), id, req.user.userId);
  res.json({ success: true });
});

module.exports = router;
