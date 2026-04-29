<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

## Project setup

```bash
$ npm install
$ cp .env.example .env
```

## Running the project

### With Docker (recommended)

Runs the app, Postgres, and Redis together. Migrations and seeding run automatically on startup.

```bash
# build and start everything
$ docker compose up --build -d

# tail app logs
$ docker compose logs -f app

# stop (data persisted)
$ docker compose down

# stop and wipe all volumes (destructive)
$ docker compose down -v
```

### Local (app only, infra in Docker)

Start Postgres and Redis first, then run the app locally.

```bash
$ docker compose up -d db redis

# development
$ npm run start:dev

# watch mode (alias for start:dev)
$ npm run start

# production build
$ npm run start:prod
```

## Docker commands

```bash
# view running containers
$ docker compose ps

# tail logs for a specific service
$ docker compose logs -f app
$ docker compose logs -f db
$ docker compose logs -f redis

# restart a specific service
$ docker compose restart app

# open a psql shell
$ docker compose exec db psql -U postgres -d echowrite

# open a redis-cli shell
$ docker compose exec redis redis-cli

# rebuild the app image after code changes
$ docker compose up --build -d app
```

## Infra connection details

**Postgres**

| | |
|-|---|
| Host | `localhost` |
| Port | `5460` |
| Database | `echowrite` |
| Username | `postgres` |
| Password | `postgres` |

**Redis**

| | |
|-|---|
| Host | `localhost` |
| Port | `6399` |

## Prisma

### Commands

```bash
# create a new migration after schema changes
$ npx prisma migrate dev --name <migration-name>

# apply migrations without prompts (CI/prod)
$ npx prisma migrate deploy

# seed the database
$ npx prisma db seed

# open Prisma Studio (visual DB browser)
$ npx prisma studio

# validate the schema
$ npx prisma validate

# regenerate the Prisma client after schema changes
$ npx prisma generate
```

> **Note:** The `url` field is intentionally absent from `datasource db` in `schema.prisma`. Prisma 7 reads the connection URL from `prisma.config.ts` instead.

### Seed data

Running `npx prisma db seed` creates users, tags, posts, comments, likes, and share links:

| Email | Password |
|-------|----------|
| `hassan@echowrite.dev` | `Admin1234!` |
| `jane@echowrite.dev` | `Password1234!` |
| `john@echowrite.dev` | `Password1234!` |

Seed uses `upsert` -- safe to run multiple times.

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## CORS

Allowed origins are defined as an array in `src/main.ts`. Add or remove entries there as needed.

```ts
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
];
```

## API Docs (Swagger)

Interactive docs are available at **[http://localhost:3000/swagger](http://localhost:3000/swagger)** when the app is running.

1. Call `POST /auth/signup` or `POST /auth/login`
2. Copy the `accessToken` from the response
3. Click **Authorize** (top-right in Swagger UI) and enter `Bearer <token>`
4. All protected endpoints are now unlocked

---

## Health

| Endpoint | Purpose |
|----------|---------|
| `GET /health` | Full check: DB, Redis, heap, and RSS memory |
| `GET /health/live` | Liveness probe (no I/O) |
| `GET /health/ready` | Readiness probe: DB and Redis only |

All health routes are exempt from rate limiting.

## Features

### Auth

JWT access/refresh token pair. Refresh tokens are hashed and stored in the `RefreshToken` table -- each refresh rotates the token and invalidates the previous one.

| Token | Expiry env var | Secret env var |
|-------|----------------|----------------|
| Access | `JWT_ACCESS_EXPIRES_IN` (default 15m) | `JWT_ACCESS_SECRET` |
| Refresh | `JWT_REFRESH_EXPIRES_IN` (default 7d) | `JWT_REFRESH_SECRET` |

Forgot password issues a single-use Redis token (15 min TTL) and always returns 204 to prevent email enumeration. Account deletion soft-deletes the record, revokes all sessions, blacklists the access token, and sends a farewell email.

### Blogger

Posts support a draft / publish / archive lifecycle with slug generation, view count, toggle like, tag filtering, and pagination. Comments support nested replies -- soft delete preserves thread integrity. Share links use a short code and expire after 30 days.

See the interactive docs for the full endpoint list.

### Mailer

Nodemailer SMTP. Sends welcome, forgot-password, account-deleted, and new-comment emails. All templates share a base layout in `src/mail/templates/base.template.ts`.

### Uploads

Cloudinary integration via `UploadModule`. Accepts JPEG, PNG, WebP, and GIF up to 5 MB.

> **Note:** Cloudinary environment config is not yet finalized for production.
