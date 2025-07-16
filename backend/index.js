globalThis.File = require('node:buffer').File;
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
app.set('trust proxy', 1);

// CSRF Protection -> Only custom domain CORS allowed
// app.use(cors({
//   origin: 'https://speechrec.aynproject.com',
//   credentials: true
// }));

const allowed = process.env.NODE_ENV === 'development'
  ? ['http://localhost:5173']
  : ['https://speechrec.aynproject.com'];
app.use(cors({ origin: allowed, credentials: true }));

app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/api/auth',  require('./routes/auth'));
app.use('/api/transcripts', require('./routes/transcripts'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API listening on ${PORT}`));