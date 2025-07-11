const express = require('express')
const multer = require('multer')
const fs = require('fs')
const axios = require('axios')
const db = require('../db')
const auth = require('../middleware/auth')

const upload = multer({ dest: 'uploads/' })
const router = express.Router()

// POST Request for uploading transcripts
router.post('/upload', auth, upload.single('audio'), async (req, res) => {
  try {
    const audioData = fs.readFileSync(req.file.path)
    const hfRes = await axios({
      url: 'https://api-inference.huggingface.co/models/openai/whisper-large-v3',
      method: 'post',
      headers: {
        Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
        'Content-Type': 'audio/wav',
      },
      data: audioData,
      responseType: 'json',
    })

    fs.unlinkSync(req.file.path)
    const transcript = hfRes.data
    const info = db
      .prepare(
        'INSERT INTO transcripts (user_id, transcript_json) VALUES (?, ?)'
      )
      .run(req.user.userId, JSON.stringify(transcript))
    res.json({ id: info.lastInsertRowid, transcription: transcript })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Transcription failed' })
  }
})

// GET Request for fetching transcripts
router.get('/', auth, (req, res) => {
  const rows = db
    .prepare(
      `SELECT id, created_at, transcript_json
         FROM transcripts
        WHERE user_id = ?
     ORDER BY created_at DESC`
    )
    .all(req.user.userId)

  const result = rows.map(r => ({
    id: r.id,
    createdAt: r.created_at,
    transcription: JSON.parse(r.transcript_json),
  }))

  res.json(result)
})

router.put('/:id', auth, (req, res) => {
  const { id } = req.params
  const { transcription } = req.body

  db.prepare(
    `UPDATE transcripts
       SET transcript_json = ?
     WHERE id = ? AND user_id = ?`
  ).run(JSON.stringify(transcription), id, req.user.userId)

  res.json({ success: true })
})

module.exports = router
