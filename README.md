# AURVEXA — Clothing Store

AURVEXA is a full-stack fashion e-commerce platform for a Sri Lankan clothing brand, featuring a modern customer storefront, secure JWT authentication, admin product/order management, and a PostgreSQL-backed API with Prisma.

## Tech Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: PostgreSQL + Prisma ORM
- Auth: JWT (stored in localStorage on frontend)

## Features

- Customer storefront with:
  - Home page, categories, hero sections, product grid
  - Product details with size/color variants
  - Cart and checkout flow
  - Customer order history
- Admin panel with:
  - Admin login
  - Dashboard summary
  - Product CRUD (add, edit, delete)
  - Variant management (size, color, price, stock, image URL)
  - Order list and order status updates

## Project Structure

- `frontend/` - React client app
- `backend/` - Express API + Prisma schema/migrations

## Local Development

Prefer a **single** root `npm run dev` so you do not accidentally spawn duplicate Vite/API processes (that previously contributed to esbuild OOM crashes).

### One-command start (recommended)

From the repo root (after backend/frontend deps and `.env` are set up once):

```bash
npm run dev
```

This starts the API on port **5000** and Vite on **5173** via `scripts/dev.mjs` (no extra packages). Do not open a second terminal and run `npm run dev` again in `frontend/` or `backend/` while this is running.

**Note:** Keep several GB free on the drive that holds this project. A nearly full disk (`ENOSPC`) has caused Vite/esbuild and npm to crash mid-dev.

### 1) Backend setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public"
JWT_SECRET="your-long-random-secret"
CLIENT_ORIGIN="http://localhost:5173"
```

Run database migrations (once):

```bash
npx prisma migrate deploy
npm run db:generate
```

Optional: seed admin user

```bash
npm run db:seed
```

Default seeded admin:
- Email: `admin@tshirtshop.com`
- Password: `Admin@123`

API-only: `npm run dev:backend` from root, or `npm run dev` inside `backend/`.

### 2) Frontend setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL="http://localhost:5000"
```

Storefront-only: `npm run dev:frontend` from root, or `npm run dev` inside `frontend/`.

## Main Routes

### Customer
- `/`
- `/products`
- `/products/:slug`
- `/cart`
- `/checkout`
- `/orders`

### Admin
- `/admin/login`
- `/admin`
- `/admin/products`
- `/admin/orders`

## Production Notes

- Set `VITE_API_URL` to your deployed API URL before building frontend.
- Backend must run `prisma migrate deploy` during deployment.
- Keep secrets (`JWT_SECRET`, DB credentials) only in environment variables.

## Deploy frontend on Vercel

1. Push this repo to GitHub (already done).
2. Go to [https://vercel.com/new](https://vercel.com/new) and import `dinujathishean/Online-Clothing-store`.
3. Configure the project:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add Environment Variable:
   - `VITE_API_URL` = your live backend URL (example: `https://your-api.onrender.com`)
     - No trailing slash
5. Deploy.

Important: Vercel hosts the **React frontend only**. Your Express + PostgreSQL backend must be hosted separately (Render, Railway, Fly.io, etc.), then point `VITE_API_URL` to that API.

Backend production env example:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=long-random-secret
CLIENT_ORIGIN=https://your-frontend.vercel.app
PORT=5000
```
