# OrderNow

OrderNow is a full-stack restaurant ordering and kitchen-management web application. Customers can browse a restaurant menu, build an order, choose dine-in, takeaway, or delivery, and view an order receipt. Staff can access a kitchen dashboard to review orders, update preparation statuses, and publish menu items.

The application is built with **React and Vite** on the frontend and **Node.js, Express, and MongoDB** on the backend. It includes an integration path for **Chapa** payments and **Cloudinary** image hosting.

> **Project status:** This README documents the implementation in the supplied source code. See [Current implementation notes](#current-implementation-notes) before using the application with real customers or payments.

## Features

### Customer experience

- Browse food and drink items in a menu grid.
- Search menu items and filter by category.
- Open a dish detail view to see its ingredients and estimated preparation time.
- Add items to the cart and change item quantities.
- Choose one of three service options:
  - **Dine-In:** select a table number from 1–12.
  - **Takeaway:** collect the order at the counter.
  - **Delivery:** provide a delivery address.
- Add a message for the kitchen, including allergy notes or ingredients to exclude.
- Submit order details and request a Chapa checkout URL from the backend when Chapa is configured. The current frontend does not yet redirect to the hosted checkout page; see [Current implementation notes](#current-implementation-notes).
- View a receipt and follow kitchen progress through the customer order-tracking view.
- Review receipts saved on the current browser/device.

### Staff experience

- Open the staff area using the passcode screen.
- View the order queue, customer contact details, order items, service information, and kitchen notes.
- Change an order's status:
  - `Awaiting Payment`
  - `Pending Kitchen`
  - `Preparing`
  - `Ready`
  - `Completed`
  - `Cancelled`
- Publish menu items with a name, price, category, ingredients, preparation time, and image.
- Upload menu images to Cloudinary.

### Data and synchronization

- Store menu items and orders in MongoDB when the backend is reachable.
- Keep local copies of menus, orders, and customer receipt references in browser storage.
- Refresh backend menu/order data periodically in the frontend.
- Synchronize order changes between tabs using browser storage events and `BroadcastChannel`.

## Technology stack

| Area | Technologies |
| --- | --- |
| Frontend | React 19, Vite 8, JavaScript |
| Styling | Tailwind CSS 4 using `@tailwindcss/vite` |
| Icons | Lucide React |
| Backend | Node.js, Express 5 |
| Database | MongoDB with Mongoose |
| Image uploads | Multer and Cloudinary |
| Payments | Chapa transaction initialize/verify API |
| Configuration | dotenv |
| Cross-origin requests | Express CORS middleware |

## Project structure

```text
OrderNow/
├── ordernow-frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── data/
│   │   │   └── fallbackData.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── ordernow-Back-end/
│   ├── config/
│   │   ├── cloudinary.js
│   │   └── database.js
│   ├── controller/
│   │   ├── adminController.js
│   │   ├── menuController.js
│   │   └── orderController.js
│   ├── middleware/
│   │   └── uploadMiddleware.js
│   ├── model/
│   │   ├── menuSchema.js
│   │   └── orderSchema.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── baseRoute.js
│   │   ├── menuRoutes.js
│   │   └── orderRoutes.js
│   ├── app.js
│   └── package.json
│
└── README.md
```

The current frontend entry point is `src/main.jsx`, which renders the application in `src/App.jsx`. The `src/components/` directory contains additional component files; the current `App.jsx` implements its main screens and UI directly.

## Prerequisites

Install the following before running the project:

- Node.js and npm
- A MongoDB database (local MongoDB or MongoDB Atlas)
- A Cloudinary account for menu image uploads
- A Chapa merchant account and secret key for real payment processing

Cloudinary and Chapa credentials are only needed for the corresponding integrated features. The application can be started locally without a Chapa key, but the payment fallback described below is for development only.

## Getting started

The frontend and backend are separate Node.js applications. Run them in two terminals.

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd OrderNow
```

### 2. Configure and start the backend

```bash
cd ordernow-Back-end
npm install
```

Create a `.env` file inside `ordernow-Back-end/`:

```env
# MongoDB connection string
MONGODB_URI=mongodb://127.0.0.1:27017/ordernow

# Backend port
PORT=5000

# Frontend URL used when creating Chapa checkout return URLs
FRONTEND_URL=http://localhost:5173

# Set a private passcode for staff access
ADMIN_PASSCODE=replace_with_a_strong_private_passcode

# Cloudinary credentials (required for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Chapa secret key (required for real payment initialization and verification)
CHAPA_SECRET_KEY=your_chapa_secret_key
```

Replace the example values with your own configuration. `MONGODB_URI` must point to a reachable MongoDB database. Cloudinary credentials are needed when uploading images; a menu item can also be created with an existing image URL.

Start the backend in development mode:

```bash
npm run dev
```

Or start it without Nodemon:

```bash
npm start
```

The backend listens on port `5000` by default. The port can be changed with the `PORT` environment variable.

### 3. Configure and start the frontend

Open a second terminal from the repository root:

```bash
cd ordernow-frontend
npm install
```

Create `ordernow-frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

`VITE_API_URL` is optional for local development because the frontend already defaults to `http://localhost:5000`. Set it when the backend is hosted at another URL.

Start the Vite development server:

```bash
npm run dev
```

Open the local URL printed by Vite in your terminal (Vite normally uses `http://localhost:5173`).

### 4. Build and lint the frontend

From `ordernow-frontend/`:

```bash
npm run build
npm run lint
npm run preview
```

- `npm run build` creates the production frontend bundle in `dist/`.
- `npm run lint` runs Oxlint.
- `npm run preview` serves the built frontend locally for preview.

The backend package currently has no automated test suite configured.

## Environment variables

### Backend

| Variable | Required? | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB connection string used by Mongoose. |
| `PORT` | No | API server port; defaults to `5000`. |
| `FRONTEND_URL` | No | Frontend base URL used for Chapa return URLs; defaults to `http://localhost:5173`. |
| `ADMIN_PASSCODE` | Strongly recommended | Staff passcode checked by the admin login endpoint. The source also contains a development fallback, so configure a private value and remove the fallback before deployment. |
| `CLOUDINARY_CLOUD_NAME` | For image uploads | Cloudinary cloud name. |
| `CLOUDINARY_API_KEY` | For image uploads | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | For image uploads | Cloudinary API secret. |
| `CHAPA_SECRET_KEY` | For real payments | Server-side key used to initialize and verify Chapa transactions. |

### Frontend

| Variable | Required? | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | No | Base URL of the backend API; defaults to `http://localhost:5000`. |

**Important:** Never put database passwords, Cloudinary secrets, Chapa secret keys, or other private credentials in frontend variables prefixed with `VITE_`. Vite exposes those variables to browser code.

## API reference

The backend mounts its routes at the root URL. With the default local configuration, the base URL is:

```text
http://localhost:5000
```

### Menu endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/menu` | Get menu items. |
| `GET` | `/api/menu/:id` | Get one menu item by MongoDB ID. |
| `POST` | `/api/menu` | Create a menu item. Accepts multipart form data for an uploaded image. |
| `PUT` | `/api/menu/:id` | Update a menu item. Can accept a replacement image. |
| `DELETE` | `/api/menu/:id` | Delete a menu item and attempt to remove its Cloudinary image. |

For `POST /api/menu`, the controller accepts these fields:

- `DishName`
- `Price`
- `Category`
- `prep_time_minutes`
- `Ingredients` (an array, a JSON array string, or a comma-separated string)
- `image` (multipart file field) or `ImageUrl` (an existing image URL)

The upload middleware accepts JPEG, PNG, and WebP images up to 5 MB.

### Order endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/orders` | Get orders. Supports `paymentStatus` and `orderStatus` query filters. |
| `POST` | `/api/orders` | Create an order and initialize the Chapa checkout flow when configured. |
| `GET` | `/api/orders/verify/:tx_ref` | Verify a transaction reference and update payment/order status. |
| `PUT` | `/api/orders/:id/status` | Update an order's kitchen status. |

A basic order request body has this shape:

```json
{
  "CustomerName": "Customer Name",
  "CustomerPhone": "+251900000000",
  "CustomerEmail": "customer@example.com",
  "DeliveryAddress": "Takeaway / Pickup",
  "Message": "No onions, please",
  "items": [
    {
      "menuId": "000000000000000000000000",
      "Quantity": 2
    }
  ]
}
```

Use a real menu document ID from MongoDB for `menuId`; the ID above is only a format example. The backend requires a customer name, phone number, and at least one item. It looks up each menu document and calculates the total on the server from the stored menu price and requested quantity.

To update an order status, send a JSON body such as:

```json
{
  "OrderStatus": "Preparing"
}
```

Allowed values are `Awaiting Payment`, `Pending Kitchen`, `Preparing`, `Ready`, `Completed`, and `Cancelled`.

### Admin endpoint

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/admin/login` | Check a staff passcode. |

Request body:

```json
{
  "passcode": "your_staff_passcode"
}
```

The endpoint responds with a success or unauthorized response. The current implementation does not issue a JWT or establish a server-side authenticated session.

## Payment flow

When `CHAPA_SECRET_KEY` is configured, the backend sends a transaction-initialize request to Chapa using Ethiopian Birr (`ETB`). It stores the order with a transaction reference and returns a `checkout_url`. The verification endpoint can then call Chapa's transaction verification API and update the order's payment and kitchen statuses.

**Important frontend limitation:** The current frontend does not navigate to the returned `checkout_url`. Instead, it displays an in-app demo-style modal with a button that calls the backend verification endpoint. Connect that button to the actual hosted checkout/return flow before treating this as a live payment integration.

**Development warning:** When `CHAPA_SECRET_KEY` is absent, the backend's verification controller treats a transaction as successful without contacting Chapa. The frontend also has a local fallback path when API requests fail. These behaviors are useful only for local UI development and are not real payment verification. Configure and test Chapa credentials before accepting payments.

## Current implementation notes

The following details are visible in the supplied code and are important when extending or deploying the project:

1. **Menu schema fields:** The menu controller reads and writes `Category` and `IsAvailable`, but the current Mongoose menu schema does not declare those fields. Add them to `model/menuSchema.js` if they must be reliably stored and returned by MongoDB.
2. **Order service fields:** The frontend tracks `ServiceType` and `TableNumber`, while the current Mongoose order schema does not declare those fields. The frontend currently attempts to infer service type and table information from `DeliveryAddress`. Consider adding the explicit fields to the order schema and controller.
3. **Fallback menu items:** The frontend includes built-in sample dishes and permanent beverage entries. The backend order controller validates each `items[].menuId` against MongoDB, so production orders should use menu IDs that correspond to actual database menu documents. Frontend-only sample items may not be accepted by the backend.
4. **Local checkout fallback:** If the API is unavailable, the frontend can create a local fallback order for the browser UI. A locally stored order is not proof of a database write or a successful payment.
5. **Staff access and API protection:** The staff PIN check is not a complete authentication system. The frontend keeps a staff flag in `sessionStorage`, and the backend's menu-management and order-status routes do not currently enforce an authenticated staff session. Add server-side authentication and authorization middleware before exposing these endpoints publicly.
6. **CORS configuration:** The backend currently enables CORS with `cors()` without an origin allowlist. Restrict allowed origins before production deployment.
7. **Payment UI:** The backend returns a Chapa `checkout_url`, but the current frontend does not open it. The in-app payment modal is a local confirmation/simulation step, not a completed hosted checkout experience.
8. **Order privacy:** `GET /api/orders` currently returns the order list without authentication, including customer contact and delivery information. Restrict this endpoint and expose only the data each customer or staff member is authorized to see.
9. **Testing:** No backend test suite is configured in the current `package.json`.

## Security and deployment checklist

Before deploying or using real customer data:

- Keep `.env` files out of Git. Commit an `.env.example` containing placeholder values instead of real credentials.
- The supplied archive contains a backend `.env` file. Do not upload that file to GitHub. The current backend `.gitignore` excludes `.env`; keep that rule in place.
- Use a strong, private `ADMIN_PASSCODE` and remove hard-coded fallback credentials from the source.
- Implement server-side authentication and authorization for menu changes, order-status updates, and order reads. Do not expose all customer orders publicly.
- Restrict CORS to the frontend's deployed origin.
- Use a real `CHAPA_SECRET_KEY` and verify transactions with Chapa; never treat a local fallback as payment confirmation.
- Keep Chapa and Cloudinary secret keys on the backend only.
- Use HTTPS and production-grade error logging/monitoring.
- Add tests for checkout, payment verification, menu management, and order status transitions.

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Make and test your changes.
4. Open a pull request with a clear description of the change.

## License

The backend package declares the `ISC` license. Confirm the intended license for the complete repository before publishing a repository-wide license file.
