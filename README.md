# Blog + Jobs Management App (Rebuilt)

This project was rebuilt as a simple full-stack app for your client workflow:
- Public landing page with branded hero, dynamic navigation, published blogs, and open jobs.
- Admin login + dashboard.
- CRUD for written/video blogs.
- CRUD for jobs.
- Settings panel to edit navigation, hero text, CTA buttons, categories, and tags.

## Stack
- Frontend: React + React Router + Axios
- Backend: Express + PostgreSQL + JWT auth
- Firebase: Auth (admin sign-in) + Storage (blog image/video uploads)

## Admin Access
- Public self-signup is disabled by default for production safety.
- Admin users should be created by an existing admin in `Settings > Team & Access`, or directly in the `admin_users` table.
- If you need temporary public signup for onboarding, set backend env `ALLOW_PUBLIC_SIGNUP=true` and disable it after onboarding.

## Firebase Schema Mapping
The backend schema mirrors your Firebase fields using SQL tables:
- `blogs` (title, content, publishDate, author, status, category, coverImg, blogURL, summary, blogType, vlogContent, vlogEmbed, vlogURL, timestamps)
- `categories` (id, name, description, timestamps)
- `tags` (id, name, timestamps)
- `blog_tags` join table for blog-tag assignment

Additional tables for your requested features:
- `jobs`
- `navigation_items`
- `site_settings`
- `admin_users`

## Run Locally
1. Backend
```bash
cd backend
npm install
npm run start
```

2. Frontend
```bash
cd frontend
npm install
npm start
```

Frontend expects backend at `http://localhost:5000/api` by default.

## Firebase Web Setup
- Firebase app config is wired in `frontend/src/firebase.js`.
- Use `frontend/.env.local` for your project values (`REACT_APP_FIREBASE_*`).
- Analytics initialization runs at startup when config is present and browser support is available.
- Admin login now uses Firebase email/password auth, then exchanges ID token with backend `/api/auth/firebase-login`.
- Admin blog editor can upload cover images and video files to Firebase Storage.

## Backend Firebase Admin Setup
Backend requires a Firebase service account to verify Firebase ID tokens:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` (use escaped newlines: `\n`)
- `FIREBASE_STORAGE_BUCKET`

## Firestore to Neon Import
To pull existing Firestore blog data into Neon (categories, tags, blogs):
```bash
cd backend
npm install
npm run import:firebase
```
Required backend env vars for the import:
- `DATABASE_URL`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_STORAGE_BUCKET` (recommended)

## Netlify (Frontend) Deploy
`netlify.toml` is included:
- base: `frontend`
- build command: `npm run build`
- publish directory: `build`
- SPA redirect: `/* -> /index.html`

Set these Netlify environment variables:
- `REACT_APP_API_URL` = your deployed backend API URL (example: `https://api.yourdomain.com/api`)
- `REACT_APP_FIREBASE_API_KEY`
- `REACT_APP_FIREBASE_AUTH_DOMAIN`
- `REACT_APP_FIREBASE_PROJECT_ID`
- `REACT_APP_FIREBASE_STORAGE_BUCKET`
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
- `REACT_APP_FIREBASE_APP_ID`
- `REACT_APP_FIREBASE_MEASUREMENT_ID`

## Notes
- DB schema + seed data are in `backend/db/schema.sql` and run automatically on backend start.
- If you keep production-like secrets in `backend/.env`, rotate credentials before sharing this repo.
- Public API endpoints now use cache headers (`max-age=300`, `stale-while-revalidate`) and frontend local cache (5 minutes) for faster repeat page loads.
