# Project Specs — NestJS Blogger API

## What We're Building

A production-grade REST API for a full-featured blogging platform, built with NestJS, PostgreSQL (Prisma), and Redis. Designed to back a Next.js frontend.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS 11 |
| Database | PostgreSQL + Prisma ORM |
| Cache / Session | Redis (ioredis) |
| Auth | JWT (access + refresh, HTTP-only cookies) |
| File Storage | Cloudinary (free: 25 GB storage, CDN included) |
| Email | Nodemailer (SMTP — Gmail, Resend, Brevo, etc.) |
| Validation | class-validator + class-transformer |
| Docs | Swagger / OpenAPI at `/swagger` |

---

## Features

### Auth
- Signup / Login with HTTP-only cookie JWTs
- Refresh token rotation (old token invalidated on use)
- Logout with Redis-based JWT blacklist (instant revocation)
- Rate limiting on sensitive routes (5 req/min login, signup)

### Users
- Get / update / soft-delete profile
- Avatar and bio fields

### Posts
- Create posts as drafts
- Publish / archive workflow
- Soft delete
- List published posts with pagination and tag filtering
- Get post by slug (auto-increments view count)
- "My posts" endpoint (includes drafts)

### Likes
- Toggle like / unlike on a post
- Unique constraint prevents duplicate likes by the same user
- Like count + current user's like status

### Comments
- Nested comments (one level of replies via `parentId`)
- Soft delete (deleted comments show as `[deleted]`, thread stays intact)
- Post author notified by email on new comment

### Tags
- Create and list tags
- Filter posts by tag slug

### Share Links
- Generate short-code share links for posts (30-day expiry)
- `GET /s/:code` redirects to the post on the frontend

### File Upload
- Upload images to Cloudinary (JPEG, PNG, WebP, GIF, max 5 MB)
- Returns CDN URL for use in post `coverImage` or body

### Infrastructure
- Global rate limiter (100 req/min default, stricter on auth)
- Request logger (method, path, status, duration, IP)
- Helmet for secure HTTP headers
- Redis user response cache (60s TTL, invalidated on write)
- `@nestjs/schedule` ready for cron jobs (e.g. expired token cleanup)

---

## API Endpoints

### Auth `POST /auth`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /auth/signup | — | Register |
| POST | /auth/login | — | Login |
| GET | /auth/me | cookie | Current user |
| POST | /auth/refresh | cookie | Rotate tokens |
| POST | /auth/logout | cookie | Logout + blacklist token |

### Posts `GET /posts`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /posts | cookie | Create draft |
| GET | /posts | — | List published (paginated) |
| GET | /posts/me | cookie | My posts (incl. drafts) |
| GET | /posts/:slug | — | Get post by slug |
| PATCH | /posts/:id | cookie | Update post |
| DELETE | /posts/:id | cookie | Soft delete |
| POST | /posts/:id/publish | cookie | Publish |
| POST | /posts/:id/archive | cookie | Archive |
| POST | /posts/:id/like | cookie | Toggle like |
| GET | /posts/:id/likes | — | Like count |
| POST | /posts/:id/share | cookie | Generate share link |

### Comments
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /posts/:postId/comments | cookie | Add comment |
| GET | /posts/:postId/comments | — | List comments + replies |
| PATCH | /comments/:id | cookie | Edit comment |
| DELETE | /comments/:id | cookie | Soft delete |

### Tags
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /tags | — | List tags |
| POST | /tags | cookie | Create tag |

### Share
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /s/:code | — | Redirect to post |

### Upload
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /upload | cookie | Upload image to Cloudinary |

### Users
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /users | cookie | List users |
| GET | /users/:id | cookie | Get user |
| PATCH | /users/:id | cookie | Update profile |
| DELETE | /users/:id | cookie | Soft delete account |

---

## Environment Variables

See `.env.example` for the full list. Key ones:

```
DATABASE_URL         Postgres connection string
REDIS_URL            Redis connection string
JWT_ACCESS_SECRET    Sign access tokens
JWT_REFRESH_SECRET   Sign refresh tokens
APP_URL              Frontend base URL (used in share links + emails)
CLOUDINARY_*         Cloudinary credentials
SMTP_*               SMTP credentials for email
```

---

## Data Model Summary

See `docs/ERD.md` for the full Mermaid diagram.

| Model | Purpose |
|---|---|
| User | Accounts |
| RefreshToken | Stored hashed refresh tokens |
| Post | Blog posts with draft/published/archived status |
| Tag | Post categories |
| PostTag | Many-to-many posts ↔ tags |
| Like | One like per user per post |
| Comment | Threaded comments (one level of nesting) |
| ShareLink | Short-code share URLs with expiry |
| Media | Cloudinary upload records |
