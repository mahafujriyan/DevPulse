# DevPulse

Internal tech issue and feature tracker for software teams. Report bugs, suggest features, and coordinate resolutions with role-based access control.

## Tech Stack

- **Node.js** 24.x+ (LTS)
- **TypeScript**
- **Express.js** (modular routers)
- **PostgreSQL** via native `pg` driver (raw SQL only — no ORM, no query builders, no JOINs)
- **bcrypt** (password hashing)
- **jsonwebtoken** (JWT auth)

## Prerequisites

- Node.js 24.x or higher
- PostgreSQL (local via pgAdmin) **or** [Neon](https://neon.tech) hosted database

## Project Structure

```
DevPulse/
├── database/
│   └── schema.sql              # SQL schema (users + issues)
├── src/
│   ├── config/                 # env + PostgreSQL pool
│   ├── middleware/             # auth, errors, async wrapper
│   ├── modules/
│   │   ├── auth/               # signup, login routes + service
│   │   └── issues/             # CRUD routes + service
│   ├── database/               # migration runner
│   ├── types/                  # TypeScript interfaces
│   └── utils/                  # responses, validation, errors
├── .env.example
└── package.json
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example file and edit it:

```bash
cp .env.example .env
```

Required variables:

| Variable         | Description                  |
| ---------------- | ---------------------------- |
| `PORT`           | Server port (default `5000`) |
| `DATABASE_URL`   | PostgreSQL connection string |
| `JWT_SECRET`     | Secret for signing JWTs      |
| `JWT_EXPIRES_IN` | Token expiry (default `7d`)  |

**Local pgAdmin:**

```env

```

**Neon:** Dashboard → Connect → enable **Connection pooling** → copy the pooled URI. Use only `?sslmode=require` (remove `channel_binding=require` if present).

```env
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-xxxx-pooler.region.aws.neon.tech/neondb?sslmode=require
```

### 3. Create the database

**pgAdmin:** Create a database named `devpulse`.

**Neon:** Use the default `neondb` database or run `database/schema.sql` in the Neon SQL Editor.

### 4. Run migrations

```bash
npm run db:migrate
```

Or paste `database/schema.sql` into pgAdmin Query Tool / Neon SQL Editor.

### 5. Start the server

```bash
# Development (hot reload)
npm run dev

# Production build
npm run build
npm start
```

Server runs at `http://localhost:5000`.

Health check: `GET http://localhost:5000/api/health`

## npm Scripts

| Script               | Description                      |
| -------------------- | -------------------------------- |
| `npm run dev`        | Start dev server with hot reload |
| `npm run build`      | Compile TypeScript to `dist/`    |
| `npm start`          | Run compiled production server   |
| `npm run db:migrate` | Apply `database/schema.sql`      |

## API Endpoints

### Authentication

| Method | Endpoint           | Access        | Description                |
| ------ | ------------------ | ------------- | -------------------------- |
| POST   | `/api/auth/signup` | Public        | Register user              |
| POST   | `/api/auth/login`  | Public        | Login, receive JWT         |
| GET    | `/api/auth/me`     | Authenticated | Verify token / get profile |

### Issues

| Method | Endpoint          | Access        | Description               |
| ------ | ----------------- | ------------- | ------------------------- |
| GET    | `/api/issues`     | Public        | List issues (filter/sort) |
| GET    | `/api/issues/:id` | Public        | Get single issue          |
| POST   | `/api/issues`     | Authenticated | Create issue              |
| PATCH  | `/api/issues/:id` | Authenticated | Update issue              |
| DELETE | `/api/issues/:id` | Maintainer    | Delete issue              |

### Query parameters (GET `/api/issues`)

| Param    | Values                            | Default  |
| -------- | --------------------------------- | -------- |
| `sort`   | `newest`, `oldest`                | `newest` |
| `type`   | `bug`, `feature_request`          | (none)   |
| `status` | `open`, `in_progress`, `resolved` | (none)   |

## Authentication

Send the JWT in the `Authorization` header:

```
Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Bearer prefix is also supported:

```
Authorization: Bearer <token>
```

## Roles & Permissions

| Action                | Contributor | Maintainer |
| --------------------- | :---------: | :--------: |
| Register / login      |     ✅      |     ✅     |
| Create issues         |     ✅      |     ✅     |
| View all issues       |     ✅      |     ✅     |
| Update own open issue |     ✅      |     ✅     |
| Update any issue      |     ❌      |     ✅     |
| Change issue status   |     ❌      |     ✅     |
| Delete issues         |     ❌      |     ✅     |

## Response Format

**Success:**

```json
{
  "success": true,
  "message": "Operation description",
  "data": {}
}
```

**Error:**

```json
{
  "success": false,
  "message": "Error description",
  "errors": "Optional details"
}
```

## Postman Tips

1. Use **Body → raw → JSON** for POST/PATCH requests (not Params).
2. Login first, copy the `token`, then add it as an `Authorization` header on protected routes.
3. Contributors can only PATCH their own issues while status is `open`.

## Live Deployment (Vercel)

| Link     | URL                                                |
| -------- | -------------------------------------------------- |
| Live API | `https://dev-pulse-ten-beta.vercel.app`            |
| Health   | `https://dev-pulse-ten-beta.vercel.app/api/health` |
| GitHub   | `https://github.com/mahafujriyan/DevPulse`         |

### Deploy steps

1. Push code to GitHub
2. Import repo on [vercel.com](https://vercel.com)
3. Add environment variables (see `.env.example`)
4. Redeploy → test `/api/health`

Full submission checklist: see [SUBMISSION.md](./SUBMISSION.md)

## License

ISC
