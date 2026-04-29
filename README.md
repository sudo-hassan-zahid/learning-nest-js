<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest
  
## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Database (local development)

Postgres runs in Docker. The app itself runs locally with `npm run start:dev`.

### Prerequisites
- Docker >= 24 and Docker Compose v2

### Commands

```bash
# start all services
$ docker compose up -d

# stop all services (data persisted)
$ docker compose down

# stop and wipe all volumes (destructive)
$ docker compose down -v

# view running containers
$ docker compose ps

# tail logs for all services
$ docker compose logs -f

# tail logs for a specific service
$ docker compose logs -f db
$ docker compose logs -f redis

# restart a specific service
$ docker compose restart db
$ docker compose restart redis

# open a psql shell inside the container
$ docker compose exec db psql -U postgres -d nestdb

# open a redis-cli shell inside the container
$ docker compose exec redis redis-cli
```

### Connection details

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

### Setup

Copy the example env file and fill in your values:

```bash
$ cp .env.example .env
```

### Commands

```bash
# run all pending migrations
$ npx prisma migrate dev

# create a new migration after schema changes
$ npx prisma migrate dev --name <migration-name>

# apply migrations in CI/production (no prompt)
$ npx prisma migrate deploy

# open Prisma Studio (visual DB browser)
$ npx prisma studio

# validate the schema
$ npx prisma validate

# regenerate the Prisma client after schema changes
$ npx prisma generate
```

> **Note:** The `url` field is intentionally absent from `datasource db` in `schema.prisma`. Prisma 7 reads the connection URL from `prisma.config.ts` instead.

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