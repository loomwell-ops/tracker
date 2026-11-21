# LoomwellOps™ Job Tracker

Static site (GitHub Pages) + Supabase (login and database) + a Cloudflare Worker (AI).

## Files in this repo
`index.html`, `style.css`, `app.js`, `privacy.html`, `terms.html`, `manifest.webmanifest`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, `bg.jpg`, `bg-light.webp`, `.gitignore`, and `backend/` (worker and SQL, not served to users).
Never commit `PRIVATE-*` files. They hold your applications.

## 1. Login and database (Supabase)
1. SQL Editor: run `backend/schema.sql` once.
2. Put the Project URL and `anon` key in `CFG` at the top of `app.js`. Never use the `service_role` key.
3. Authentication > URL Configuration: set Site URL to your GitHub Pages address.

## 2. AI Worker (Cloudflare)
1. Paste `backend/worker.js` into your Worker.
2. Secrets: `GEMINI_API_KEY`, `SUPABASE_ANON_KEY`. Variables: `SUPABASE_URL`, `ALLOWED_ORIGIN`, optional `MODEL`, `THINKING_BUDGET`.
3. Daily limit per user: Storage & Databases > KV > create a namespace (e.g. `loomwell-usage`), then Worker > Settings > Bindings > add KV binding named `USAGE`. Optional variable `DAILY_LIMIT` (default 30). Without the binding there is no limit.
4. Put the Worker URL in `CFG.AI_URL` in `app.js`.

## 3. Publish
Upload everything except `PRIVATE-*`, then Settings > Pages. After changing `style.css` or `app.js`, bump `?v=2` in `index.html` so browsers reload them.

## 4. Before selling
Fill in your name and email in `privacy.html` and `terms.html`, get them reviewed, add payments and gate the AI by plan, and register the trademark (use ™ until registered).
