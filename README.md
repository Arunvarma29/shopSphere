# ShopSphere — MERN E-commerce

A structured full-stack commerce starter with customer storefront and a protected admin console. React is the UI library; Vite is the frontend build tool.

## Requirements
- Node.js 20+ and npm
- MongoDB local or MongoDB Atlas

## Setup
1. Copy `server/.env.example` to `server/.env` and set `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL` and `ADMIN_EMAIL`/`ADMIN_PASSWORD`.
2. Install dependencies: `npm install --prefix server` and `npm install --prefix client`.
3. Start MongoDB locally (`docker compose up -d mongodb`) or use Atlas.
4. Seed demo products and a first admin: `npm --prefix server run seed`. The seed command only creates the admin if the configured email does not already exist. Change the password immediately.
5. Start API: `npm --prefix server run dev`; start UI in another terminal: `npm --prefix client run dev`.
6. Open http://localhost:5173. API health: http://localhost:5000/api/health.

## Roles and security
- Public registration always assigns `customer`; role is never accepted from the request body.
- Admin creation is through the seed script or a trusted out-of-band process, never public signup.
- Admin endpoints use server-side `protect` + `requireAdmin`; hiding UI controls is not treated as security.
- Access JWT is short-lived and held in memory by the client; refresh token is an HttpOnly, SameSite cookie. Use HTTPS and `COOKIE_SECURE=true` in production.
- Configure exact `CLIENT_URL`, strong independent JWT secrets, rate limits, MongoDB network restrictions and backups before launch.

## Included modules
Authentication/refresh/logout, product catalogue and admin CRUD, categories, admin overview, customer listing/activation, order creation/history/admin status changes, responsive customer UI and admin console.

## Production checklist (not yet a claim of production certification)
- Integrate and test Razorpay order creation, signature verification and webhooks before accepting online payments. COD is the only enabled checkout method in this starter.
- Add Cloudinary signed uploads, email verification/password reset, audit logs, review moderation, coupon rules and full automated test coverage.
- Add transactional stock reservation (MongoDB replica set required), idempotency keys, payment reconciliation, monitoring, alerting, backups and a security review.
- Set CORS/cookie settings for the actual deployment domains and configure frontend/backend environment variables.

## API outline
`/api/auth` (register, login, refresh, logout, me), `/api/products`, `/api/categories`, `/api/orders`, `/api/admin` (overview, products, categories, customers, order status).
