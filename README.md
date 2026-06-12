# 📚 ReadSphere — AI-Powered eBook Platform

> A full-stack AI-powered eBook platform where users can upload, read, summarize, and chat with any PDF — all in one place.

![ReadSphere](https://img.shields.io/badge/ReadSphere-AI%20eBook%20Platform-orange)
![MERN](https://img.shields.io/badge/Stack-MERN-green)
![Groq AI](https://img.shields.io/badge/AI-Groq%20LLaMA%203.3-blue)

🔗 **Live Demo:** https://read-sphere-mu.vercel.app
🔧 **Backend API:** https://readsphere-backend.onrender.com

---

## 🚀 Features

- 📖 **Browse & Read eBooks** — Read any book directly in the browser for free
- 🤖 **AI Summary** — Upload any PDF and get instant AI-generated summary
- 💬 **Chat with PDF** — Ask any question about your PDF and get instant AI answers
- 📤 **Upload Books** — Any user can upload eBooks with cover images and preview before publishing
- 🔐 **Authentication** — JWT-based auth + Google OAuth login
- 🔄 **Dual Roles** — Every user can read AND publish books on the same account
- 📊 **Publisher Dashboard** — Track books, sales, and performance
- 🌙 **Beautiful Dark UI** — Modern dark theme with orange gradient design
- 📱 **Fully Responsive** — Works on all devices

---

## 🛠️ Tech Stack

### Frontend
- React.js + Vite
- Tailwind CSS
- PDF.js (for book reading)

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Passport.js (Google OAuth)
- Nodemailer (OTP emails)

### AI
- Groq API (LLaMA 3.3 70B)
- pdf2json (PDF text extraction)

### Storage
- Cloudinary (Cover images + PDF files)

### Deployment
- Frontend: Vercel
- Backend: Render
- Database: MongoDB (Railway)

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or hosted)
- Cloudinary account
- Groq API key
- Google OAuth Client ID & Secret
- Gmail account (for OTP emails)

### 1. Clone the repository
```bash
git clone https://github.com/antidotewinn/ReadSphere-.git
cd ReadSphere-
```

### 2. Setup Backend
```bash
cd backend
npm install --legacy-peer-deps
```

Create `.env` file in backend folder:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ebook-platform
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
GROQ_API_KEY=your_groq_api_key
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Start backend:
```bash
node server.js
```

### 3. Setup Frontend
```bash
cd frontend
npm install
```

Create `.env` file in frontend folder:
```env
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev
```

### 4. Open in browser
```
http://localhost:5173
```

---

## 🤖 How AI Works

1. User uploads a PDF
2. Backend extracts text using `pdf2json`
3. Text is sent to **Groq API** (LLaMA 3.3 70B model)
4. AI generates summary or answers questions
5. Response is displayed instantly

---

## 📸 Pages

- **Home** — Landing page with AI features showcase
- **Browse** — Browse all available books
- **AI Summary** — Upload PDF → Get AI summary
- **Chat PDF** — Upload PDF → Ask questions
- **Library** — View all books
- **Login/Register** — Email + Google OAuth authentication
- **Publisher Dashboard** — Manage books and track performance
- **Reader** — In-browser PDF reader with bookmarks and progress tracking

---

## 👤 User Roles

Every registered user can:
- **Read** — Browse, read, and use AI features
- **Publish** — Upload books, manage library, view dashboard

No separate accounts needed — one account, all features!

---

## 🚀 Deployment

- Frontend: [Vercel](https://vercel.com)
- Backend: [Render](https://render.com)
- Database: [MongoDB on Railway](https://railway.app)

---

## 📄 License

MIT License — feel free to use this project for learning and portfolio purposes.

---

## 👩‍💻 Built By

**Vinisha Srivastava** — BCA Student | Full Stack Developer

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue)](https://linkedin.com)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-black)](https://github.com/antidotewinn)
