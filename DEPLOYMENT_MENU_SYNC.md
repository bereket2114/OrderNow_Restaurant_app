# OrderNow: database-only food menu deployment fix

## What changed

- Removed all hardcoded demo food dishes from the storefront.
- Removed reading/writing the `orderNow_menus` browser localStorage cache.
- Removed image/ingredient/category/preparation-time substitutes for database food records.
- Food entries now come from `GET /api/menu` only. Records missing required saved fields are not shown.
- The permanent six beverages remain static in `App.jsx` exactly as before.
- Removed the four demo food IDs from the backend trusted checkout catalog. The six permanent beverage IDs remain available; ordinary food orders must reference a real MongoDB menu document.
- Production builds no longer silently default `VITE_API_URL` to `http://localhost:5000`.

## Files to replace/add

1. Replace `ordernow-frontend/src/App.jsx` with this package's `ordernow-frontend/src/App.jsx`.
2. Replace `ordernow-frontend/src/data/fallbackData.js` with this package's version (it now exports an empty `INITIAL_MENUS` for backward compatibility).
3. Replace `ordernow-Back-end/config/trustedMenuCatalog.js` with this package's version.

## Required Vercel configuration

In Vercel, open the **frontend project** > Settings > Environment Variables.

Set:

- Name: `VITE_API_URL`
- Value: the public base URL of your deployed Express backend, such as `https://your-backend-host.example.com`
- Do not add `/api`, `/api/menu`, or a trailing route path.
- Apply it to Production (and Preview if you use preview deployments).

Save the variable, then redeploy the frontend. Vite embeds `VITE_*` values during the build, so changing the variable does not update an already-built deployment.

Do not set the production value to `http://localhost:5000`. A visitor's browser interprets localhost as that visitor's own computer.

## Ensure localhost and production use the same database

The local backend and deployed backend each use their own `MONGODB_URI` environment variable. If the URIs point to different MongoDB databases, they will show different menu records even when the frontend code is identical.

If you want the same menu in both places, set the deployed backend's `MONGODB_URI` to the same intended MongoDB Atlas cluster and database used by local development. Keep credentials private; do not put MongoDB credentials in Vercel frontend variables.

Also set the deployed backend's `CORS_ORIGINS` to the exact Vercel frontend origin (for example `https://your-project.vercel.app`) and `FRONTEND_URL` to the deployed frontend URL if checkout return URLs use that variable.

## Verify the deployed API before checking the UI

Open this URL in a browser, substituting your deployed backend host:

`https://YOUR-BACKEND-HOST/api/menu`

The JSON `data` array should contain the MongoDB food dishes you expect. If it contains different dishes or is empty, the issue is the deployed backend's MongoDB connection/database/collection, not Vercel's React rendering.

The backend model is `restaurantMenus`; verify that the expected documents exist in that model's collection in the database selected by the deployed `MONGODB_URI`.

## After deployment

1. Confirm `/api/menu` returns the expected records.
2. Confirm the Vercel frontend uses that backend URL (check browser Network > `GET /api/menu`).
3. Confirm the response body contains the expected dish names, prices, categories, image URLs, and ingredients.
4. If the browser still shows an old version, hard refresh with Ctrl+Shift+R and confirm the latest Vercel deployment is serving the commit you just pushed.

No `.env` credentials are included in this patch.
