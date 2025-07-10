require('dotenv').config();

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const transcriptRoutes = require('./routes/transcripts');

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// Uploading transcripts
app.use('/uploads', express.static('uploads'));

// ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/transcripts', transcriptRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
