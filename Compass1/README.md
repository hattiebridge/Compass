# Compass — AI Life Coach (PWA prototype)

An installable web app prototype of the "Compass" concept: conversational home screen, mood check-in, a rule-based coach engine that simulates AI unpacking, and the full set of areas — Life Wheel, 12 Week Year, Confidence Studio, Wealth, Relationships, Health, Home, Identity, Timeline, Weekly Review, and Life Audit.

The coach's replies are simulated with keyword-based logic (no API key needed), so you can click through the whole experience today. Swap `coachEngine.respond()` in `app.js` for a real model call when you're ready to connect it to live AI.

## Try it now (no setup)

```
cd compass-pwa
python3 -m http.server 8000
```

Open `http://localhost:8000` in your browser (Chrome or Safari). On mobile, use "Add to Home Screen" to install it as an app. State saves to your browser's localStorage — this works with zero configuration.

## Try the coach

Type things like:
- "I want a promotion" → builds a full 12 Week Year plan (check the Goals tab after)
- "I'm feeling overwhelmed with work" → updates confidence, mindset, and weekly focus
- "I keep apologising for everything" → generates a Confidence Studio set

---

## Full setup: GitHub → Vercel → Neon Postgres

This gives you real persistence that follows you across devices/browsers, instead of state living only in one browser's localStorage.

### 1. Push to GitHub

```
cd compass-pwa
git init
git add .
git commit -m "Compass PWA"
gh repo create compass-pwa --private --source=. --push
```
(No `gh` CLI? Create an empty repo on github.com first, then `git remote add origin <url>` and `git push -u origin main`.)

### 2. Create a Neon Postgres database

1. Go to [neon.tech](https://neon.tech) and create a free project (or, easier: from your Vercel project once it exists, go to **Storage → Connect Database → Neon** and it provisions one for you and sets the `DATABASE_URL` env var automatically).
2. Open the Neon SQL editor for your new project and run the contents of `schema.sql` (creates one `compass_state` table — this app keeps a single JSON blob per user, which is all it needs for now).

### 3. Deploy to Vercel

**Option A — CLI (fastest):**
```
npm i -g vercel
cd compass-pwa
vercel --prod
```

**Option B — GitHub + dashboard:**
1. Go to vercel.com → **Add New Project** → import the `compass-pwa` repo.
2. Framework preset: **Other**. Build/output settings: leave default (Vercel auto-installs `package.json` and picks up the `/api` folder as serverless functions — no build command needed for the static frontend).
3. Deploy.

### 4. Connect the database

If you didn't provision Neon through Vercel's Storage tab in step 2, add the env var manually: Vercel project → **Settings → Environment Variables** → add `DATABASE_URL` with your Neon connection string (same format as `.env.example`) → redeploy.

That's it — `/api/state` now reads/writes to Postgres, and `app.js` syncs to it automatically in the background (see "How sync works" below).

---

## How sync works

- localStorage is always written first and instantly — the app never waits on the network to feel responsive, and still works fully offline.
- Every change is also pushed to `/api/state` (debounced ~1s) in the background.
- On load, the app pulls the latest saved state from Postgres and re-renders if it differs from what's in localStorage — so opening Compass on a second device picks up where you left off.
- If `/api/state` isn't deployed (e.g. you're just running it locally with `python3 -m http.server`, or on a plain static host with no serverless functions) every sync call fails silently and the app behaves exactly like the localStorage-only version — nothing breaks.

## Connecting Body Atelier & House of Harriet (read-only)

If you have those apps' own Neon Postgres databases, Compass can read live data from them and show it on the Home and Health pages — it never writes back, so there's no risk to those apps' own data.

1. In Vercel, go to your Compass project → **Settings → Environment Variables**.
2. Add `HOUSE_OF_HARRIET_DATABASE_URL` with House of Harriet's own Neon connection string (a separate project from Compass's `DATABASE_URL`).
3. Redeploy. Compass's Home area page will now show a live "From House of Harriet" card: Home score, laundry/shopping items left, last 30‑minute reset, shutdown checklist progress.
4. If the var isn't set (or the fetch fails for any reason), the page just shows the old "not connected" placeholder — nothing breaks.

Add `BODY_ATELIER_DATABASE_URL` the same way (Body Atelier's own Neon connection string) and the Health page will show a live "From Body Atelier" section: Body Battery ring, ADHD focus / Fibro symptoms, energy, pain and mood star ratings, sleep, hydration, cycle day, today's focus, and recommendations. Same graceful fallback if it's not set or unreachable.

**Never paste a database connection string into chat** — add it directly in Vercel's dashboard.

## What's real vs. mocked

- Real: all state (goals, Life Wheel, confidence, journal, timeline) persists via localStorage, syncs to Neon Postgres if configured, and the app works offline once installed. House of Harriet and Body Atelier data are real and live once their respective env vars are set.
- Mocked: the coach's "understanding" is keyword-matching, not a language model. Voice input is a placeholder. Apple Health has no web API for direct integration (would need a native companion app or a Shortcuts bridge). Calendar integration is stubbed too.
