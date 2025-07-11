require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
app.set('trust proxy', 1);

// CSRF Protection -> Only custom domain CORS allowed
app.use(cors({
  origin: 'https://speechrec.aynproject.com',
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/api/auth',  require('./routes/auth'));
app.use('/api/transcripts', require('./routes/transcripts'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API listening on ${PORT}`));