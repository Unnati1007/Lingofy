# Lingofy — API Reference

Complete reference for every backend API endpoint. All endpoints are served from `http://localhost:5000`.

**Authentication:** Protected routes require `Authorization: Bearer <JWT>` header.

**Legend:**
- 🔓 Public (no auth required)
- 🔐 User JWT required
- 👑 Admin JWT required

---

## Table of Contents

1. [Health Check](#health-check)
2. [Auth Routes — `/api/auth`](#auth-routes)
3. [User Routes — `/api/users`](#user-routes)
4. [Preference Routes — `/api/preferences`](#preference-routes)
5. [Lessons Routes — `/api/lessons`](#lessons-routes)
6. [Song / Admin Routes — `/api/admin`](#song--admin-routes)
7. [Playlist Routes — `/api/playlists`](#playlist-routes)
8. [Notification Routes — `/api/notifications`](#notification-routes)
9. [Analytics Routes — `/api/admin/analytics`](#analytics-routes)

---

## Health Check

### `GET /health` 🔓

Confirms the API is running.

**Response `200`:**
```json
{
  "status": "ok",
  "message": "Lingofy API running"
}
```

---

## Auth Routes

Base path: `/api/auth`

---

### `POST /api/auth/register` 🔓

Create a new user account.

**Request Body:**
```json
{
  "name": "Unnati Jadon",
  "email": "unnati@example.com",
  "password": "SecurePass123"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | No | Falls back to email prefix if omitted |
| `email` | string | Yes | Must be unique |
| `password` | string | Yes | Min 6 characters |

**Response `201`:**
```json
{
  "_id": "64abc123...",
  "name": "Unnati Jadon",
  "email": "unnati@example.com",
  "role": "user",
  "learningMode": "music",
  "hasPreferences": false,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error `400`:** `{ "message": "User already exists" }`

---

### `POST /api/auth/login` 🔓

Authenticate with email or username + password.

**Request Body:**
```json
{
  "email": "unnati@example.com",
  "password": "SecurePass123"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `email` | string | Yes | Can be email address or username |
| `password` | string | Yes | |

**Response `200`:**
```json
{
  "_id": "64abc123...",
  "name": "Unnati Jadon",
  "email": "unnati@example.com",
  "role": "user",
  "learningMode": "music",
  "hasPreferences": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error `401`:** `{ "message": "Invalid email or password" }`

---

### `POST /api/auth/google` 🔓

Sign in or register via Google OAuth. Accepts either an ID token (credential) or an access token.

**Request Body (ID Token path):**
```json
{
  "credential": "<google_id_token>"
}
```

**Request Body (Access Token path):**
```json
{
  "access_token": "<google_access_token>"
}
```

**Response `200`:** Same shape as `/api/auth/login` response.

**Error `400`:** `{ "message": "No Google credentials provided" }`

---

### `POST /api/auth/forgot-password` 🔓

Send a 6-digit password reset code to the user's email.

**Request Body:**
```json
{
  "email": "unnati@example.com"
}
```

**Response `200`:**
```json
{
  "message": "Reset code sent to your email (or simulated in console)"
}
```

> If Nodemailer SMTP fails, the code is logged to the server console as a fallback.

**Error `404`:** `{ "message": "User with this email does not exist" }`

---

### `POST /api/auth/verify-code` 🔓

Verify that a reset code is valid and not expired (codes expire after 15 minutes).

**Request Body:**
```json
{
  "email": "unnati@example.com",
  "code": "482910"
}
```

**Response `200`:**
```json
{
  "message": "Code verified successfully"
}
```

**Error `400`:** `{ "message": "Invalid or expired reset code" }`

---

### `POST /api/auth/reset-password` 🔓

Reset the password using a verified code.

**Request Body:**
```json
{
  "email": "unnati@example.com",
  "code": "482910",
  "newPassword": "NewSecurePass456"
}
```

**Response `200`:**
```json
{
  "message": "Password reset successfully"
}
```

**Error `400`:** `{ "message": "Invalid or expired reset code" }`

---

## User Routes

Base path: `/api/users`

---

### `GET /api/users/me` 🔐

Get the authenticated user's profile.

**Response `200`:**
```json
{
  "_id": "64abc123...",
  "name": "Unnati Jadon",
  "email": "unnati@example.com",
  "role": "user",
  "learningMode": "music",
  "nativeLanguage": "English",
  "learningLanguage": "Hindi",
  "age": 22,
  "dailyGoal": 15,
  "proficiency": "beginner",
  "about": "I love music and languages!",
  "mobile": "+91 98765 43210",
  "profession": "Student",
  "knownLanguages": ["English", "Hindi"],
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

---

### `PUT /api/users/me/mode` 🔐

Toggle the user's learning mode between `music` and `traditional`.

**Request Body:**
```json
{
  "mode": "traditional"
}
```

**Response `200`:**
```json
{
  "message": "Learning mode updated",
  "mode": "traditional"
}
```

---

### `PUT /api/users/me/profile` 🔐

Update the user's profile information.

**Request Body (all fields optional):**
```json
{
  "name": "Unnati Jadon",
  "nativeLanguage": "English",
  "learningLanguage": "Hindi",
  "age": 22,
  "dailyGoal": 30,
  "proficiency": "intermediate",
  "mobile": "+91 98765 43210",
  "profession": "Software Engineer",
  "about": "Passionate about languages",
  "knownLanguages": ["English", "French"]
}
```

**Response `200`:**
```json
{
  "message": "Profile updated",
  "user": { ...updatedUserObject }
}
```

---

### `GET /api/users/` 👑

Get all users (admin only).

**Response `200`:**
```json
[
  {
    "_id": "...",
    "name": "...",
    "email": "...",
    "role": "user",
    "learningMode": "music",
    "createdAt": "..."
  }
]
```

---

### `PUT /api/users/:id/mode` 👑

Admin sets learning mode for a specific user.

**Request Body:**
```json
{ "mode": "traditional" }
```

---

### `DELETE /api/users/:id` 👑

Delete a user account.

**Response `200`:** `{ "message": "User removed" }`

---

## Preference Routes

Base path: `/api/preferences`

---

### `POST /api/preferences` 🔐

Save or update user learning preferences (upsert).

**Request Body:**
```json
{
  "languagesToLearn": ["Hindi"],
  "favoriteGenres": ["Pop", "Bollywood"],
  "favoriteArtists": ["Arijit Singh"],
  "vocabularyLevel": "beginner",
  "grammarFocus": false,
  "phraseLearning": true,
  "sessionGoalMinutes": 20
}
```

**Response `201`:**
```json
{
  "message": "Preferences saved",
  "preferences": { ...savedPreferencesObject }
}
```

---

### `GET /api/preferences` 🔐

Get the authenticated user's preferences.

**Response `200`:** Preference object, or `404` if not yet set.

---

## Lessons Routes

Base path: `/api/lessons`

---

### `POST /api/lessons/generate` 🔐

Generate a new 10-question AI lesson for a language and level. Creates an in-progress `LessonAttempt`.

**Request Body:**
```json
{
  "language": "hindi",
  "level": "easy"
}
```

| Field | Type | Required | Values |
|---|---|---|---|
| `language` | string | Yes | `hindi \| spanish \| korean` |
| `level` | string | Yes | `easy \| intermediate \| hard` |

**Response `200`:**
```json
{
  "lessonTitle": "Hindi Basics: Greetings & Family",
  "language": "hindi",
  "questions": [
    {
      "id": 1,
      "type": "translate_word",
      "questionText": "What is the Hindi word for 'Hello'?",
      "targetWord": "Hello",
      "options": ["नमस्ते (Namaste)", "अलविदा (Alvida)", "धन्यवाद (Dhanyavaad)", "हाँ (Haan)"],
      "correctAnswer": "नमस्ते (Namaste)",
      "explanation": "नमस्ते (Namaste) is the standard Hindi greeting, similar to Hello."
    }
  ],
  "attemptId": "64def456..."
}
```

> **Music Mode Note:** If the user's `learningMode` is `music`, the backend fetches 10 random `LyricSegment` texts from songs in that language and incorporates them as `listen_translate` questions.

**Error `400`:** `{ "message": "Invalid language" }`

---

### `POST /api/lessons/generate-from-song` 🔐

Generate a 10-question lesson based on the lyrics of a specific song.

**Request Body:**
```json
{
  "songId": "64abc789...",
  "language": "hindi"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `songId` | string | Yes | MongoDB ObjectId of the Song |
| `language` | string | Yes | `hindi \| spanish \| korean` |

**Response `200`:** Same shape as `/generate`, `attemptId` level will be `dynamic`.

---

### `POST /api/lessons/generate-focus` 🔐

Generate a 10-question focus-area practice session.

**Request Body:**
```json
{
  "language": "spanish",
  "focusArea": "Grammar"
}
```

| `focusArea` Value | Description |
|---|---|
| `Vocabulary` | `translate_word` and `multiple_choice` questions |
| `Listening` | 6 `listen_translate` + 4 `translate_word` |
| `Grammar` | Mostly `fill_blank` questions |
| `Culture (idioms, slangs)` | `match_meaning` and `translate_word` for idioms |

**Response `200`:** Same shape as `/generate`, level will be `focus`.

---

### `POST /api/lessons/submit` 🔐

Submit answers for a completed lesson. Calculates score, XP, awards badges.

**Request Body:**
```json
{
  "attemptId": "64def456...",
  "language": "hindi",
  "level": "easy",
  "questions": [ ...10 question objects... ],
  "userAnswers": [
    { "questionId": 1, "answer": "नमस्ते (Namaste)", "timeSpentSeconds": 8 },
    { "questionId": 2, "answer": "पानी (Paani)", "timeSpentSeconds": 5 }
  ],
  "totalTimeSpentSeconds": 245,
  "cognitiveLoad": 3,
  "reflectionText": "The music really helped me remember the words!"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `attemptId` | string | Yes | Must belong to current user |
| `language` | string | Yes | |
| `level` | string | Yes | |
| `questions` | array | Yes | Full question objects for re-scoring |
| `userAnswers` | array | Yes | Array of `{ questionId, answer, timeSpentSeconds }` |
| `totalTimeSpentSeconds` | number | No | Total time for the whole quiz |
| `cognitiveLoad` | number | No | 1–5 Likert (HCI research) |
| `reflectionText` | string | No | Open-ended reflection (HCI research) |

**Response `200`:**
```json
{
  "score": 8,
  "total": 10,
  "xpEarned": 80,
  "results": [
    {
      "questionId": 1,
      "isCorrect": true,
      "correctAnswer": "नमस्ते (Namaste)",
      "explanation": "नमस्ते (Namaste) is the standard Hindi greeting.",
      "timeSpentSeconds": 8
    }
  ]
}
```

---

### `GET /api/lessons/history` 🔐

Get the last 20 completed lesson attempts for the authenticated user.

**Response `200`:**
```json
[
  {
    "_id": "64def456...",
    "language": "hindi",
    "level": "easy",
    "score": 8,
    "xpEarned": 80,
    "completedAt": "2024-06-15T14:30:00.000Z"
  }
]
```

---

### `GET /api/lessons/attempt/:attemptId` 🔐

Get full details of a single lesson attempt (including questions and user answers).

**Response `200`:** Full `LessonAttempt` document.

---

### `GET /api/lessons/progress` 🔐

Get roadmap progress and badges for all three languages.

**Response `200`:**
```json
{
  "hindi": {
    "easyCompleted": 1,
    "intermediateCompleted": 2,
    "hardCompleted": 1,
    "focusCompleted": 1,
    "currentStage": "hard",
    "badges": ["easy_explorer", "intermediate_scholar", "focus_scholar"]
  },
  "spanish": {
    "easyCompleted": 0,
    "intermediateCompleted": 0,
    "hardCompleted": 0,
    "focusCompleted": 0,
    "currentStage": "easy",
    "badges": []
  },
  "korean": { ... }
}
```

---

### `GET /api/lessons/admin/progress/:userId` 👑

Get roadmap progress for any specific user (admin only).

**Response `200`:** Same shape as `/progress`.

---

## Song / Admin Routes

Base path: `/api/admin`

---

### `GET /api/admin` 🔓

Get all songs in the library.

**Response `200`:**
```json
[
  {
    "_id": "64abc789...",
    "title": "Tum Hi Ho",
    "artistName": "Arijit Singh",
    "language": "Hindi",
    "durationSeconds": 262,
    "audioUrl": "https://www.youtube.com/watch?v=Umqb9KENgmk",
    "difficultyLevel": "beginner",
    "translations": {
      "english": [{ "order": 1, "text": "You are the one..." }],
      "hindi": [...],
      "spanish": [...],
      "korean": [...]
    }
  }
]
```

---

### `GET /api/admin/quota` 🔐

Get the authenticated user's custom song upload quota status (5-song quota limit for regular users, unlimited for admin).

**Response `200`:**
```json
{
  "uploadedCount": 2,
  "maxLimit": 5,
  "remaining": 3,
  "isUnlimited": false
}
```

---

### `GET /api/admin/recommendations` 🔐

Get personalized song recommendations scored and ranked based on onboarding/profile preferences:
- Matching `learningLanguage`: +60 points
- Matching `favoriteArtists` / singers: +40 points
- Matching `favoriteGenres`: +20 points

**Response `200`:**
```json
{
  "recommendations": [ ...scoredSongObjects ],
  "quota": { "uploadedCount": 2, "maxLimit": 5, "remaining": 3, "isUnlimited": false },
  "allSongs": [ ...allSongObjects ]
}
```

---

### `POST /api/admin/song` 🔐

Add/import a new song to the library (available to both regular users and admins). Enforces a 5-song quota limit for regular users. Automatically extracts timed captions from YouTube and generates parallel 4-language Groq AI translations (English, Hindi, Spanish, Korean).

**Request Body:**
```json
{
  "title": "Tum Hi Ho",
  "artistName": "Arijit Singh",
  "language": "Hindi",
  "audioUrl": "https://www.youtube.com/watch?v=Umqb9KENgmk",
  "youtubeUrl": "https://www.youtube.com/watch?v=Umqb9KENgmk",
  "lyrics": ["Hum tere bin ab reh nahin sakte", "Tere bina kya wajood mera"]
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | Yes | Song title |
| `artistName` | string | Yes | Artist/singer name |
| `language` | string | Yes | Original song language (`Hindi \| Spanish \| Korean \| English`) |
| `audioUrl` | string | Yes | YouTube URL or direct audio URL |
| `youtubeUrl` | string | No | If provided, fetches captions automatically |
| `lyrics` | string[] | No | Manual fallback if YouTube captions fail |

**Response `201`:**
```json
{
  "message": "Song added and processed successfully!",
  "song": { ...songObject },
  "fetchedSegments": 45,
  "segments": [ ...lyricSegmentObjects ]
}
```

**Error `400`:** `{ "message": "Song upload limit reached (5 songs maximum)." }`

---

### `POST /api/admin/translate/:songId` 👑

Auto-translate all lyric segments to English, Hindi, and Spanish using the Google Translate unofficial API.

**URL Params:** `songId` — MongoDB ObjectId of the song

**Response `200`:**
```json
{
  "english": [{ "order": 1, "text": "You are the one..." }],
  "hindi": [{ "order": 1, "text": "तुम ही हो..." }],
  "spanish": [{ "order": 1, "text": "Tú eres el..." }]
}
```

---

### `GET /api/admin/segments/:songId` 🔓

Get all lyric segments for a specific song (sorted by `segmentOrder`).

**Response `200`:**
```json
[
  {
    "_id": "...",
    "songId": "64abc789...",
    "segmentOrder": 1,
    "text": "Hum tere bin ab reh nahin sakte",
    "startTime": 16.5,
    "endTime": 20.0
  }
]
```

---

### `GET /api/admin/song-suggestions` 👑

Get AI-curated song suggestions based on current user language preferences.

**Response `200`:**
```json
[
  {
    "title": "Tum Hi Ho",
    "artist": "Arijit Singh",
    "language": "Hindi",
    "youtubeUrl": "https://www.youtube.com/watch?v=Umqb9KENgmk",
    "reason": "High demand! 12 users are learning Hindi."
  }
]
```

---

### `GET /api/admin/users` 👑

Get all non-admin users.

**Response `200`:** Array of user objects (password excluded).

---

### `GET /api/admin/users/:userId/attempts` 👑

Get all lesson attempts for a specific user.

**Response `200`:** Array of `LessonAttempt` documents.

---

### `GET /api/admin/attempts/:attemptId` 👑

Get details of a single lesson attempt, with user info populated.

**Response `200`:** Full `LessonAttempt` with `userId` populated as `{ name, email }`.

---

## Playlist Routes

Base path: `/api/playlists`

---

### `GET /api/playlists` 🔐

Get all playlists for the authenticated user.

**Response `200`:**
```json
[
  {
    "_id": "64pla001...",
    "userId": "64abc123...",
    "title": "My Bollywood Picks",
    "createdAt": "2024-06-01T10:00:00.000Z"
  }
]
```

---

### `POST /api/playlists` 🔐

Create a new playlist.

**Request Body:**
```json
{ "title": "My Bollywood Picks" }
```

**Response `201`:** Created playlist object.

**Error `400`:** `{ "message": "Playlist title is required" }`

---

### `GET /api/playlists/:playlistId` 🔐

Get details of a specific playlist and its songs (populated).

**Response `200`:**
```json
{
  "playlist": { "_id": "...", "title": "My Bollywood Picks" },
  "songs": [
    { "_id": "64abc789...", "title": "Tum Hi Ho", "artistName": "Arijit Singh", ... }
  ]
}
```

---

### `POST /api/playlists/:playlistId/songs` 🔐

Add a song to a playlist.

**Request Body:**
```json
{ "songId": "64abc789..." }
```

**Response `201`:** Created `PlaylistSong` object.

**Error `400`:** `{ "message": "Song is already in this playlist" }`

---

### `DELETE /api/playlists/:playlistId/songs/:songId` 🔐

Remove a song from a playlist.

**Response `200`:** `{ "message": "Song removed from playlist successfully" }`

---

### `DELETE /api/playlists/:playlistId` 🔐

Delete a playlist and all its song associations.

**Response `200`:** `{ "message": "Playlist deleted successfully" }`

---

## Notification Routes

Base path: `/api/notifications`

---

### `GET /api/notifications` 🔐

Get all notifications for the authenticated user (newest first).

**Response `200`:**
```json
[
  {
    "_id": "64not001...",
    "userId": "64abc123...",
    "title": "Badge Unlocked! 🎉",
    "message": "You've unlocked the Easy Explorer badge in Hindi!",
    "isRead": false,
    "createdAt": "2024-06-15T14:35:00.000Z"
  }
]
```

---

### `PUT /api/notifications/:id/read` 🔐

Mark a single notification as read.

**Response `200`:** Updated notification object.

**Error `404`:** `{ "message": "Notification not found" }`

---

### `POST /api/notifications/goal-status` 🔐

Log or sync a daily learning goal status notification (`goal_completed` or `goal_pending`). Automatically prevents duplicate notifications for the same goal within the same day.

**Request Body:**
```json
{
  "title": "Daily Goal Completed",
  "message": "Congratulations! You achieved your 15 minutes daily learning goal today.",
  "type": "goal_completed"
}
```

| Field | Type | Required | Values |
|---|---|---|---|
| `title` | string | Yes | Notification title |
| `message` | string | Yes | Notification body text |
| `type` | string | No | `goal_completed \| goal_pending \| general` |

**Response `201`:**
```json
{
  "message": "Notification created",
  "notification": { ...notificationObject }
}
```

---

### `PUT /api/notifications/read-all` 🔐

Mark all of the authenticated user's notifications as read.

**Response `200`:** `{ "message": "All notifications marked as read" }`

---

### `POST /api/notifications/admin/send` 👑

Send an in-app notification (and optionally an email) to a specific user.

**Request Body:**
```json
{
  "userId": "64abc123...",
  "title": "Welcome to Lingofy!",
  "message": "We're excited to have you on board. Start your language journey today!",
  "sendEmail": true
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `userId` | string | Yes | Target user's MongoDB ID |
| `title` | string | Yes | Notification title |
| `message` | string | Yes | Notification body text |
| `sendEmail` | boolean | No | If true, also sends email via Nodemailer |

**Response `201`:**
```json
{
  "message": "Notification sent successfully",
  "notification": { ...notificationObject }
}
```

---

## Analytics Routes

Base path: `/api/admin/analytics`

---

### `GET /api/admin/analytics/comparison` 👑

Get comparison analytics between music and traditional learning modes. Used for HCI research.

**Response `200`:**
```json
{
  "music": {
    "learningMode": "music",
    "totalAttempts": 145,
    "completedAttempts": 130,
    "abandonedAttempts": 15,
    "dropoutRate": 10.34,
    "averageScore": 7.2,
    "averageAccuracy": 72.0,
    "totalXPEarned": 9400,
    "averageXPEarned": 64.8,
    "uniqueUsersCount": 18,
    "averageTimeSpentSeconds": 22.5
  },
  "traditional": {
    "learningMode": "traditional",
    "totalAttempts": 87,
    "completedAttempts": 80,
    "abandonedAttempts": 7,
    "dropoutRate": 8.05,
    "averageScore": 6.8,
    "averageAccuracy": 68.0,
    "totalXPEarned": 5440,
    "averageXPEarned": 62.5,
    "uniqueUsersCount": 10,
    "averageTimeSpentSeconds": 28.1
  }
}
```

| Field | Description |
|---|---|
| `totalAttempts` | All lesson attempts for this mode |
| `completedAttempts` | Attempts with `status: 'completed'` |
| `abandonedAttempts` | In-progress or abandoned attempts |
| `dropoutRate` | `abandonedAttempts / totalAttempts * 100` (%) |
| `averageScore` | Mean questions correct per attempt |
| `averageAccuracy` | Mean `score / totalQuestions * 100` (%) |
| `totalXPEarned` | Sum of all XP earned |
| `averageXPEarned` | Mean XP per attempt |
| `uniqueUsersCount` | Distinct user count |
| `averageTimeSpentSeconds` | Mean time per text question (excludes listen_translate) |

---

## Common Error Responses

| Status | Meaning | Example |
|---|---|---|
| `400` | Bad Request | Invalid input, user already exists |
| `401` | Unauthorized | No token, expired token, wrong password |
| `403` | Forbidden | Authenticated but not admin |
| `404` | Not Found | Resource doesn't exist |
| `500` | Internal Server Error | Database error, AI generation failure |

All error responses follow the shape:
```json
{ "message": "Human-readable error description" }
```
