const express = require('express');
const multer = require('multer');
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');
const db = require('../db');
const auth = require('../middleware/auth');
const upload = multer({ dest: 'uploads/' });
const router = express.Router();

// POST Request for Uploading transcripts
router.post('/upload', auth, upload.single('audio'), async (req, res) => {
  const localPath = req.file.path;
  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(localPath));

    const asrRes = await axios.post(
      'http://127.0.0.1:8000/transcribe',
      form,
      { headers: form.getHeaders() }
    );

    fs.unlinkSync(localPath);

    const transcription = asrRes.data.text;
    const info = db
      .prepare(
        'INSERT INTO transcripts (user_id, transcript_json) VALUES (?, ?)'
      )
      .run(req.user.userId, JSON.stringify({ text: transcription }));

    return res.json({ id: info.lastInsertRowid, transcription });
  } catch (err) {
    console.error('Transcription error:', err.message);
    if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
    return res.status(500).json({ error: 'Transcription failed' });
  }
});

// GET Request for Fetching transcripts
router.get('/', auth, (req, res) => {
  const rows = db
    .prepare(
      `SELECT id, created_at, transcript_json
         FROM transcripts
        WHERE user_id = ?
     ORDER BY created_at DESC`
    )
    .all(req.user.userId);

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
  db.prepare(
    `UPDATE transcripts
       SET transcript_json = ?
     WHERE id = ? AND user_id = ?`
  ).run(JSON.stringify(transcription), id, req.user.userId);

  return res.json({ success: true });
});

module.exports = router;
