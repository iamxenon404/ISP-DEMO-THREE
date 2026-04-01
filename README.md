# ISP AutoPilot — Demo Setup

## Stack
- **Frontend**: Next.js 15 + TypeScript
- **Backend**: NestJS + Prisma + PostgreSQL

---

## Backend Setup

```bash
cd backend
npm install

# Copy env and fill in your Postgres credentials
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Run migrations (creates the users table)
npx prisma migrate dev --name init

# Seed demo users
npx ts-node prisma/seed.ts

# Start dev server (runs on port 4000)
npm run start:dev
```

---

## Frontend Setup

```bash
cd frontend
npm install

# .env.local is already configured for local dev
# NEXT_PUBLIC_API_URL=http://localhost:4000/api

npm run dev
# Runs on http://localhost:3000
```

---

## Demo Accounts

| Role        | Email                 | Password  |
|-------------|-----------------------|-----------|
| Admin       | admin@isp.com         | password  |
| Customer    | customer@isp.com      | password  |
| Support     | support@isp.com       | password  |
| Technician  | technician@isp.com    | password  |

---

## API Endpoints

| Method | Endpoint          | Auth     | Description          |
|--------|-------------------|----------|----------------------|
| POST   | /api/auth/register| Public   | Create account       |
| POST   | /api/auth/login   | Public   | Login + get token    |
| POST   | /api/auth/logout  | Required | Logout               |
| GET    | /api/auth/me      | Required | Get current user     |

---

## Project Structure

```
backend/
  src/
    auth/           → register, login, logout, me
    users/          → user service (stub for admin features)
    prisma/         → DB service
  prisma/
    schema.prisma   → User model with role + status
    seed.ts         → Demo users

frontend/
  app/
    (auth)/
      login/        → Login page
      register/     → Register page with role selector
    (dashboard)/
      layout.tsx    → Shared sidebar layout
      customer/     → Customer overview
      admin/        → Admin overview
      support/      → Support overview
      technician/   → Technician overview
  components/
    Sidebar.tsx     → Role-aware navigation
  lib/
    api.ts          → Axios instance
    auth.ts         → Auth helpers + API calls
  middleware.ts     → Route protection + role redirect
```