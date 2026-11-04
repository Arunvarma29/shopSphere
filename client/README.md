# ShopSphere frontend

React + Vite storefront for the supplied ShopSphere Express/MongoDB backend. All API calls use Axios directly in the page/component that needs the data. There is intentionally **no `api/` folder**.

## Features

- Responsive storefront, product listing, search, sort, category filter, product details
- Cart saved in localStorage
- Customer registration, login, account and order history
- Checkout using the backend's Cash on Delivery order endpoint
- Admin dashboard for overview, products, categories, customers and order status
- Bearer access-token authentication and HttpOnly refresh-cookie requests
- Vercel SPA rewrite for direct navigation to nested routes

## Local development

1. Install Node.js 20 or later.
2. From this folder:
   ```bash
   npm install
   cp .env.example .env
   npm run dev
   ```
3. Set `VITE_API_URL=http://localhost:5000/api` in `.env` when running the supplied backend locally.

## Vercel deployment

- Import the frontend folder/repository in Vercel.
- Set **Root Directory** to `client` if this folder is inside a monorepo, or leave it at `./` if this folder is the repository root.
- Framework preset: Vite.
- Build command: `npm run build`.
- Output directory: `dist`.
- Add the Production environment variable:
  ```env
  VITE_API_URL=https://YOUR-RENDER-SERVICE.onrender.com/api
  ```
- Redeploy after adding/changing the variable. Vite embeds `VITE_` variables during the build.
- `vercel.json` rewrites app routes to `index.html`, so `/products/:slug`, `/account`, and `/admin` work on refresh.

## Backend environment

The backend's `CLIENT_URL` must exactly match the deployed Vercel origin, for example:

```env
CLIENT_URL=https://your-shop.vercel.app
```

For cross-site refresh cookies, configure the backend's existing cookie settings as:

```env
COOKIE_SECURE=true
COOKIE_SAME_SITE=none
```

The supplied backend already reads `COOKIE_SAME_SITE` and `COOKIE_SECURE`. Browser third-party-cookie restrictions can still block a cross-site refresh cookie; a custom domain with frontend and API on sibling subdomains is the more reliable long-term setup. The frontend sends `withCredentials: true` on auth/refresh/logout and checkout requests. It also stores the short-lived access token in localStorage to send Bearer auth headers.

## API paths used (match supplied server)

- Public: `GET /products`, `GET /products/:id`
- Auth: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me`
- Customer: `POST /orders`, `GET /orders/mine`
- Admin (Bearer token): `GET /admin/overview`, `/admin/products`, `/admin/orders`, `/admin/customers`, `/admin/categories`; corresponding POST/PATCH/DELETE routes from the server router.

## Important notes

- The backend exposes category management only under the protected `/admin/categories` route. The public shop derives its category filter options from categories returned with public product records; it does not call the protected admin route as a guest.
- Public registration always creates a customer. Create the admin account through the backend's seed process; do not grant admin role from the browser.
- Product images are rendered from the `imageUrl` field. Use publicly accessible HTTPS image URLs.
- This frontend matches the supplied backend's current COD-only checkout. Online payment is not included.
- Before real commercial launch, add/verify CSRF protections for cookie-authenticated flows, automated tests, transactional stock reservation, payment integration/webhooks if needed, monitoring and backups.
