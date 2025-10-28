# BlogFlow API (Express + PostgreSQL)

Backend service powering the BlogFlow blog management platform. Provides RESTful endpoints for posts, categories, users, and authentication with JWT.

## Features
- Structured Express app with routers, controllers, and models.
- PostgreSQL integration via connection pool (`pg`) and auto-run schema bootstrap.
- Role-based access control with JWT auth middleware (admin/editor/author/viewer).
- Post management API including cover image uploads (Cloudinary) and category tagging.
- Category CRUD to organize the public landing page filters.
- Team management endpoints (invite, role updates, deactivate users).
- Built-in database schema (`db/schema.sql`) and starter seed data (`db/seed.sql`).

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env` and populate required variables:
   ```env
   DATABASE_URL=postgres://user:password@host:5432/blogflow
   PORT=5000
   CLIENT_URL=http://localhost:3000
   JWT_SECRET=change_me_to_something_long
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   ```
   > Cloudinary values are optional but required to support image uploads.
3. Start the API server:
   ```bash
   npm run dev
   ```
4. (Optional) Seed the database:
   ```bash
   psql "$DATABASE_URL" -f db/seed.sql
   ```

## Project Structure
```
src/
  config/        // Database + cloudinary configuration
  controllers/   // Route handlers (auth, posts, users, categories)
  middleware/    // Auth, validation, upload, error handling utilities
  models/        // Database accessors built on pg queries
  routes/        // Express routers mounted under /api
  utils/         // Helpers (async handler, response builder, upload)
  validators/    // express-validator rule sets per entity
```

## API Overview
- `POST /api/auth/register` – bootstrap admin (first user) or create viewer.
- `POST /api/auth/login` – issue JWT for admins/authors/editors.
- `GET /api/posts` – list posts (public). Authenticated editors get drafts.
- `POST /api/posts` – create post (author+ roles), supports multipart.
- `PUT /api/posts/:id` – update post and categories.
- `DELETE /api/posts/:id` – delete post (author can only delete own).
- `GET /api/categories` – public category listing.
- `POST /api/categories` – admin/editor create category.
- `GET /api/users` – admin-only list.
- `POST /api/users` – admin invite teammate.

Inspect `src/routes` for the full map of endpoints and guard rails.

## Testing & Tooling
- `npm run dev` uses nodemon for hot reload during development.
- `npm start` runs the compiled server without watchers.
- `npm run lint` is a placeholder if you choose to add ESLint.

## Production Considerations
- For managed Postgres (e.g., Neon, Supabase) ensure you allow the `pgcrypto` extension if you plan to use DB-level hashing (seed script already uses a bcrypt hash instead).
- Configure `CLIENT_URL` with comma-separated origins when deploying.
- Rotate `JWT_SECRET` and Cloudinary keys per environment.
