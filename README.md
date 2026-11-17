# LoomwellOps™ Job Tracker

Static site (GitHub Pages) + Supabase (login and database) + a small Cloudflare Worker (AI).

## 1. Login and database (Supabase, free tier)
1. Create a project at supabase.com.
2. SQL Editor: paste and run `backend/schema.sql`.
3. Project Settings > API: copy the Project URL and the `anon` public key.
4. Open `index.html`, find `const CFG=`, and fill `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
5. Authentication > URL Configuration: set Site URL to your GitHub Pages address.
Never put the `service_role` key anywhere in this site.

## 2. AI (resume tailoring and cover letters)
1. Create a Cloudflare Worker and paste `backend/worker.js`.
2. Add secrets: `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`; add variable `ALLOWED_ORIGIN` (e.g. `https://yourname.github.io`).
3. Put the Worker URL in `CFG.AI_URL` in `index.html`.
The Gemini key must stay in the Worker, never in `index.html`.

## 3. Publish on GitHub Pages
Create a repo, upload everything in this folder except `PRIVATE-*` (already in `.gitignore`), then Settings > Pages > Deploy from branch.

## 4. Your own applications
Sign in, click "Import backup", and choose `PRIVATE-my-applications-backup.json`. Do not commit that file; it holds your job applications.

## Before sharing widely or selling
- Add a Privacy Policy and Terms (resumes are personal data; check Philippine Data Privacy Act duties).
- Add per-user AI usage limits (see TODO in `worker.js`): every tailoring costs API money.
- Use a payment provider for subscriptions and gate the AI by plan.
- Trademark: search IPOPHL / WIPO Global Brand Database for "LoomwellOps", then register. Use ™ until registered, never ®.
