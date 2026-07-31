# Termi website

Marketing site + web console for **Termi** — a native Mac terminal where an AI brain
runs your work autonomously across many terminals, and you watch and steer it from any
browser.

Built with **Next.js (App Router) + Tailwind CSS v4 + Supabase** (auth + Realtime).

## Structure

```
termi-website/
├── app/
│   ├── page.tsx                  # Landing page (hero, orchestra, features, console demo, FAQ)
│   ├── login/page.tsx            # Email/password + magic-link auth
│   ├── dashboard/page.tsx        # Live web console (brain activity, presence, command relay)
│   ├── auth/callback/route.ts    # OAuth/magic-link code exchange
│   ├── auth/safeNext.ts          # Open-redirect guard for post-login redirects
│   ├── dashboard/normalize.ts    # Defensive parsers for untrusted realtime payloads
│   ├── dashboard/history.ts      # ↑/↓ command-history logic
│   ├── components/               # Animated landing components (Orchestra, TypingTerminal, …)
│   ├── opengraph-image.tsx       # Dynamic social-share card
│   ├── robots.ts / sitemap.ts    # SEO
│   ├── not-found.tsx / error.tsx / global-error.tsx  # Branded error boundaries
│   └── globals.css               # Theme tokens + animation utilities
├── utils/supabase/               # Browser / server / proxy Supabase clients
├── proxy.ts                      # Session refresh (Next 16 "proxy" convention)
└── **/*.test.mjs                 # Unit tests (node --test)
```

## Requirements

- **Node 22+** (Next 16 requirement)
- A Supabase project (free tier is fine)

## Setup

```bash
# 1. Install (this repo pins the public npm registry via .npmrc)
npm install

# 2. Configure environment
cp .env.example .env.local
#   then fill in your Supabase URL + publishable key

# 3. Run
npm run dev        # http://localhost:3000
```

## Environment variables

Only the **publishable** (anon) key belongs in the client — never the secret key.

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → Project Settings → API → `anon` / publishable key |
| `NEXT_PUBLIC_DMG_URL` *(optional)* | Direct link to the `Termi.dmg` release asset (defaults to `/downloads/Termi.dmg`) |

If these are unset the site still builds and serves — auth just shows an
"Auth not configured" state instead of crashing.

### Supabase configuration

- **Auth → URL Configuration → Redirect URLs**: add `<site>/auth/callback` and `termi://auth`.
- For local password testing without email, toggle **Auth → Providers → Email → Confirm email** off.

## Scripts

```bash
npm run dev         # dev server (Turbopack)
npm run build       # production build
npm run start       # serve the production build
npm run typecheck   # tsc --noEmit
npm test            # unit tests (normalize / history / safeNext)
```

## How the web console talks to Termi

The dashboard joins a per-user Supabase Realtime channel (`termi:<user-id>`). Termi,
signed in to the same account, joins the same channel and:

- pushes a **presence heartbeat** (~5s) and **brain status** each AFK pass,
- receives `command` / `instruct:` messages you send from the web.

All payloads are run through `normalize.ts` before rendering, so a malformed message
can never crash the dashboard. Presence older than 20s is treated as stale (Termi offline).

## Deploy (Vercel)

1. Import the repo; framework preset **Next.js**.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (and
   optionally `NEXT_PUBLIC_DMG_URL`) in Project → Settings → Environment Variables.
3. Add the deployed URL's `/auth/callback` to Supabase redirect URLs.
