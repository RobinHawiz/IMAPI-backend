# IMAPI Backend API

IMAPI is the backend for a movie discovery and review platform. The API proxies selected TMDb v3 endpoints for searching, listing popular movies, and retrieving movie details, while IMAPI manages its own user authentication and persistent review data (create/read/update/delete), including a 1-10 rating system and like functionality on reviews.

## Tech Stack

- **Node.js + Fastify**
- **TypeScript**
- **AJV** (Fastify JSON schema validation)
- **Awilix + `@fastify/awilix`** (dependency injection)
- **SQLite** (`better-sqlite3`)
- **bcrypt** (password hashing)
- **jsonwebtoken** (JWT auth)
- **TMDb v3 API** ([docs](https://developer.themoviedb.org/reference/intro/getting-started))

## Project Structure

This project uses a layered structure with domain-oriented files.

Primary domains in this project are `user`, `review`, and `movie`.

Example: `routes/review.ts`, `controllers/review.ts`, `services/review.ts`, `repositories/review.ts`, `schemas/review.ts` all belong to the review domain.

```plaintext
src/
├── app.ts                 # Fastify app setup (CORS, DI, route mounting)
├── server.ts              # Server entrypoint
├── config/                # Env + SQLite connection
├── errors/                # DomainError
├── hooks/                 # JWT auth hook
├── models/                # TypeScript domain models
├── schemas/               # AJV schemas for route validation
├── routes/                # Route registration
├── controllers/           # HTTP handling + response mapping
├── services/              # Business logic
├── repositories/          # DB / external API access
└── utils/                 # Shared helper utilities
```

## Setup and Run

### 1. Install dependencies

```code
npm install
```

### 2. Configure environment variables

Create `.env` in the project root.

```env
# Used by src/config/db.ts during runtime
DATABASE=../db/sqlite.db

# Used by install.ts when initializing DB
DATABASE_INSTALL_PATH=db/sqlite.db

# JWT signing key
JWT_SECRET_KEY=replace_with_a_long_random_secret

# TMDb API Bearer token
TMDB_TOKEN=replace_with_tmdb_bearer_token

# Optional
PORT=3000
CORS_ORIGINS=*
```

Generate a JWT secret key:

```code
npm run genSecretKey
```

### 3. Initialize SQLite database

```code
npm run db:init
```

> [!WARNING]
> This script drops and recreates `user`, `review`, and `review_like` tables.

### 4. Build and start

```code
npm run build
npm start
```

Default base URL:

- `http://localhost:3000`

## NPM Scripts

- `npm run build` compiles TypeScript to `dist/`
- `npm start` starts `dist/server.js`
- `npm run db:init` recreates database tables
- `npm run genSecretKey` prints a random JWT secret

## Authentication

JWT is required for protected routes.

Send header:

`Authorization: Bearer <token>`

Auth outcomes:

- `401 Unauthorized` if token is missing
- `403 Forbidden` if token is invalid

### Login

`POST /api/users/login` returns a JWT string with 1 hour expiry.

### Validate token

`GET /api/auth` returns:

- `200 OK` when token is valid
- `401/403` when token is missing or invalid

## Data Model

SQLite tables created by `install.ts`:

### `user`

| Column          | Type    | Notes                          |
| --------------- | ------- | ------------------------------ |
| `id`            | INTEGER | PK, autoincrement              |
| `first_name`    | TEXT    | required                       |
| `last_name`     | TEXT    | required                       |
| `username`      | TEXT    | required, unique               |
| `password_hash` | TEXT    | required, bcrypt hash (stored) |

### `review`

| Column          | Type      | Notes                                  |
| --------------- | --------- | -------------------------------------- |
| `id`            | INTEGER   | PK, autoincrement                      |
| `user_id`       | INTEGER   | FK -> `user.id`, `ON DELETE CASCADE`   |
| `tmdb_movie_id` | TEXT      | required                               |
| `title`         | TEXT      | required                               |
| `review_text`   | TEXT      | required                               |
| `rating`        | INTEGER   | required (validated 1-10 in API layer) |
| `created_at`    | TIMESTAMP | default `CURRENT_TIMESTAMP`, required  |

### `review_like`

| Column      | Type    | Notes                                  |
| ----------- | ------- | -------------------------------------- |
| `user_id`   | INTEGER | FK -> `user.id`, `ON DELETE CASCADE`   |
| `review_id` | INTEGER | FK -> `review.id`, `ON DELETE CASCADE` |

Composite primary key: (`user_id`, `review_id`).

## Validation Rules (AJV)

### User payloads

- Register body (`POST /api/users/register`)
  - `firstName`: string, 1-50
  - `lastName`: string, 1-50
  - `username`: string, 1-50
  - `password`: string, 8-100
- Login body (`POST /api/users/login`)
  - `username`: string, 1-50
  - `password`: string, 8-100

### Review payloads

- Create body (`POST /api/reviews/me`)
  - `tmdbMovieId`: string, min 1
  - `title`: string, 1-50
  - `reviewText`: string, 50-1000
  - `rating`: number, 1-10
- Update body (`PUT /api/reviews/:reviewId/me`)
  - `title`: string, 1-50
  - `reviewText`: string, 50-1000
  - `rating`: number, 1-10

## API Endpoints

### Auth

| Method | Route       | Protected | Description        | Responses             |
| ------ | ----------- | :-------: | ------------------ | --------------------- |
| GET    | `/api/auth` |    Yes    | Validate JWT token | `200` `401/403` `500` |

### Users

| Method | Route                 | Protected | Description                    | Body                                          | Responses                        |
| ------ | --------------------- | :-------: | ------------------------------ | --------------------------------------------- | -------------------------------- |
| POST   | `/api/users/register` |    No     | Register new user              | `{ firstName, lastName, username, password }` | `201` (+ `Location`) `400` `500` |
| POST   | `/api/users/login`    |    No     | Authenticate user, return JWT  | `{ username, password }`                      | `200` (JWT string) `400` `500`   |
| GET    | `/api/users/me`       |    Yes    | Get current authenticated user | None                                          | `200` `400` `401/403` `500`      |

### Movies

| Method | Route                      | Protected | Description                            | Params / Query | Responses         |
| ------ | -------------------------- | :-------: | -------------------------------------- | -------------- | ----------------- |
| GET    | `/api/movies/popular`      |    No     | Get popular movies from TMDb           | None           | `200` `400` `500` |
| GET    | `/api/movies/search`       |    No     | Search movies from TMDb                | `?query=...`   | `200` `400` `500` |
| GET    | `/api/movies/:tmdbMovieId` |    No     | Get movie details + local rating stats | `tmdbMovieId`  | `200` `400` `500` |

> [!NOTE]
> If `query` is missing or empty, backend falls back to popular movies.

### Reviews

| Method | Route                              | Protected | Description                          | Body / Params                                | Responses                                  |
| ------ | ---------------------------------- | :-------: | ------------------------------------ | -------------------------------------------- | ------------------------------------------ |
| GET    | `/api/movies/:tmdbMovieId/reviews` |    No     | Get all reviews for a movie          | `tmdbMovieId`                                | `200` `400` `500`                          |
| GET    | `/api/reviews/:reviewId`           |    No     | Get single review by id              | `reviewId`                                   | `200` `400` `500`                          |
| GET    | `/api/reviews/me`                  |    Yes    | Get current user's reviews           | None                                         | `200` `400` `401/403` `500`                |
| POST   | `/api/reviews/me`                  |    Yes    | Create review for authenticated user | `{ tmdbMovieId, title, reviewText, rating }` | `201` (+ `Location`) `400` `401/403` `500` |
| PUT    | `/api/reviews/:reviewId/me`        |    Yes    | Update review                        | `reviewId` + `{ title, reviewText, rating }` | `204` `400` `401/403` `500`                |
| DELETE | `/api/reviews/:reviewId/me`        |    Yes    | Delete review                        | `reviewId`                                   | `204` `400` `401/403` `500`                |
| POST   | `/api/reviews/:reviewId/like`      |    Yes    | Like a review                        | `reviewId`                                   | `201` `400` `401/403` `500`                |
| DELETE | `/api/reviews/:reviewId/like`      |    Yes    | Remove like from review              | `reviewId`                                   | `204` `400` `401/403` `500`                |

## Error Handling

- Validation and business-rule errors are returned as `400` with `{ "message": "..." }`
- Missing token returns `401`
- Invalid token returns `403`
- Unexpected errors return `500` with `{ "ok": false }`
