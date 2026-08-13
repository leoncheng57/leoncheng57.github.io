# GA Traffic Dashboard (alpha, local-only)

Local web app that charts traffic per app section of leoncheng.dev, grouped
from GA4 page paths. It is intentionally **not deployed**: a tiny Node proxy
queries the GA4 Data API with private credentials, so the data never leaves
your machine. On a static host the UI degrades to instructions for running
it locally.

- Groups: home, blog, sub-wait, workout-lab, apps, game-nights, repo, tuzi,
  preview (PR previews, hidden by default), other
- `/previews/...` traffic is matched first so PR review traffic never counts
  toward real apps (see `src/appGroups.ts` - order matters).

## One-time setup (~5 min)

1. Create (or reuse) a Google Cloud project and enable the
   **Google Analytics Data API**.
2. Create a **service account** and download a JSON key somewhere private
   (outside the repo).
3. In GA4: Admin > Property access management > add the service account's
   email with the **Viewer** role.
4. `cp .env.example .env.local` and fill in your GA4 property ID, the key
   path, and (optionally) a GA report deep link. `.env.local` is gitignored.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5199. The Vite dev server proxies `/api` to the Node
proxy on :8787. Both read config from `.env.local`.

## Privacy rules for this folder

- No credentials, key files, property/account IDs, or traffic numbers may be
  committed - config lives in `.env.local`, data stays on your machine.
- No screenshots containing analytics data in the repo or PR descriptions.
