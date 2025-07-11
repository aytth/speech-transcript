# Speech Transcript Web App

> Record your voice, get word‐level transcripts powered by Whisper, and manage your transcript history. This can be done all in one web interface!

---

## 📂 Repository Structure
```bash
├── backend/ 
│ ├── db/ # SQLite Connection
│ ├── middleware/ # auth guard
│ ├── routes/ # auth.js, transcripts.js
│ ├── uploads/ # temp audio uploads
│ ├── index.js # app entrypoint
│ └── .env # environment variables
└── frontend/ # Vite + React UI
├── src/
│ ├── components/
│ ├── style/
│ ├── App.jsx
│ └── main.jsx
├── .env # environment variables
└── vite.config.js
```

---

## 📝 Features

- **User Authentication**  
  Register/Login with username & password, JWT-protected routes.

- **Voice Recording**  
  Start/Stop audio capture in the browser with animated buttons.

- **Automatic Speech Recognition**  
  Whisper-Large-v3 via OpenAI or Hugging Face Inference API.

- **Transcript Management**  
  Save transcripts to SQLite, view & edit history.

- **Modern UI**  
  Vite + React, CSS animations, responsive design.

---

## 🛠️ Technology Stack

- **Frontend**  
  - Vite + React  
  - React Router v6, Context for auth  
  - `react-media-recorder` for audio capture  
  - `react-icons` for SVG icons  

- **Backend**  
  - Node.js + Express  
  - SQLite via `better-sqlite3`  
  - JWT (`jsonwebtoken`), bcrypt (`bcryptjs`)  
  - File upload with `multer`  
  - Whisper integration via Hugging Face Inference

---

## ⚙️ Prerequisites

- Node.js v16+ & npm  
- (Optional) Python 3.8+ for self-hosting Whisper via FastAPI  
- Hugging Face Inference token  

---



## 🚀 Live Demo
```markdown
Check out the app in action at 👉 [https://speechrec.aynproject.com]
```

---

## 🔧 Setup & Run

### 1. Clone the repo
```bash
git clone https://github.com/your-username/speech-transcript.git
cd speech-transcript
```

### 2. Backend

```bash
cd backend
npm install

npm run dev   # with nodemon
# or
npm start     # plain node
```

### 3. Frontend
```bash
cd ../frontend
npm install
npm run dev
```