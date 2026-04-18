# SkillBridge AI 🚀

> An intelligent, AI-powered job matching and career assistant platform — built for India's next billion job seekers.

![SkillBridge AI](https://img.shields.io/badge/SkillBridge-AI%20Career%20Platform-7C3AED?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38BDF8?style=flat-square&logo=tailwindcss)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🧠 **AI Job Matching** | TF-IDF + cosine similarity engine matches your skills to jobs with a % score and "Matched because of Python, SQL" explanation |
| 📄 **Resume Builder** | ATS-friendly resume from your inputs. Auto-generates summary. One-click PDF download |
| 🔍 **Skill Gap Analyzer** | See which skills you're missing for any job + personalized learning path |
| 🎤 **Interview Trainer** | 3 AI personality modes · Friendly HR · Strict · Technical Expert. Radar chart feedback |
| 🌐 **Voice Input** | Speak in Hindi, Telugu, or English using Web Speech API — no API key needed |
| 💡 **Experience Converter** | "Worked in a bike shop" → Mechanical skills, Inventory management, Customer handling |
| ⚡ **Demo Mode** | One-click "Load Demo Profile" anywhere in the app — perfect for live demos |

---

## 🏃 Quick Start (30 seconds)

### Option 1: Double-click Launch (Recommended)
```
Double-click: start.bat
```
This installs all dependencies and starts both servers automatically.

### Option 2: PowerShell
```powershell
.\start.ps1
```

### Option 3: Manual

**Backend (Terminal 1):**
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm install
npm run dev
```

Then open: **http://localhost:5173**

---

## 📁 Project Structure

```
skillbridge-ai/
├── backend/
│   ├── main.py              # FastAPI entry point
│   ├── requirements.txt
│   ├── ai/
│   │   ├── matcher.py       # TF-IDF cosine similarity
│   │   └── interview_ai.py  # Question + answer improvement
│   ├── data/
│   │   └── data_store.py    # Jobs, skills, interview Q&A
│   └── routers/
│       ├── jobs.py
│       ├── resume.py
│       ├── skills.py
│       └── interview.py
├── frontend/
│   ├── src/
│   │   ├── pages/           # 7 full pages
│   │   ├── components/      # Reusable UI components
│   │   ├── services/api.js  # Axios + mock fallback
│   │   ├── context/         # Global state (localStorage)
│   │   └── data/mockData.js # Demo data
│   └── package.json
├── docs/
├── start.bat                # One-click launch (Windows)
└── start.ps1
```

---

## 🌐 App Routes

| Route | Page |
|-------|------|
| `/` | Landing page (EN + Hindi toggle) |
| `/dashboard` | Stats, job previews, quick actions |
| `/jobs` | AI Job Matching Engine |
| `/resume` | Resume Builder + PDF Download |
| `/skills` | Skill Gap Analyzer |
| `/interview` | AI Interview Trainer |
| `/profile` | Profile + Experience Converter |

---

## 🤖 API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| `POST` | `/api/match-jobs` | Match user profile to 12+ jobs |
| `GET` | `/api/jobs` | Get all sample jobs |
| `POST` | `/api/generate-resume` | Generate ATS resume + score |
| `POST` | `/api/extract-skills` | Extract skills from raw text |
| `POST` | `/api/skill-gap` | Compare skills to job requirements |
| `POST` | `/api/interview/question` | Get role-based interview question |
| `POST` | `/api/interview/improve` | Improve user's answer with AI |

Interactive API docs: **http://localhost:8000/docs**

---

## 🎯 Demo Flow (for judges)

1. Open **http://localhost:5173**
2. Click **"⚡ Load Demo Profile"** on the landing page
3. Navigate to **Job Match** → skills and matches pre-filled
4. Go to **Interview** → Load Demo → speak or type an answer
5. Check **Resume** → Load Demo → Download PDF
6. Try **Skill Gap** → see what to learn next

> 💡 The entire frontend works **without the backend running** — all AI responses gracefully fall back to rich mock data.

---

## 🔧 Requirements

- **Python**: 3.10+
- **Node.js**: 18+
- **OS**: Windows 10/11
- **Browser**: Chrome (for voice input support)

---

## 🌟 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Backend | Python FastAPI, uvicorn |
| AI | scikit-learn (TF-IDF), cosine similarity |
| State | React Context + localStorage |
| Charts | Recharts (RadarChart, progress bars) |
| Voice | Web Speech API (no API key) |
| PDF | html2pdf.js |
| Icons | Lucide React |

---

## 💬 Multilingual Support

The platform supports **English and Hindi** with a language toggle in the navbar.
Voice input works in: **English**, **Hindi (हिंदी)**, **Telugu (తెలుగు)**, and **Tamil (தமிழ்)**.

---

Built with ❤️ for Hackathon 2026 | SkillBridge AI Team
