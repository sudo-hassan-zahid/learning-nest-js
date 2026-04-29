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