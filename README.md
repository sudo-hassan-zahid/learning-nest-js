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
$ docker compose exec db psql -U postgres -d nestdb

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
| Database | `nestdb` |
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

Running `npx prisma db seed` creates the following users (password: `Admin1234!` / `Password1234!`):

| Email | Password |
|-------|----------|
| `admin@example.com` | `Admin1234!` |
| `jane@example.com` | `Password1234!` |
| `john@example.com` | `Password1234!` |

Seed uses `upsert` — safe to run multiple times.

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

## API

All protected routes require `Authorization: Bearer <accessToken>`.

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/signup` | Public | Register a new user, returns token pair |
| `POST` | `/auth/login` | Public | Login, returns token pair |
| `GET` | `/auth/me` | Access token | Returns the current user |
| `POST` | `/auth/refresh` | Refresh token | Rotates and returns a new token pair |
| `POST` | `/auth/logout` | Access token | Invalidates all refresh tokens |

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/users` | Access token | List all active users |
| `GET` | `/users/:id` | Access token | Get a single user |
| `PATCH` | `/users/:id` | Access token | Update own profile (owner only) |
| `DELETE` | `/users/:id` | Access token | Soft-delete own account (owner only) |

### Tokens

| Token | Expiry | Secret env var |
|-------|--------|----------------|
| Access | `JWT_ACCESS_EXPIRES_IN` (default 15m) | `JWT_ACCESS_SECRET` |
| Refresh | `JWT_REFRESH_EXPIRES_IN` (default 7d) | `JWT_REFRESH_SECRET` |

Refresh tokens are hashed and stored in the `RefreshToken` table. Each refresh rotates the token — the old one is invalidated immediately.
