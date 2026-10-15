# ShopKart

ShopKart is a full-stack online shopping application built with the MERN stack. Customers can create an account, browse and search a product catalog, save products to a wishlist, manage a cart, and place orders with Razorpay.

## Features

- Customer registration, login, profile lookup, and logout
- HTTP-only cookie authentication using JSON Web Tokens
- Product catalog with product details, text search, category filtering, and price sorting
- Customer-specific cart with quantity updates and item removal
- Customer-specific wishlist
- Checkout with shipping-address validation
- Razorpay order creation and payment-signature verification
- Order history and customer-owned order details
- MongoDB persistence through Mongoose
- Responsive React frontend with Vite

## Technology

- **Frontend:** React, React Router, Axios, Vite
- **Backend:** Node.js, Express
- **Database:** MongoDB with Mongoose
- **Authentication:** JSON Web Tokens, HTTP-only cookies, bcrypt
- **Payments:** Razorpay

## Requirements

- Node.js compatible with Vite 8 (Node.js 20.19+ or 22.12+)
- npm
- MongoDB, either a local server or a MongoDB Atlas connection string
- Razorpay API keys to use checkout and payments

## Getting started

### 1. Install dependencies

Open a terminal in the repository root and install each app's dependencies:

```bash
cd backend
npm install
cd ../frontend
npm install
```

### 2. Configure the backend

Create `backend/.env` with the following values:

```dotenv
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/shopkart
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

`PORT`, `MONGO_URI`, and `JWT_EXPIRES_IN` have defaults in the application, but setting them explicitly makes the configuration clear. `JWT_SECRET` is required for authentication. Razorpay credentials are needed for payment order creation and verification; use Razorpay test credentials during development. Never commit your real `.env` file or publish payment secrets.

Start MongoDB before starting the backend. The configured database is named `shopkart`.

### 3. Start the backend

In a terminal:

```bash
cd backend
npm run dev
```

The API listens on `http://localhost:5000` by default.

### 4. Start the frontend

In a second terminal:

```bash
cd frontend
npm run dev
```

Open the Vite URL printed in the terminal (normally `http://localhost:5173`). The frontend API client is configured for `http://localhost:5000`, and the backend currently allows credentialed requests from `http://localhost:5173`.

### 5. Add products

The app does not include a product seed script. Add products to the catalog using the backend endpoint before browsing the store. For example, with the backend running, run this in PowerShell:

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/products" -ContentType "application/json" -Body '{"name":"Everyday Backpack","description":"A practical backpack for everyday use.","price":49.99,"category":"Fashion","image":"https://example.com/backpack.jpg","stock":10}'
```

The product API expects a name, description, positive price, category, image URL, and non-negative stock count. Categories currently offered in the frontend filters are `Electronics`, `Fashion`, `Books`, and `Home`.

## Available scripts

### Backend (`backend/`)

| Command | Description |
| --- | --- |
| `npm run dev` | Run the API with Nodemon during development |

### Frontend (`frontend/`)

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build the production frontend into `frontend/dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint on the frontend |

## API overview

All routes are served from `http://localhost:5000`. Cart, wishlist, and order routes require an authenticated customer cookie.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/customers/register` | Register a customer |
| `POST` | `/customers/login` | Sign in and set the authentication cookie |
| `GET` | `/customers/me` | Get the signed-in customer's profile |
| `POST` | `/customers/logout` | Clear the authentication cookie |
| `GET` | `/products` | List products; supports `search`, `category`, and `sort` query parameters |
| `GET` | `/products/:id` | Get product details |
| `POST` | `/products` | Create a catalog product |
| `GET` | `/cart` | Get the signed-in customer's cart |
| `POST` | `/cart/:productId` | Add a product to the cart |
| `PATCH` | `/cart/:productId` | Update a cart item's quantity |
| `DELETE` | `/cart/:productId` | Remove a cart item |
| `GET` | `/wishlist` | Get the signed-in customer's wishlist |
| `POST` | `/wishlist/:productId` | Add a product to the wishlist |
| `DELETE` | `/wishlist/:productId` | Remove a product from the wishlist |
| `PATCH` | `/wishlist/:productId/toggle` | Toggle a product's wishlist status |
| `POST` | `/orders/create-payment-order` | Validate checkout details and create a Razorpay order |
| `POST` | `/orders/verify-payment` | Verify payment and place the order |
| `GET` | `/orders` | List paid orders for the signed-in customer |
| `GET` | `/orders/:id` | Get an order owned by the signed-in customer |

Product sorting accepts `price_asc` or `price_desc`; without a sort value, products are shown newest first.

## Project layout

```text
.
├── backend/
│   ├── config/         # Razorpay configuration
│   ├── controllers/    # API handlers
│   ├── middlewares/    # Authentication middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # Express routes
│   ├── utils/          # Shared backend utilities
│   └── index.js        # Express server and MongoDB connection
└── frontend/
    ├── public/         # Static frontend assets
    └── src/
        ├── components/ # Shared UI components
        ├── context/    # React context providers
        ├── pages/      # Application pages
        ├── services/  # API client
        └── utils/      # Frontend utilities
```

## Publishing to GitHub

The repository-root `.gitignore` excludes both apps' `node_modules`, generated build output, local environment files, logs, and common local editor/OS files. The dependency manifests and lockfiles are intentionally kept so collaborators can install the same packages.

From the repository root, initialize Git if needed, review what will be committed, and push your chosen branch:

```bash
git init
git add .
git status
git commit -m "Add ShopKart application"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

If the repository is already initialized or has a remote, skip the corresponding setup commands and use the existing branch/remote. Confirm `backend/.env` is not listed by `git status` before committing. If a secret was committed in the past, adding it to `.gitignore` does not remove it from Git history; rotate that secret.

## Notes for deployment

The current frontend API URL and backend CORS origin are configured for local development. Before deploying, update them to use your deployed frontend and API origins, configure HTTPS and cookie settings for the production domains, and provide secrets through the hosting provider's environment-variable configuration.
