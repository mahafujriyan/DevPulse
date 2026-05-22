# DevPulse — Assignment Submission Guide

## Live Links (submit these)

| Item | URL |
|------|-----|
| **Live API** | `https://dev-pulse-ten-beta.vercel.app` |
| **Health Check** | `https://dev-pulse-ten-beta.vercel.app/api/health` |
| **GitHub Repo** | `https://github.com/mahafujriyan/DevPulse` |

---

## Pre-Submit Checklist

### Code
- [x] TypeScript + Express modular routers
- [x] Raw SQL with `pg` (no ORM, no JOINs)
- [x] bcrypt password hashing (10 rounds)
- [x] JWT authentication
- [x] Role-based permissions (contributor / maintainer)
- [x] All required API endpoints implemented
- [x] Standard success/error response format
- [x] `npm run build` passes

### Database (Supabase)
- [x] `database/schema.sql` — users + issues tables
- [x] Run migration: `npm run db:migrate` OR Supabase SQL Editor

### Vercel Deploy
- [ ] Code pushed to GitHub `main`
- [ ] Vercel project connected to repo
- [ ] Environment variables set (see below)
- [ ] Redeploy after env setup
- [ ] `/api/health` returns `"database": "connected"`

---

## Vercel Environment Variables

**Settings → Environment Variables** (Production + Preview + Development):

```
DATABASE_URL=postgresql://postgres.qwrbhzbvfnojvxoshvse:YOUR_PASSWORD@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
NODE_ENV=production
```

Use **Session pooler** (port **6543**), NOT direct connection (5432).

---

## API Endpoints Quick Test (Postman)

### 1. Signup
```
POST /api/auth/signup
```
```json
{
  "name": "John Doe",
  "email": "john@devpulse.com",
  "password": "securePassword123",
  "role": "contributor"
}
```

### 2. Login
```
POST /api/auth/login
```
```json
{
  "email": "john@devpulse.com",
  "password": "securePassword123"
}
```
Copy the `token` from response.

### 3. Create Issue
```
POST /api/issues
Authorization: <token>
```
```json
{
  "title": "Database connection timeout under load",
  "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
  "type": "bug"
}
```

### 4. List Issues
```
GET /api/issues?sort=newest
```

### 5. Get Single Issue
```
GET /api/issues/1
```

### 6. Update Issue (contributor — own open issue only)
```
PATCH /api/issues/1
Authorization: <token>
```
```json
{
  "title": "Updated title here",
  "description": "Updated description with at least twenty characters",
  "type": "bug"
}
```

### 7. Register Maintainer (for delete test)
```
POST /api/auth/signup
```
```json
{
  "name": "Admin User",
  "email": "admin@devpulse.com",
  "password": "securePassword123",
  "role": "maintainer"
}
```

### 8. Delete Issue (maintainer only)
```
DELETE /api/issues/1
Authorization: <maintainer_token>
```

---

## Common Mistakes to Avoid

| Wrong | Correct |
|-------|---------|
| Browser GET `/api/auth/signup` | Postman **POST** `/api/auth/signup` |
| `/api/auth/singup` | `/api/auth/signup` |
| No Vercel env variables | Set all 4 env vars in dashboard |
| Supabase port 5432 | Session pooler port **6543** |
| Params tab in Postman | Body → raw → JSON |

---

## Local Development

```bash
npm install
cp .env.example .env    # edit with your credentials
npm run db:migrate
npm run dev
```

Server: `http://localhost:5000`

---

## Assignment Compliance Summary

| Requirement | Status |
|-------------|--------|
| Node.js + TypeScript | Done |
| Express modular routers | Done |
| PostgreSQL native `pg` | Done |
| Raw SQL, no ORM/JOINs | Done |
| bcrypt (8–12 rounds) | Done (10 rounds) |
| JWT auth | Done |
| User roles & permissions | Done |
| All auth endpoints | Done |
| All issue endpoints | Done |
| Standard response format | Done |
| http-status-codes package | Done |
