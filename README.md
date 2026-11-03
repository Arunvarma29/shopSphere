# ShopSphere

ShopSphere is a full-stack e-commerce starter for discovering and ordering everyday products. It includes a React storefront, an Express API, MongoDB persistence, customer accounts, checkout with cash on delivery, and a protected admin console.

## Features

- Browse products and search by name, description, or tag.
- View product details, categories, prices, and stock status.
- Add available products to the cart and adjust quantities within stock limits.
- Register, sign in, manage an account, and view order history.
- Place orders using cash on delivery.
- Use an admin console to manage products, categories, customers, and orders.
- Responsive ShopSphere storefront with an About page.

## Tech stack

- **Frontend:** React 18, React Router, Vite, Axios
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB 7 or MongoDB Atlas
- **Authentication:** JWT access tokens and HttpOnly refresh-token cookies

## Requirements

- Node.js 20 or newer and npm
- MongoDB locally or a MongoDB Atlas cluster
- Docker Compose (optional, for running MongoDB locally)

## Getting started

Run commands from the project root unless noted otherwise.

### 1. Install dependencies

```bash
npm run install:all
```

Or install each app separately:

```bash
npm install --prefix server
npm install --prefix client
```

### 2. Configure the environment

Create local environment files from the examples:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

On Windows PowerShell, use:

```powershell
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
```

Edit `server/.env` and set at least:

| Variable | Purpose | Example |
|---|---|---|
| `PORT` | API server port | `5000` |
| `CLIENT_URL` | Exact frontend origin allowed by CORS | `http://localhost:5173` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/shopsphere` |
| `JWT_ACCESS_SECRET` | Secret used to sign access tokens | Use a long, random secret |
| `JWT_REFRESH_SECRET` | Separate secret used to sign refresh tokens | Use another long, random secret |
| `ACCESS_TOKEN_TTL` | Access-token lifetime | `15m` |
| `REFRESH_TOKEN_DAYS` | Refresh-token lifetime in days | `7` |
| `COOKIE_SECURE` | Set secure cookies over HTTPS | `false` locally; `true` in production |
| `ADMIN_NAME` | Name for the initial admin account | `Store Admin` |
| `ADMIN_EMAIL` | Email for the initial admin account | `admin@example.com` |
| `ADMIN_PASSWORD` | Initial admin password (at least 12 characters) | Set a unique secret |

Generate two different secrets and keep them private. For example, with OpenSSL:

```bash
openssl rand -hex 32
```

The client example uses `VITE_API_URL=http://localhost:5000/api`. Change it if the API is hosted at a different URL. Never commit `.env` files or put server secrets in client-side environment variables.

### 3. Start MongoDB

To run MongoDB locally with Docker Compose:

```bash
docker compose up -d mongodb
```

Alternatively, update `MONGODB_URI` to use your MongoDB Atlas connection string. In Atlas, ensure the cluster is running, the database user has the required access, and your current IP is allowed in Network Access.

### 4. Seed the database

```bash
npm --prefix server run seed
```

The seed script creates the configured admin account if it does not already exist. It adds the starter category and sample products only when the products collection is empty. The admin password is not changed for an existing account; change the initial password after setup.

### 5. Run the application

Open two terminals at the project root.

Terminal 1 — API:

```bash
npm run dev:server
```

Terminal 2 — frontend:

```bash
npm run dev:client
```

Open [http://localhost:5173](http://localhost:5173). The API health check is available at [http://localhost:5000/api/health](http://localhost:5000/api/health).

## Useful commands

| Command | Description |
|---|---|
| `npm run dev:client` | Start the Vite frontend |
| `npm run dev:server` | Start the API with Nodemon |
| `npm run install:all` | Install frontend and backend dependencies |
| `npm --prefix client run build` | Create the frontend production build |
| `npm --prefix client run preview` | Preview the production build locally |
| `npm --prefix server start` | Start the API without Nodemon |
| `npm --prefix server run seed` | Create the initial admin and starter data |

## Application routes

### Customer-facing pages

| Path | Page |
|---|---|
| `/` | Storefront and product search |
| `/products/:slug` | Product details |
| `/cart` | Shopping cart |
| `/checkout` | Checkout (signed-in customers) |
| `/account` | Account and order history (signed-in customers) |
| `/login` | Sign in |
| `/register` | Create an account |
| `/about` | About ShopSphere |
| `/admin` | Admin console (admins only) |

### API overview

All API routes use the `/api` prefix. JSON request bodies are expected where applicable.

| Endpoint | Access | Purpose |
|---|---|---|
| `GET /api/health` | Public | API health check |
| `POST /api/auth/register` | Public | Register as a customer |
| `POST /api/auth/login` | Public | Sign in |
| `POST /api/auth/refresh` | Refresh cookie | Refresh the access token |
| `POST /api/auth/logout` | Public | Sign out and clear the refresh cookie |
| `GET /api/auth/me` | Signed in | Get the current account |
| `GET /api/products` | Public | List and search published products |
| `GET /api/products/:id` | Public | Get a product by ID or slug |
| `POST /api/orders` | Signed in | Place an order |
| `GET /api/orders/mine` | Signed in | Get the current customer's orders |
| `/api/admin/*` | Admin | Manage products, categories, customers, and orders |

Product listing supports `q`, `category`, `sort`, `page`, and `limit` query parameters. Sorting supports `newest`, `price_asc`, and `price_desc`.

## Security and production notes

- Public registration always creates a customer account. Admin access is provisioned separately through the seed script.
- Admin API routes enforce authentication and admin authorization on the server.
- Keep access and refresh JWT secrets strong, unique, and private.
- Use HTTPS and set `COOKIE_SECURE=true` in production. Configure `CLIENT_URL` to the exact frontend origin.
- Restrict MongoDB network access, use a least-privilege database user, and maintain backups.
- Checkout currently supports cash on delivery only; online payment processing is not implemented.
- Review inventory reservation and transaction handling before production. The current order flow rechecks stock but does not provide transactional stock reservation.
- Configure production frontend and backend environment variables for their deployed origins.

## Project structure

```text
client/
  public/       Static assets
  src/
    api/        API client
    components/ Shared UI components
    context/    Authentication and cart state
    pages/      Storefront, account, checkout, admin, and other pages
    routes/     Protected route handling
server/
  src/
    config/     Database configuration
    controllers/ API request handlers
    middleware/ Authentication and error handling
    models/     Mongoose models
    routes/     Express routes
    utils/      Shared utilities and seed script
```

## License

No license is currently specified. Add a `LICENSE` file before distributing or reusing this project if a particular license is intended.
