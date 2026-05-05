# ThreadedLK - T-Shirt Shop

A modern fashion e-commerce application for a Sri Lankan T-shirt business.

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

Run database migrations and start backend:

```bash
npx prisma migrate deploy
npm run db:generate
npm run dev
```

Optional: seed admin user

```bash
npm run db:seed
```

Default seeded admin:
- Email: `admin@tshirtshop.com`
- Password: `Admin@123`

### 2) Frontend setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL="http://localhost:5000"
```

Start frontend:

```bash
npm run dev
```

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
