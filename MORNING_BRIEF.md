# RateDeck — Morning brief

**Read this first when you wake.** Overnight build is shipped; you own launch + payments.

## 1. Live check
- [ ] Open the production URL (see README / Vercel dashboard)
- [ ] Generate a card on `/create` (skills → ranges + formula)
- [ ] Confirm locked sections show unlock CTA (no Stripe env names in UI)

## 2. Env vars on Vercel (required for $1)
Set in project → Settings → Environment Variables (Production):

| Variable | Notes |
|----------|-------|
| `STRIPE_SECRET_KEY` | `sk_live_…` or test key for a dry run |
| `UNLOCK_COOKIE_SECRET` | Long random string (e.g. `openssl rand -hex 32`) |
| `NEXT_PUBLIC_APP_URL` | Canonical prod URL, no trailing slash |

Redeploy after setting. **Never paste secrets into GitHub issues or chat logs.**

## 3. First $1 path
1. Complete a test Checkout (Stripe test mode first)
2. Confirm `/success` → cookie → full scripts visible
3. Switch to live key when ready; post the launch thread

## 4. Launch posts (copy in MARKETING.md)
- [ ] X thread + screen recording
- [ ] IndieHackers
- [ ] One Reddit community (follow rules)

## 5. If something’s broken
- Build/tests: `npm test && npm run build` locally
- Payments “soon” message = Stripe key missing (by design — no leaks)
- Repo: https://github.com/healthyhabitat/ratedeck

## Overnight outcome
- Product rebranded from FirstBuck scaffold → RateDeck
- Deterministic rate engine with UI formula
- Free preview + $1 unlock plumbing
- Docs: README, PLAN, MARKETING, OPEN_ITEMS, this brief, OG
