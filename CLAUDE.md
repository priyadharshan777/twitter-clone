# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

X (Twitter) clone — full-stack social media app with Express.js backend and React frontend. Uses ES modules (`"type": "module"` in package.json).

## Commands

### Development
```bash
npm run dev              # Start backend with nodemon (port from .env, default 3500)
npm start --prefix frontend  # Start React dev server (port 3000)
```

### Build & Production
```bash
npm run build            # Install all deps + build frontend
npm start                # Start production server (serves frontend build from Express)
```

### Frontend Tests
```bash
npm test --prefix frontend        # Run tests (react-scripts test)
```

## Architecture

### Backend (Express.js + MongoDB)
- **Entry point:** `backend/server.js` — configures CORS, cookie-parser, Cloudinary, and serves frontend build in production
- **Auth:** JWT tokens stored in httpOnly cookies (15-day expiry), validated by `backend/middleware/protectRoute.js`
- **API routes** (all under `/api`):
  - `/api/auth` — signup, login, logout, getMe
  - `/api/users` — profile, follow/unfollow, suggested users, update profile
  - `/api/posts` — CRUD, likes, comments, feeds (all/following/user/liked)
  - `/api/notifications` — get and delete notifications
- **Models:** User, Post, Notification (Mongoose). Users have followers/following arrays. Posts have likes/comments arrays. Notifications link from→to with type enum (follow/like).
- **Image uploads:** Cloudinary integration for profile images, cover images, and post images

### Frontend (React + React Query)
- **Routing:** React Router v6 with auth-gated routes (redirects based on `authUser` query)
- **State management:** TanStack React Query for server state; no Redux/Context for app state
- **API calls:** Native `fetch` with `credentials: "include"`; base URL defined in `frontend/src/constant/url`
- **Styling:** Tailwind CSS + DaisyUI (extends "black" theme with Twitter blue primary color)
- **Custom hooks:** `useFollow` and `useUpdateUserProfile` wrap mutations with query invalidation

### Environment Variables (`.env` at root)
`PORT`, `MONGO_URL`, `JWT_SECRET`, `NODE_ENV`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_CLOUD_NAME`
