# Backend & Deployment Changes

This document covers the changes made to remove the hardcoded `localhost:3000`
dependency, make the backend deployable on Vercel, and how to run everything
locally.

## Why

The Express backend previously only worked when running on `localhost:3000`:
the frontend called `http://localhost:3000/applications` directly, the
Supabase URL was hardcoded, and Firebase Admin credentials were loaded from a
JSON file that isn't committed to git (and wouldn't exist on Vercel). None of
that survives a real deployment, so the backend has been restructured into a
Vercel serverless function and everything environment-specific now comes from
env vars.

## What changed

- **`api/index.js`** (new) — the Express app, moved here so Vercel can deploy
  it as a serverless function. All routes are now prefixed with `/api`
  (`/api/users`, `/api/applications`, `/api/logs`, etc.) instead of living at
  the root path.
- **`api/package.json`** (new) — `{ "type": "commonjs" }`, so this directory's
  `.js` files are treated as CommonJS regardless of the root `package.json`'s
  `"type": "module"`.
- **`index.cjs`** — now just a thin local-dev entrypoint: it loads `.env`,
  requires the app from `api/index.js`, and calls `app.listen(PORT)`. Run it
  with `npm run server`.
- **`supabaseClient.cjs`** — Supabase URL now comes from `SUPABASE_URL`, with
  the existing project URL kept as the default fallback (it's not a secret,
  only the key is). `SUPABASE_KEY` is still required and throws a clear error
  if missing.
- **`firebase.cjs`** — Firebase Admin credentials now load, in order:
  1. `FIREBASE_SERVICE_ACCOUNT_BASE64` (base64-encoded service account JSON)
  2. `FIREBASE_SERVICE_ACCOUNT` (raw JSON string)
  3. A local `firebase-service-account.json` file (checked at both the repo
     root and `src/`, since it's historically been placed in either)

  This is required because Vercel has no access to a local, gitignored JSON
  file — the deployed function needs credentials injected as an env var.
- **`src/views/RegisterView.vue`** — the registration `fetch` call now hits
  the relative path `/api/applications` instead of
  `http://localhost:3000/applications`. This works identically in dev (via
  the Vite proxy, see below) and in production (same-origin on Vercel).
- **`vite.config.js`** — added a dev-only proxy so `/api/*` requests from
  `vite dev` are forwarded to the local Express server (default
  `http://localhost:3000`, overridable with `BACKEND_URL`).
- **`vercel.json`** (new) — tells Vercel to build the Vite app to `dist`,
  rewrite `/api/*` to the `api/index.js` serverless function, and fall back
  everything else to `index.html` for Vue Router's client-side routing.
- **`.env.example`** (new) — documents every env var the backend needs.
- Removed a pre-existing bug in `POST /api/applications` where the
  "copy to users" step referenced `app.firebase_uid` (the Express `app`
  object, not the inserted row) — that block never worked and duplicated what
  the `/approve` endpoint already does correctly, so it was dropped from the
  registration route entirely.

## Running locally

You need two processes running at once:

```bash
npm run server   # Express API on http://localhost:3000 (routes under /api)
npm run dev      # Vite dev server on http://localhost:5173, proxies /api/* to the server above
```

Open `http://localhost:5173` — do **not** call `localhost:3000` directly from
the browser anymore, all API calls should go through the relative `/api/...`
path.

### Required local files/env vars

Copy `.env.example` to `.env` **at the project root** (not `src/`) and fill
in:

| Variable | Required | Notes |
|---|---|---|
| `SUPABASE_KEY` | Yes | Supabase service/anon key |
| `SUPABASE_URL` | No | Defaults to the existing project URL |
| `FIREBASE_SERVICE_ACCOUNT_BASE64` | No* | Base64-encoded service account JSON |
| `FIREBASE_SERVICE_ACCOUNT` | No* | Raw service account JSON string |
| `PORT` | No | Defaults to `3000` |
| `BACKEND_URL` | No | Only if your local backend isn't on port 3000 |
| `FRONTEND_URL` | No | Restricts CORS in production; `*` if unset |

\* If neither is set, `firebase.cjs` falls back to a local
`firebase-service-account.json` file (root or `src/`). At least one of the
three is required.

Both `dotenv` (backend) and Vite (frontend) only auto-load `.env` from the
**project root** — a `.env` file placed anywhere else (e.g. `src/.env`) will
silently not be picked up.

## Deploying to Vercel

1. Import the repo into Vercel. `vercel.json` already configures the build
   command (`vite build`), output directory (`dist`), and the `/api` rewrite.
2. In the Vercel project's Environment Variables settings, set:
   - `SUPABASE_KEY` (required)
   - `SUPABASE_URL` (optional, only if using a different Supabase project)
   - `FIREBASE_SERVICE_ACCOUNT_BASE64` (required — generate with the command
     below)
   - `FRONTEND_URL` (recommended — set to your deployed domain to restrict
     CORS instead of allowing `*`)
3. Generate the base64 credential once and paste it into Vercel:

   ```bash
   node -e "console.log(Buffer.from(require('fs').readFileSync('firebase-service-account.json')).toString('base64'))"
   ```

4. Deploy. `api/index.js` is picked up automatically as a serverless
   function; no further config is needed.
