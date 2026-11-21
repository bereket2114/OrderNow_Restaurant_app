# OrderNow security update and setup

This update hardens the existing frontend/backend project. It does not create a new application or change the repository layout.

## Before replacing files in your existing GitHub clone

1. Keep a backup of your current project.
2. Extract/overwrite the updated project files into your existing repository folder. Do not delete your `.git` folder.
3. Keep your existing backend `.env` file locally. The supplied update archive intentionally does **not** contain `.env` or any real credentials.
4. Compare your existing environment values with `ordernow-Back-end/.env.example` and add the new settings described below.
5. Do not commit `.env`, credentials, password hashes, or API secrets.

## Required backend environment settings

Configure these values in `ordernow-Back-end/.env` locally and in your backend hosting provider's secret/environment settings:

- `NODE_ENV`: `development` locally; `production` when deployed.
- `PORT`: normally `5000` locally; your host may provide this automatically.
- `MONGODB_URI`: your MongoDB connection string.
- `FRONTEND_URL`: the exact public frontend origin, such as `http://localhost:5173` locally or `https://your-frontend.example` in production. Do not include a path.
- `CORS_ORIGINS`: comma-separated exact frontend origins. Include each deployed frontend origin you actually use.
- `BACKEND_URL`: the public HTTPS backend origin in production. Chapa's server callback is included only when this value is a valid HTTPS origin. For local development, the customer return URL still triggers payment verification.
- `CHAPA_URL`: keep the current Chapa v1 API base URL `https://api.chapa.co/v1` unless you intentionally migrate the integration.
- `CHAPA_SECRET_KEY`: your Chapa server-side secret. Never use a `VITE_` prefix and never commit it.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: existing Cloudinary configuration.
- `ADMIN_PASSWORD_HASH`: newly required; generate it using the instructions below.
- `COOKIE_SAME_SITE`: use `none` for a frontend/backend deployment that is cross-site and served over HTTPS. Use `lax` for local development or a same-site deployment. Cookies are always `Secure` in production.

The old `ADMIN_PASSCODE` setting is no longer used. Remove it from your private environment configuration after setting `ADMIN_PASSWORD_HASH`.

## Generate the administrator password hash

From a terminal:

```bash
cd ordernow-Back-end
npm install
npm run hash-admin-password
```

Enter a new, unique password of at least 12 characters. The utility does not echo the password. Copy the generated `scrypt$...` string into the private backend environment as `ADMIN_PASSWORD_HASH`.

Do not put the raw password or generated hash in source code, a README, or Git.

## Frontend configuration

Create `ordernow-frontend/.env` locally or set the equivalent variable in your frontend host:

```env
VITE_API_URL=http://localhost:5000
```

In production, change it to the backend's public origin, for example `https://your-api.example`. This value is public and must not contain secrets.

## What changed

- Chapa checkout now uses the server-side initialize endpoint and the returned hosted checkout URL. No client-side payment-success simulation remains.
- The backend computes item prices and totals from MongoDB or the server-owned built-in menu catalog. Client-supplied prices are ignored.
- An order becomes paid only after Chapa's server verification confirms success, the same transaction reference, ETB currency, and the expected amount.
- A missing Chapa secret fails closed; it never marks a transaction paid.
- An optional Chapa server callback calls the same verification logic. Callback query parameters are never accepted as proof of payment.
- Staff login uses a salted scrypt password hash and an expiring, random, HttpOnly session token stored hashed in MongoDB. Changing `ADMIN_PASSWORD_HASH` invalidates previously issued sessions.
- Full order listing, order status changes, and menu create/update/delete require staff authentication.
- Sensitive browser requests require an allowed `Origin` and the `X-OrderNow-Request: 1` header, in addition to the staff session where required.
- CORS uses an explicit origin allowlist; basic HTTP security headers and request-body limits are configured.
- Uploads are limited to 5 MB, one file, and JPEG/PNG/WebP file signatures are checked against the declared MIME type.
- Menu validation and schema fields were aligned, including `Category` and `IsAvailable`.
- Customer receipt data is kept locally for that browser; the previous all-orders localStorage cache is filtered out.
- Added automated unit tests for password hashing, origin checks, rate limiting, built-in catalog prices, and Chapa verification comparisons.

## Run and test

Backend:

```bash
cd ordernow-Back-end
npm install
npm test
npm run dev
```

Frontend:

```bash
cd ordernow-frontend
npm install
npm run dev
```

The frontend production build can be checked with `npm run build` after its dependencies are installed.

## Important operational notes

- Existing staff PIN login has been removed. Configure `ADMIN_PASSWORD_HASH` before using the staff dashboard.
- Chapa checkout will intentionally fail when `CHAPA_SECRET_KEY` or `FRONTEND_URL` is missing. This is safer than simulating a paid transaction.
- If frontend and backend are hosted on different sites, configure `COOKIE_SAME_SITE=none`, HTTPS, `FRONTEND_URL`, and `CORS_ORIGINS` correctly. Browser third-party-cookie policies can still affect cross-site cookies; using the same site/custom domain for both services is preferable.
- The included rate limiter is in-memory and suitable for a single backend process. Use a shared store (for example Redis) before running multiple backend instances.
- Upload validation checks file signatures but does not perform full image re-encoding or enforce decoded pixel dimensions. Add a maintained image decoder/processor for higher-assurance public uploads.
- No live Chapa transaction, deployed database, Cloudinary upload, or production browser session was exercised in this offline source review. Run a Chapa sandbox payment and test the deployed cookie/CORS configuration before accepting real customer payments.
- The update provides important security improvements but is not a formal penetration test or a guarantee that the application is production-certified.
