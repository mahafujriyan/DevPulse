# DevPulse

Internal tech issue and feature tracker for software teams — report bugs, suggest features, and coordinate resolutions with role-based access control.

**Live API:** https://dev-pulse-one-sigma.vercel.app

## Features

- User registration and JWT authentication
- Role-based permissions (`contributor` / `maintainer`)
- Issue CRUD with filtering and sorting
- Reporter details without SQL JOINs (separate queries)
- Standardized JSON success/error responses
- Deployed on Vercel with PostgreSQL (Supabase)

## Tech Stack

| Technology   | Usage                                      |
| ------------ | ------------------------------------------ |
| Node.js 24.x | LTS runtime                                |
| TypeScript   | Strict typing (no `any`)                     |
| Express.js   | Modular router architecture                |
| PostgreSQL   | Native `pg` driver, raw SQL only           |
| bcrypt       | Password hashing (10 salt rounds)          |
| jsonwebtoken | JWT auth with `id`, `name`, `role` payload |
| http-status-codes | Consistent HTTP status codes          |

## Project Structure

```
DevPulse/
├── database/
│   └── schema.sql           # PostgreSQL schema
├── scripts/
│   └── build-vercel.cjs     # Vercel production bundle
├── src/
│   ├── application.ts       # Express app (Vercel entry)
│   ├── local-server.ts      # Local dev server
│   ├── config/                # env, db pool, validation
│   ├── middleware/            # auth, errors, async handler
│   ├── modules/
│   │   ├── auth/              # signup, login
│   │   └── issues/            # issue CRUD
│   ├── database/
│   │   └── migrate.ts         # Schema migration runner
│   ├── types/                 # TypeScript interfaces
│   └── utils/                 # responses, validation, errors
├── api/                       # Generated at build (gitignored)
├── index.js                   # Vercel Express entry shim
├── vercel.json
└── package.json
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

| Variable         | Description                                |
| ---------------- | ------------------------------------------ |
| `PORT`           | Local server port (default `5000`)         |
| `NODE_ENV`       | `development` or `production`            |
| `DATABASE_URL`   | PostgreSQL connection string (pooled)      |
| `JWT_SECRET`     | 32+ character secret (alphanumeric only)   |
| `JWT_EXPIRES_IN` | Token expiry (default `7d`)              |

**Supabase (recommended):** Project Settings → Database → Connection string → **Transaction pooler** URI (`pooler.supabase.com`, port `6543`).

### 3. Create database tables

```bash
npm run db:migrate
```

Or paste `database/schema.sql` into your provider's SQL editor.

### 4. Run locally

```bash
npm run dev
```

Server starts at `http://localhost:5000`.

## API Endpoints

### Authentication

| Method | Endpoint           | Access | Description        |
| ------ | ------------------ | ------ | ------------------ |
| POST   | `/api/auth/signup` | Public | Register new user  |
| POST   | `/api/auth/login`  | Public | Login, get JWT     |

### Issues

| Method | Endpoint            | Access       | Description              |
| ------ | ------------------- | ------------ | ------------------------ |
| POST   | `/api/issues`       | Authenticated | Create issue            |
| GET    | `/api/issues`       | Public       | List issues (filter/sort) |
| GET    | `/api/issues/:id`   | Public       | Get single issue         |
| PATCH  | `/api/issues/:id`   | Authenticated | Update issue            |
| DELETE | `/api/issues/:id`   | Maintainer   | Delete issue             |

**Query parameters for `GET /api/issues`:**

| Param    | Values                              | Default  |
| -------- | ----------------------------------- | -------- |
| `sort`   | `newest`, `oldest`                  | `newest` |
| `type`   | `bug`, `feature_request`            | (none)   |
| `status` | `open`, `in_progress`, `resolved`   | (none)   |

**Authorization header:** `Authorization: <JWT_TOKEN>` (Bearer prefix also accepted)

### Health

| Method | Endpoint       | Access | Description     |
| ------ | -------------- | ------ | --------------- |
| GET    | `/api/health`  | Public | DB connectivity |

## Response Format

**Success:**
```json
{ "success": true, "message": "...", "data": {} }
```

**Error:**
```json
{ "success": false, "message": "...", "errors": "..." }
```

## User Roles

| Role          | Permissions                                              |
| ------------- | -------------------------------------------------------- |
| `contributor` | Register, login, create issues, view all, update own open issues |
| `maintainer`  | All contributor actions + update any issue/status, delete any issue |

## Database Schema

### `users`

| Field        | Description                          |
| ------------ | ------------------------------------ |
| `id`         | Auto-increment primary key           |
| `name`       | Display name (required)              |
| `email`      | Unique login email (required)        |
| `password`   | bcrypt hash (never returned in API)  |
| `role`       | `contributor` or `maintainer`        |
| `created_at` | Auto-generated timestamp             |
| `updated_at` | Auto-updated on change               |

### `issues`

| Field          | Description                              |
| -------------- | ---------------------------------------- |
| `id`           | Auto-increment primary key               |
| `title`        | Max 150 characters (required)            |
| `description`  | Min 20 characters (required)             |
| `type`         | `bug` or `feature_request`               |
| `status`       | `open`, `in_progress`, `resolved`        |
| `reporter_id`  | User ID (validated in application logic) |
| `created_at`   | Auto-generated timestamp                 |
| `updated_at`   | Auto-updated on change                   |

## Scripts

| Command              | Description                        |
| -------------------- | ---------------------------------- |
| `npm run dev`        | Start local dev server             |
| `npm run build`      | Compile TypeScript to `dist/`      |
| `npm run vercel-build` | Bundle for Vercel deployment     |
| `npm run db:migrate` | Run `database/schema.sql`          |
| `npm start`          | Run compiled local server          |

## Vercel Deployment

1. Push to GitHub (public repo)
2. Import project in Vercel — Framework Preset: **Other**, Node.js **24.x**
3. Set environment variables:
   - `DATABASE_URL` — Supabase pooled URI
   - `JWT_SECRET` — 32+ alphanumeric characters
   - `JWT_EXPIRES_IN` — `7d`
   - `NODE_ENV` — `production`
4. Deploy — `vercel-build` bundles Express via `@vercel/ncc` into `api/index.js`

## Submission Checklist

- [x] GitHub Repo (Public): https://github.com/mahafujriyan/DevPulse
- [x] Live Deployment: https://dev-pulse-one-sigma.vercel.app
- [ ] Interview Video (add your link)
