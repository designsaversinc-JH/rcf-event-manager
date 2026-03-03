# Roseland Ceasefire Frontend

React SPA for the Roseland Ceasefire management platform. It covers the public blog experience and the authenticated admin workspace.

## Highlights
- **Public landing page** with featured story, category filters, and post cards.
- **Post detail view** that renders long-form content with basic formatting helpers.
- **Admin dashboard** showing high-level stats and recent activity.
- **Content operations** to create, edit, publish, and delete posts with cover image uploads.
- **Category management** for organizing topics and curating the landing page filters.
- **Team management** with granular role control (admin, editor, author, viewer).
- **Auth context** stores JWTs securely in memory/localStorage and syncs with the API client.

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Set the API base URL (default is `http://localhost:5000/api`). Create `.env.local` if you need to override:
   ```bash
   echo "REACT_APP_API_URL=http://localhost:5000/api" > .env.local
   ```
3. Run the development server:
   ```bash
   npm start
   ```
4. Run tests:
   ```bash
   npm test
   ```

## Project Structure
```
src/
  api/            // Axios client and REST helpers
  components/     // Reusable UI (public + admin shells)
  context/        // AuthProvider with token persistence
  hooks/          // Custom hooks for consuming context
  pages/          // Public + admin page-level components
  router/         // Route definitions using React Router v6
  utils/          // Formatting helpers
```

## Conventions
- Uses modern React (function components + hooks) with React Router v6.
- Global styling lives in `App.css`; utility classes follow a “design tokens + utility” approach.
- API helpers return the full response payload from the backend (`{ message, data, meta }`).
- Protected routes rely on the Auth context; admin-only routes further restrict to the `admin` role.

## Available Scripts
- `npm start` – launch CRA dev server.
- `npm test` – run unit tests via React Testing Library.
- `npm run build` – produce a production bundle.

## Next Steps
- Add rich-text/markdown editing for posts.
- Introduce toast notifications for API errors/success.
- Wire analytics to track admin activity and reader engagement.
