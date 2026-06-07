# PageTurn — eBook Publishing Platform

A full-stack MERN eBook platform where publishers upload and monetize books, and readers purchase and read them securely in-app (no PDF downloads).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, Tailwind CSS, Zustand, PDF.js |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Storage | Cloudinary (PDFs + covers) |
| Auth | JWT (access + refresh) + OTP email |
| Payments | Razorpay |

---

## Project Structure

```
ebook-platform/
├── backend/
│   ├── config/         # DB + Cloudinary config
│   ├── controllers/    # Auth, Book, Publisher, Reader, Payment, Review
│   ├── middleware/     # JWT auth middleware
│   ├── models/         # User, Book, Order, Review
│   ├── routes/         # All API routes
│   ├── utils/          # JWT helpers, Email (OTP)
│   ├── server.js
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/ # Navbar, Toast, BookCard, Skeleton
    │   ├── pages/      # All pages (Home, Browse, Reader, Library, etc.)
    │   ├── store/      # Zustand auth store
    │   └── utils/      # Axios instance with interceptors
    ├── index.html
    └── vite.config.js
```

---

## Setup Guide

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)
- Cloudinary account (free tier works)
- Razorpay account (test mode)
- Gmail account (for OTP emails)

---

### 1. Clone / open the project

Open the `ebook-platform` folder in VS Code.

---

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and fill in all values:

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/ebook-platform
JWT_SECRET=<any long random string>
JWT_REFRESH_SECRET=<another long random string>
CLOUDINARY_CLOUD_NAME=<your cloudinary cloud name>
CLOUDINARY_API_KEY=<your cloudinary api key>
CLOUDINARY_API_SECRET=<your cloudinary api secret>
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<your gmail>
EMAIL_PASS=<your gmail app password>   # Use App Password, not your real password
RAZORPAY_KEY_ID=<rzp test key>
RAZORPAY_KEY_SECRET=<rzp test secret>
FRONTEND_URL=http://localhost:5173
```

> **Gmail App Password**: Go to Google Account → Security → 2-Step Verification → App Passwords → create one for "Mail".

Start backend:
```bash
npm run dev     # development (nodemon)
npm start       # production
```

Backend runs on **http://localhost:5000**

---

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**

> The Vite dev server proxies `/api/*` requests to `http://localhost:5000` automatically.

---

### 4. Razorpay (payments)

1. Sign up at razorpay.com and get test Key ID + Secret
2. Add them to `.env`
3. In `BookDetailPage.jsx`, the Razorpay checkout script is loaded via a `<script>` tag. For production, add it to `index.html` instead.

---

### 5. Cloudinary (file storage)

1. Create a free Cloudinary account
2. Copy Cloud Name, API Key, API Secret from the dashboard
3. Add to `.env`

PDFs are stored as `raw` resource type. Signed URLs expire in 1 hour — readers cannot download the raw file.

---

## API Reference

### Auth
| Method | Route | Description |
|---|---|---|
| POST | /api/auth/register | Register (sends OTP) |
| POST | /api/auth/verify-otp | Verify email OTP |
| POST | /api/auth/login | Login |
| POST | /api/auth/resend-otp | Resend OTP |
| POST | /api/auth/refresh-token | Refresh access token |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/me | Get current user |

### Books (public)
| Method | Route | Description |
|---|---|---|
| GET | /api/books | Browse + search + filter |
| GET | /api/books/featured | Featured books |
| GET | /api/books/:id | Book details |
| GET | /api/books/:id/read | Get signed PDF URL (auth) |

### Publisher (publisher role required)
| Method | Route | Description |
|---|---|---|
| GET | /api/publisher/dashboard | Stats + analytics |
| GET | /api/publisher/books | My books |
| POST | /api/publisher/books | Upload book (multipart) |
| PUT | /api/publisher/books/:id | Update book |
| PUT | /api/publisher/books/:id/publish | Publish draft |
| DELETE | /api/publisher/books/:id | Delete book |

### Reader (auth required)
| Method | Route | Description |
|---|---|---|
| GET | /api/reader/library | Purchased books |
| GET | /api/reader/orders | Purchase history |
| GET | /api/reader/progress/:bookId | Reading progress |
| PUT | /api/reader/progress/:bookId | Save progress |

### Payments (auth required)
| Method | Route | Description |
|---|---|---|
| POST | /api/payment/create-order | Create Razorpay order |
| POST | /api/payment/verify | Verify payment signature |

### Reviews
| Method | Route | Description |
|---|---|---|
| GET | /api/reviews/:bookId | Get reviews |
| POST | /api/reviews/:bookId | Post review (must own book) |
| DELETE | /api/reviews/:reviewId | Delete own review |

---

## Key Security Features

- **JWT access tokens** expire in 15 minutes; refresh tokens in 7 days
- **Signed Cloudinary URLs** expire in 1 hour — PDFs cannot be directly accessed
- **PDF streamed page-by-page** via PDF.js — no full file download
- **Right-click disabled** on reader canvas
- **Backend authorization** checked before serving any PDF URL
- **Rate limiting** on all routes (200/15min global, 10/15min on auth)
- **Helmet** security headers
- **Input validation** with express-validator

---

## Deployment

### Backend (Railway / Render)
1. Push backend folder to GitHub
2. Create new service, connect repo
3. Set all environment variables
4. Set start command: `node server.js`

### Frontend (Vercel)
1. Push frontend folder to GitHub
2. Import to Vercel
3. Set `VITE_API_URL` if needed, or update `vite.config.js` proxy for production
4. Build command: `npm run build`, output: `dist`

---

## License
MIT
