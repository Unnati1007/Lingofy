# Lingofy — Architecture Deep Dive

This document explains how the codebase is organized, how the frontend and backend communicate, and how each major module works.

---

## Table of Contents

1. [High-Level Architecture](#1-high-level-architecture)
2. [Request Flow Diagram](#2-request-flow-diagram)
3. [Authentication Flow](#3-authentication-flow)
4. [Backend Architecture](#4-backend-architecture)
5. [Frontend Architecture](#5-frontend-architecture)
6. [Key Modules Explained](#6-key-modules-explained)
7. [Database Schema](#7-database-schema)
8. [Environment Variables Reference](#8-environment-variables-reference)
9. [Known Limitations & TODOs](#9-known-limitations--todos)

---

## 1. High-Level Architecture

Lingofy is a **monorepo** containing two separate Node.js projects:

```
lingofy/
├── backend/   (Express REST API, TypeScript, MongoDB)
└── frontend/  (React SPA, TypeScript, Vite)
```

They communicate exclusively via **HTTP REST API** calls. The frontend fetches data from the backend using the Fetch API (native browser), sending JWT tokens in `Authorization: Bearer <token>` headers.

### External Services Used

| Service | What For |
|---|---|
| **MongoDB Atlas** | Primary database (all models) |
| **Groq API (LLaMA 3.3-70B)** | AI-powered quiz and lesson generation |
| **YouTube IFrame API** | Music playback in the dashboard |
| **youtube-transcript npm** | Fetching song lyrics when admins add a song |
| **Google Translate (unofficial)** | Auto-translating lyrics to Hindi/Spanish/Korean |
| **Google OAuth 2.0** | Social login (ID token or access token path) |
| **Gmail SMTP (Nodemailer)** | Password reset codes and admin notification emails |
| **Web Speech API (browser)** | Pronunciation mode microphone capture |
| **SpeechSynthesis API (browser)** | Text-to-speech for `listen_translate` quiz questions |

---

## 2. Request Flow Diagram

```
User Action (browser)
        │
        ▼
React Component (e.g., LessonsPage.tsx)
        │  fetch('http://localhost:5000/api/lessons/generate', { ... })
        │  Headers: { Authorization: 'Bearer <JWT>' }
        ▼
Express Router (backend/src/routes/lessons.ts)
        │
        ▼
authMiddleware.protect()
  ├─ Extracts token from Authorization header
  ├─ jwt.verify(token, JWT_SECRET)
  ├─ Loads req.user = await User.findById(decoded.id)
  └─ Calls next()
        │
        ▼
Route Handler (inline or controller)
  ├─ Validates input
  ├─ Calls service layer (e.g., lessonService.generateLesson())
  │     └─ Calls Groq API → parses JSON → returns questions
  ├─ Persists to MongoDB (LessonAttempt.create(...))
  └─ Returns JSON response
        │
        ▼
React Component receives JSON
  └─ Updates state → React re-renders UI
```

---

## 3. Authentication Flow

### 3.1 Email/Password Registration

```
POST /api/auth/register
  { name, email, password }
        │
        ▼
User.create({ name, email, password, role: 'user' })
  └─ UserSchema pre-save hook:
       bcryptjs.hash(password, 10)  ← hashes password before DB insert
        │
        ▼
generateToken(user._id, user.email)
  └─ jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '30d' })
        │
        ▼
Response: { _id, name, email, role, learningMode, hasPreferences, token }
```

### 3.2 Email/Password Login

```
POST /api/auth/login
  { email, password }
        │
        ▼
User.findOne({ email })
user.comparePassword(password)
  └─ bcryptjs.compare(candidatePassword, hashedPassword)
        │
        ▼
Check UserPreferences.findOne({ userId })  ← sets hasPreferences flag
        │
        ▼
Response: { _id, name, email, role, learningMode, hasPreferences, token }
```

### 3.3 Google OAuth Login

Two paths are supported (both hit `POST /api/auth/google`):

**Path A — ID Token (credential):**
```
Frontend @react-oauth/google → credential (ID token)
  → Backend: client.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID })
  → Extract { email, name, sub: googleId } from payload
```

**Path B — Access Token (useGoogleLogin hook):**
```
Frontend useGoogleLogin → access_token
  → Backend: GET https://www.googleapis.com/oauth2/v3/userinfo
             Authorization: Bearer <access_token>
  → Extract { email, name } from userinfo response
```

In both cases:
- If user doesn't exist → `User.create(...)` with a random secure password
- If user exists but `googleId` not set → link the Google account
- Generate JWT and return same shape as email login

### 3.4 Forgot Password Flow

```
POST /api/auth/forgot-password  { email }
  → Generate 6-digit code, store in user.resetPasswordCode + resetPasswordExpires (+15 min)
  → Send email via Nodemailer (falls back to console.log if SMTP fails)

POST /api/auth/verify-code  { email, code }
  → User.findOne({ email, resetPasswordCode: code, resetPasswordExpires: { $gt: now } })

POST /api/auth/reset-password  { email, code, newPassword }
  → Same validation → user.password = newPassword → save (triggers bcrypt pre-save hook)
  → Clear resetPasswordCode and resetPasswordExpires
```

### 3.5 Protected Routes

Every protected endpoint goes through `authMiddleware.protect()`:

```typescript
// backend/src/middleware/authMiddleware.ts
export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token, JWT_SECRET);
  req.user = await User.findById(decoded.id).select('-password');
  next();
};
```

Admin-only routes additionally call `authMiddleware.admin()` or `roleMiddleware.adminOnly()`:

```typescript
export const admin = (req, res, next) => {
  if (req.user?.role === 'admin') next();
  else res.status(401).json({ message: 'Not authorized as an admin' });
};
```

### 3.6 Token Storage (Frontend)

JWT tokens are stored in `localStorage` under the key `'token'`. All protected API calls read this token:

```typescript
const token = localStorage.getItem('token');
fetch('/api/...', { headers: { Authorization: `Bearer ${token}` } });
```

---

## 4. Backend Architecture

### 4.1 Entry Points

| File | Role |
|---|---|
| `src/server.ts` | Calls `connectDB()`, then `app.listen(PORT)` |
| `src/app.ts` | Creates Express app, adds global middleware, mounts all routers |
| `src/config/db.ts` | Mongoose connection logic |
| `src/config/env.ts` | Typed wrapper for `process.env` variables |

### 4.2 Route Mounting

```typescript
// app.ts
app.use('/api/auth',             authRoutes);
app.use('/api/users',            userRoutes);
app.use('/api/preferences',      preferenceRoutes);
app.use('/api/admin',            songRoutes);          // songs + user admin
app.use('/api/admin/analytics',  analyticsRoutes);
app.use('/api/lessons',          lessonsRouter);
app.use('/api/playlists',        playlistRoutes);
app.use('/api/notifications',    notificationRoutes);
app.get('/health', ...)
```

### 4.3 Middleware Stack (per request)

```
cors()                     → Allow cross-origin from frontend
express.json()             → Parse JSON body
express.urlencoded()       → Parse form data
protect() [on protected routes] → Validate JWT, attach req.user
adminOnly() [on admin routes]   → Check req.user.role === 'admin'
```

### 4.4 Services Layer

Business logic is split into service files separate from controllers/routes:

| Service | Responsibility |
|---|---|
| `lessonService.ts` | Builds detailed LLM prompts for standard lessons and song-based lessons, calls Groq API, retries on parse failure |
| `focusAreaService.ts` | Builds prompts for focus-area practice (Vocabulary / Listening / Grammar / Culture), shuffles options client-side |

Both services use `groq-sdk` with model `llama-3.3-70b-versatile`, `temperature: 1.0`, and a retry-once strategy if JSON parsing fails.

---

## 5. Frontend Architecture

### 5.1 Routing (App.tsx)

```
/              → LandingPage      (public)
/login         → LoginPage        (public)
/signup        → SignupPage       (public)
/preferences   → PreferencesPage  (soft-protected — redirects if no token in localStorage)
/dashboard     → DashboardPage    (protected)
/lessons       → LessonsPage      (protected)
/admin         → AdminDashboard   (protected + admin role)
```

Route protection is handled manually inside each page component by checking `localStorage.getItem('token')` and calling `navigate('/login')` if absent.

### 5.2 State Management

The app has **no global state library** (no Redux, no Zustand, no React Context). All state is local component state (`useState`, `useRef`) inside each page component.

This means:
- `DashboardPage.tsx` (3,127 lines) and `LessonsPage.tsx` (1,576 lines) are very large monolithic components
- Data is re-fetched on each page mount via `useEffect`

### 5.3 Pages Overview

#### `DashboardPage.tsx`
The main application page. Tabs: **Home | Statistics | Library | Profile | Achievements | Docs**.

- **Home tab** — YouTube music player (via `window.YT.Player`), synchronized scrolling lyrics, translation overlay, song queue, playlist widget, language roadmap progress cards, quiz-after-song modal
- **Statistics tab** — Quiz history list, score trend line chart (SVG, no chart library), activity streak heatmap (custom), attempt drill-down modal
- **Library tab** — Create/view/delete playlists, add songs to playlists
- **Profile tab** — Edit name, languages, age, daily goal, proficiency, profession, about
- **Achievements tab** — Badge display with share to WhatsApp/Instagram via Web Share API
- **Session Timer** — Background `setInterval` counting seconds; fires goal-met toast when `sessionTime >= dailyGoal * 60`

#### `LessonsPage.tsx`
Multi-view state machine: `setup → loading → quiz → hci_form → results`.

- **Setup view** — Language picker cards (Hindi/Spanish/Korean) with progress bars and badge preview
- **Roadmap view** — 5 nodes: Easy Basics, Intermediate Grammar, Advanced Quiz 1/2/3. Horizontal connector line with gradient fill based on completion
- **Focus Area tab** — Pick area (Vocabulary / Listening / Grammar / Culture), then start an AI-generated focused quiz
- **Pronunciation tab** — Opens `PronunciationSettingsModal`, then starts a special quiz type where Web Speech API records the user saying foreign phrases. Levenshtein distance scoring: `score = max(0, 100 - (distance/maxLen)*100)`
- **Quiz view** — Renders one question at a time: multiple_choice, fill_blank, translate_word, match_meaning, listen_translate (TTS via `SpeechSynthesisUtterance`)
- **HCI Form** — After last question, captures `cognitiveLoad` (1-5 Likert) and `reflectionText` before submitting
- **Results view** — Per-question breakdown with correct/wrong indicators and explanations

#### `AdminDashboard.tsx`
Admin-only. Sections:
- **Song Management** — Add songs (title, artist, language, YouTube URL), view all songs, trigger auto-translate
- **User Management** — List all users, view individual quiz attempts
- **Analytics** — Music vs Traditional mode comparison: avg. score, accuracy %, XP, dropout rate, time per question
- **Notifications** — Send in-app + optional email notification to any user
- **Song Suggestions** — AI-curated list based on which languages have the most learners

#### `PreferencesPage.tsx`
Onboarding wizard collecting: `languagesToLearn[]`, `favoriteGenres[]`, `favoriteArtists[]`, `vocabularyLevel`, `grammarFocus`, `phraseLearning`, `sessionGoalMinutes`. Saved to `UserPreferences` collection.

#### `LoginPage.tsx`
Email/password form + Google OAuth button. On success, stores token in `localStorage` and navigates to `/dashboard` (or `/admin` if role is admin).

### 5.4 Component Library

| Component | Location | Purpose |
|---|---|---|
| `AudioToggle` | `components/common/` | Toggle button for audio on/off |
| `Button` | `components/common/` | Reusable styled button |
| `ProgressBar` | `components/common/` | Animated progress indicator |
| `Flashcard` | `components/learning/` | Flashcard UI for vocabulary |
| `InteractiveLyrics` | `components/learning/` | Highlighted lyric viewer |
| `LyricsLearning` | `components/learning/` | Lyrics with learning overlay |
| `PronunciationSettingsModal` | `components/learning/` | Settings modal before pronunciation quiz |
| `TextLearning` | `components/learning/` | Text-based learning mode |

### 5.5 Frontend Dependencies (Rationale)

| Package | Why Used |
|---|---|
| `react-router-dom v7` | Client-side navigation; `useNavigate` + `useLocation` used heavily |
| `framer-motion` | Page transitions, animated quiz cards, celebration popup animations |
| `lucide-react` | Consistent icon set (sidebar icons, action buttons) |
| `@react-oauth/google` | `GoogleOAuthProvider` wrapper + `useGoogleLogin` hook |
| `recharts` | Imported but replaced with custom SVG charts in practice (unused dependency) |
| `axios` | Imported in frontend but not used (all calls use native `fetch`) |

---

## 6. Key Modules Explained

### 6.1 Lesson Generation Pipeline

```
User clicks "Start Quiz"
  │
  ▼
Frontend: POST /api/lessons/generate
  { language: 'hindi', level: 'easy' }
  │
  ▼
Backend route handler (lessons.ts):
  1. Fetch past 20 LessonAttempts → extract seen words (uniquePreviousWords)
  2. Count total attempts at this level (for progressive difficulty)
  3. If learningMode === 'music':
       - Pick 2 random Songs in DB for that language
       - Sample 10 LyricSegments → extract text phrases
  4. Call lessonService.generateLesson(language, level, previousWords, attemptCount, isMusicMode, musicPhrases)
        └─ Builds prompt with:
              - Random session seed (ensures variety)
              - 3 random topic categories
              - Level description (progressive: "Quiz 1 of 2", "Quiz 2 of 2", etc.)
              - Banned words list (previously seen vocabulary)
              - Music-specific instructions (4 listen_translate + 2 phrase translate_word)
              - Script-specific rules (Devanagari for Hindi, Hangul for Korean, accents for Spanish)
        └─ Calls Groq API (LLaMA 3.3-70B, temp=1.0, max_tokens=2000)
        └─ Retry once if JSON parse fails
  5. Sanitize: ensure correctAnswer is always set
  6. LessonAttempt.create({ userId, language, level, questions, status: 'in_progress' })
  7. Return { lessonTitle, language, questions, attemptId }
```

### 6.2 Lesson Submission & Badge Logic

```
User finishes quiz → POST /api/lessons/submit
  { attemptId, language, level, questions, userAnswers, totalTimeSpentSeconds, cognitiveLoad, reflectionText }
  │
  ▼
Find existing LessonAttempt by attemptId (must belong to req.user)
  │
  ▼
Score calculation:
  - For each userAnswer: compare to question.correctAnswer (case-insensitive)
  - Hindi translate_word: also check alternatives extracted from explanation via regex /'([^']+)'/g
  - XP = correctAnswers * 10
  │
  ▼
Update attempt: status='completed', completedAt=now, score, xpEarned, avgTimePerTextQuestionSeconds
  │
  ▼
Badge check (if score >= 5):
  - Count past passing attempts for this language by level
  - easy attempt #1 → 'Easy Explorer' badge
  - intermediate attempt #2 → 'Intermediate Scholar' badge
  - hard attempt #3 → 'Language Star' badge
  - focus attempt #1 → 'Focus Scholar' badge
  - pronunciation attempt #1 → 'Pronunciation Master' badge
  - If badge unlocked → Notification.create({ userId, title: 'Badge Unlocked! 🎉', message })
  │
  ▼
Return { score, total, xpEarned, results[] }
```

### 6.3 Song Addition (Admin)

```
Admin: POST /api/admin/song
  { title, artistName, language, audioUrl, youtubeUrl?, lyrics? }
  │
  ▼
Song.create(...)   ← stores song metadata
  │
  ▼
If youtubeUrl provided:
  YoutubeTranscript.fetchTranscript(youtubeUrl)
    → maps to LyricSegment[] with segmentOrder, text, startTime, endTime
  Update song.durationSeconds = lastSegment.endTime
  │
  If no YouTube captions AND manual lyrics[] provided:
    → Create segments with estimated 3.5s per line + 15s intro buffer
  │
  ▼
LyricSegment.insertMany(segments)

Admin: POST /api/admin/translate/:songId
  → For each LyricSegment:
       translateText(seg.text, 'en') → google unofficial translate API
       translateText(seg.text, 'hi')
       translateText(seg.text, 'es')
  → Save translations to Song.translations.{ english[], hindi[], spanish[] }
```

### 6.4 Roadmap Progress Calculation

```
GET /api/lessons/progress
  │
  ▼
LessonAttempt.find({ userId, score: { $gte: 5 } })
  │
  ▼
Per language (hindi, spanish, korean):
  easyCount        = attempts with level='easy' or 'beginner'
  intermediateCount = attempts with level='intermediate'
  hardCount        = attempts with level='hard'
  focusCount       = attempts with level='focus'
  pronunciationCount = attempts with level='pronunciation'
  │
  ▼
Badges:
  easyCount >= 1                           → 'easy_explorer' + advance to 'intermediate'
  intermediateCount >= 2 && easyCount >= 1 → 'intermediate_scholar' + advance to 'hard'
  hardCount >= 3 && inter >= 2 && easy >= 1 → 'language_star' + 'completed'
  focusCount >= 1                          → 'focus_scholar'
  pronunciationCount >= 1                  → 'Pronunciation Master'
  │
  ▼
Return { hindi: {...}, spanish: {...}, korean: {...} }
```

---

## 7. Database Schema

### Users Collection (`User`)

| Field | Type | Notes |
|---|---|---|
| `name` | String | Required |
| `email` | String | Unique, lowercase |
| `password` | String | bcrypt hashed (min length 6) |
| `nativeLanguage` | String | Optional |
| `learningLanguage` | String | Optional |
| `age` | Number | 0–120 |
| `dailyGoal` | Number | Minutes/day, default 15 |
| `proficiency` | Enum | `beginner \| intermediate \| advanced` |
| `researchConsent` | Boolean | Default false |
| `role` | Enum | `user \| admin`, default `user` |
| `learningMode` | Enum | `music \| traditional`, default `music` |
| `resetPasswordCode` | String | 6-digit code, transient |
| `resetPasswordExpires` | Date | +15 minutes from issue |
| `googleId` | String | Sparse unique (Google OAuth) |
| `about` | String | Profile bio |
| `mobile` | String | Phone number |
| `profession` | String | Occupation |
| `knownLanguages` | String[] | Array of language names |
| `username` | String | Display name alias |
| `createdAt`, `updatedAt` | Date | Auto (timestamps) |

**Instance Methods:**
- `comparePassword(candidatePassword)` → `bcryptjs.compare(...)`

**Hooks:**
- `pre('save')` → hash password if modified

---

### UserPreferences Collection (`UserPreferences`)

| Field | Type | Notes |
|---|---|---|
| `userId` | ObjectId → User | Required, unique |
| `languagesToLearn` | String[] | e.g., `['Hindi']` |
| `favoriteGenres` | String[] | Music genres |
| `favoriteArtists` | String[] | Artist names |
| `vocabularyLevel` | Enum | `beginner \| intermediate \| advanced` |
| `grammarFocus` | Boolean | Default false |
| `phraseLearning` | Boolean | Default true |
| `sessionGoalMinutes` | Number | 5–180, default 15 |

---

### Songs Collection (`Song`)

| Field | Type | Notes |
|---|---|---|
| `artistName` | String | Required |
| `title` | String | Required |
| `language` | String | Required (e.g., 'Hindi', 'English') |
| `durationSeconds` | Number | Required |
| `audioUrl` | String | YouTube URL or direct audio URL |
| `instrumentalUrl` | String | Optional separate instrumental track |
| `bpm` | Number | Optional |
| `difficultyLevel` | Enum | `beginner \| intermediate \| advanced` |
| `albumId` | ObjectId → Album | Optional |
| `artistId` | ObjectId → Artist | Optional |
| `translations` | Object | `{ english[], hindi[], spanish[], korean[] }` each item `{ order: Number, text: String }` |

---

### LyricSegments Collection (`LyricSegment`)

| Field | Type | Notes |
|---|---|---|
| `songId` | ObjectId → Song | Required |
| `segmentOrder` | Number | Required, for sorting |
| `text` | String | The lyric line |
| `startTime` | Number | Seconds from start |
| `endTime` | Number | Seconds |
| `vocabularyDifficulty` | Enum | `beginner \| intermediate \| advanced` |
| `grammarTag` | String | Optional grammar label |

---

### LessonAttempts Collection (`LessonAttempt`)

| Field | Type | Notes |
|---|---|---|
| `userId` | ObjectId → User | Required |
| `language` | Enum | `hindi \| spanish \| korean` |
| `level` | Enum | `easy \| intermediate \| hard \| beginner \| dynamic \| focus \| pronunciation` |
| `questions` | Question[] | Embedded sub-documents |
| `userAnswers` | UserAnswer[] | Embedded sub-documents |
| `score` | Number | Count of correct answers |
| `xpEarned` | Number | score * 10 |
| `status` | Enum | `in_progress \| completed \| abandoned` |
| `cognitiveLoad` | Number | 1–5 HCI Likert scale |
| `reflectionText` | String | Open-ended HCI feedback |
| `startedAt` | Date | Auto |
| `completedAt` | Date | Set on submit |
| `totalTimeSpentSeconds` | Number | |
| `avgTimePerTextQuestionSeconds` | Number | Excludes listen_translate |

**Question sub-document:**

| Field | Type | Notes |
|---|---|---|
| `id` | Number | Question index |
| `type` | Enum | `multiple_choice \| fill_blank \| translate_word \| match_meaning \| listen_translate` |
| `questionText` | String | Always in English |
| `targetWord` | String | Word/phrase shown large |
| `options` | String[] | 4 choices |
| `correctAnswer` | String | Must match one of options exactly |
| `explanation` | String | 1-sentence explanation |

---

### Playlists Collection (`Playlist`)

| Field | Type | Notes |
|---|---|---|
| `userId` | ObjectId → User | Required |
| `title` | String | Required |

### PlaylistSongs Collection (`PlaylistSong`) — Join Table

| Field | Type | Notes |
|---|---|---|
| `playlistId` | ObjectId → Playlist | Required |
| `songId` | ObjectId → Song | Required |
| `addedAt` | Date | Auto |

---

### Notifications Collection (`Notification`)

| Field | Type | Notes |
|---|---|---|
| `userId` | ObjectId → User | Required |
| `title` | String | Required |
| `message` | String | Required |
| `isRead` | Boolean | Default false |
| `createdAt` | Date | Auto |

---

### ExperimentAssignments Collection (`ExperimentAssignment`)

| Field | Type | Notes |
|---|---|---|
| `userId` | ObjectId → User | Required, unique |
| `experimentGroup` | Enum | `control \| ai_adaptive` |
| `assignedAt` | Date | Auto |

*Note: This model is defined but not actively used in the current routes/controllers. Intended for future randomized experiment group assignment.*

---

### Learning Models (Defined, Partially Used)

| Model | Purpose |
|---|---|
| `LearningSession` | Track a user's session (start/end time, playbackMode, tempoMultiplier) |
| `AdaptiveTempo` | Record adaptive playback tempo changes per user/song |
| `ErrorTracking` | Track specific error patterns per user |
| `SegmentInteraction` | Track which lyric segments a user interacted with |
| `Artist` | Artist metadata (name, genre, country) |
| `Album` | Album metadata (title, releaseDate, coverImageUrl) |
| `Vocabulary` | Vocabulary entries (not actively used in routes) |

---

## 8. Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `PORT` | Yes | Server listen port (default: 5000) |
| `MONGO_URI` | Yes | MongoDB connection string (Atlas or local) |
| `JWT_SECRET` | Yes | Secret for signing/verifying JWTs. Use a long random string in production. |
| `ADMIN_EMAIL` | For seeding | Email for initial admin account (`npm run seed:admin`) |
| `ADMIN_PASSWORD` | For seeding | Password for initial admin account |
| `GROQ_API_KEY` | Yes | API key from console.groq.com for LLaMA lesson generation |
| `EMAIL_USER` | For email features | Gmail address used by Nodemailer (password reset, notifications) |
| `EMAIL_PASS` | For email features | Gmail App Password (NOT your Google account password) |
| `GOOGLE_CLIENT_ID` | For Google login | OAuth 2.0 Client ID from Google Cloud Console |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_GOOGLE_CLIENT_ID` | Yes (for Google login) | Same OAuth 2.0 Client ID as backend. Used by `GoogleOAuthProvider`. |

---

## 9. Known Limitations & TODOs

### Hardcoded URLs
All API calls in the frontend use hardcoded `http://localhost:5000`. There is no `VITE_API_BASE_URL` environment variable. In production, you must search and replace all occurrences.

### No Route-Level Auth Guards
Frontend route protection is implemented by manually calling `navigate('/login')` inside `useEffect` in each page. There is no centralized `PrivateRoute` wrapper component.

### Monolithic Page Components
`DashboardPage.tsx` (~3,100 lines) and `LessonsPage.tsx` (~1,576 lines) handle all UI and data-fetching. They should be refactored into smaller components with a proper data layer (React Query or similar).

### Streak is Randomized
In `LessonsPage.tsx`, the streak display uses `Math.floor(Math.random() * 7) + 1`. It has a TODO comment to pull actual streak data from the API.

### `api.ts` and `analytics.ts` are Empty
`frontend/src/services/api.ts` and `analytics.ts` are empty files (0 bytes). All API calls are inline in page components.

### Duplicate Controller Files
The `controllers/music/` and `controllers/user/` directories contain files named `*Contoller.ts` (typo — missing 'r') alongside the correct `*Controller.ts`. The typo'd files appear to be empty stubs.

### Missing Korean Translations
The `autoTranslate` function in `songController.ts` only generates English, Hindi, and Spanish translations. Korean (`ko`) is not translated, even though the `Song.translations` schema has a `korean` field and Korean quizzes are supported.

### `ExperimentAssignment` Unused
The `ExperimentAssignment` model is defined but no route assigns users to experiment groups or reads from this collection. Intended for formal A/B experiment randomization.

### Several Learning Models Unused in Routes
`LearningSession`, `AdaptiveTempo`, `ErrorTracking`, `SegmentInteraction`, `Artist`, `Album`, `Vocabulary` are defined as Mongoose schemas but have no corresponding API routes or controller logic.

### No Rate Limiting
The backend has no rate limiting on auth endpoints or the AI generation endpoints. This could expose the app to brute-force or API cost abuse in production.

### CORS Open to All Origins
`app.use(cors())` allows requests from any origin. In production this should be locked to the frontend domain.

### No Refresh Token
JWTs are issued for 30 days. There is no refresh token mechanism. Users are simply logged out after 30 days.

### Admin Password Change for Users
The admin can only view user quiz attempts and change their learning mode. There is no admin route to reset another user's password — users must use the forgot-password email flow themselves.
