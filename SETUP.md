# Lingofy — Setup & Run Guide

Complete instructions to get Lingofy running locally from scratch.

---

## Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| **Node.js** | ≥ 20 LTS | [nodejs.org](https://nodejs.org) |
| **npm** | ≥ 10 | Bundled with Node.js |
| **MongoDB** | Atlas (cloud) or local 6+ | Atlas cluster is pre-configured in provided `.env` |
| **Git** | Any | For cloning |

> **Note:** The backend `.env` already includes a live MongoDB Atlas URI, Groq API key, and Google Client ID for development. You can use these credentials directly — but rotate them before any public deployment.

---

## 1. Clone the Repository

```bash
git clone https://github.com/Unnati1007/Lingofy.git
cd Lingofy
```

The repo has two separate Node.js projects:

```
lingofy/
├── backend/    ← Node + Express + TypeScript
└── frontend/   ← React + Vite + TypeScript
```

---

## 2. Backend Setup

### 2.1 Install Dependencies

```bash
cd backend
npm install
```

### 2.2 Environment Variables

The backend expects a `.env` file at `backend/.env`. A working example is already present in the repo. The full list of variables:

```env
# Server
PORT=5000

# MongoDB
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/lingofy?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secret_jwt_key

# Admin seeding
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123

# Groq AI (for lesson generation)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Email (for password reset & notifications)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password     # Gmail App Password, not your real password

# Google OAuth
GOOGLE_CLIENT_ID=xxxxxxxxxx.apps.googleusercontent.com
```

**Where to get each value:**

| Variable | Where to get |
|---|---|
| `MONGO_URI` | [MongoDB Atlas](https://cloud.mongodb.com) → Clusters → Connect |
| `JWT_SECRET` | Any random string ≥ 32 characters |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) → API Keys |
| `EMAIL_USER` + `EMAIL_PASS` | Gmail → Account → Security → 2-Step Verification → App Passwords |
| `GOOGLE_CLIENT_ID` | [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials → OAuth 2.0 |

### 2.3 (Optional) Seed Admin User

If you're using a fresh MongoDB database, create the initial admin account:

```bash
npm run seed:admin
```

This reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env` and creates a user with `role: "admin"`.

### 2.4 Start Development Server

```bash
npm run dev
```

The server starts on **http://localhost:5000**.

Verify it's running:
```
GET http://localhost:5000/health
→ { "status": "ok", "message": "Lingofy API running" }
```

### 2.5 Build for Production

```bash
npm run build   # Compiles TypeScript → dist/
npm start       # Runs dist/server.js
```

---

## 3. Frontend Setup

### 3.1 Install Dependencies

```bash
cd ../frontend
npm install
```

### 3.2 Environment Variables

Create `frontend/.env`:

```env
VITE_GOOGLE_CLIENT_ID=xxxxxxxxxx.apps.googleusercontent.com
```

This **must** match the `GOOGLE_CLIENT_ID` in the backend `.env`.

> All API calls in the frontend use hardcoded `http://localhost:5000` as the base URL. If you change the backend port, search for this string and update accordingly.

### 3.3 Start Development Server

```bash
npm run dev
```

Frontend runs on **http://localhost:5173**.

### 3.4 Build for Production

```bash
npm run build   # Outputs to frontend/dist/
npm run preview # Preview the production build locally
```

---

## 4. First-Time User Flow

1. Open **http://localhost:5173**
2. Click **Get Started** → **Sign Up** → create an account
3. Complete the **Preferences** onboarding (language, genres, level)
4. You land on the **Dashboard**:
   - Music mode users see the YouTube-embedded music player with synchronized lyrics
   - Traditional mode users are redirected to the Statistics tab
5. Go to **Lessons** (sidebar) → pick a language → start a quiz

### Admin Access

Log in with the credentials set in `ADMIN_EMAIL` / `ADMIN_PASSWORD` in your `.env`. You'll be redirected to `/admin` where you can:
- Add songs (paste YouTube URL → auto-fetches captions)
- Auto-translate lyrics to Hindi/Spanish
- View all users and their quiz attempts
- See HCI comparison analytics (Music vs Traditional mode)
- Send notifications to users

---

## 5. Available Scripts

### Backend (`backend/`)

| Script | Command | Description |
|---|---|---|
| Dev | `npm run dev` | Starts `nodemon` + `ts-node` with hot-reload |
| Build | `npm run build` | Compiles TypeScript to `dist/` |
| Start | `npm start` | Runs compiled production build |
| Seed Admin | `npm run seed:admin` | Creates initial admin user from `.env` |

### Frontend (`frontend/`)

| Script | Command | Description |
|---|---|---|
| Dev | `npm run dev` | Vite dev server with HMR |
| Build | `npm run build` | TypeScript check + Vite production build |
| Preview | `npm run preview` | Preview production build locally |
| Lint | `npm run lint` | ESLint check |

---

## 6. Troubleshooting

| Problem | Fix |
|---|---|
| `Cannot connect to MongoDB` | Check `MONGO_URI` — ensure IP is whitelisted in Atlas Network Access |
| `Google login fails` | Ensure `GOOGLE_CLIENT_ID` matches in both `.env` files, and `http://localhost:5173` is in the OAuth Consent Screen's allowed origins |
| `Lesson generation fails` | Check `GROQ_API_KEY` is valid. The service retries once on failure |
| `Email not sending` | Ensure Gmail App Password is used (not your real password). 2FA must be enabled on the Gmail account |
| `YouTube player blank` | The YouTube IFrame API loads asynchronously. Wait 2–3 seconds or refresh |
| `CORS error` | Backend `app.ts` uses `cors()` with no origin restriction — should work. Ensure backend is running on port 5000 |
| TypeScript errors on startup | Run `npm install` again to ensure `@types/*` packages are present |
