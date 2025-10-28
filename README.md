# BlogFlow Management App v2

Full-stack blog management platform featuring an Express/PostgreSQL API and a React SPA. It delivers a public-facing blog landing page plus an authenticated admin workspace with content and team management.

## Monorepo Layout
```
backend/   # Express API, database schema, seed data
frontend/  # React SPA for public site + admin console
```

## Key Features
- Reader-friendly landing page with featured posts, category filters, and detail pages.
- Role-based admin workspace with dashboard insights, CRUD for posts/categories, and user management.
- JWT authentication, secure password hashing, and optional Cloudinary integration for hero images.
- Structured code organization across controllers, models, routes (backend) and modular pages/components (frontend).

## Quick Start
1. **Backend**
   ```bash
   cd backend
   npm install
   cp .env .env.local # or edit .env with real values
   npm run dev
   ```
   - Ensure `DATABASE_URL` points to a PostgreSQL instance. Run `db/schema.sql` and `db/seed.sql` to bootstrap tables and a sample admin (`admin@example.com` / `Password123!`).
2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```
   - Optionally set `REACT_APP_API_URL` in `.env.local` if the API isn’t on `http://localhost:5000/api`.

## Common Workflows
- Create/edit posts via `/admin/posts` (authors can only modify their own).
- Manage taxonomy under `/admin/categories`.
- Invite teammates under `/admin/users` (admin only).
- Monitor traffic-ready content from the dashboard overview.

## Testing
- `backend`: add tests or integration scripts as needed. Current focus is the API skeleton.
- `frontend`: `npm test` runs React Testing Library checks; a baseline smoke test validates the landing page render.

## Next Enhancements
- Add markdown/RichText editor with preview for post bodies.
- Introduce automated API tests and frontend e2e coverage.
- Hook up analytics + notifications for editorial workflows.

Happy publishing!
