# RateDeck

**Enter skills, experience, market, and engagement type → get a freelance rate card** with hourly + project ranges, a transparent pricing formula, positioning, client justification email, and discount/raise scripts.

- **Live:** https://ratedeck.vercel.app
- **Repo:** https://github.com/healthyhabitat/ratedeck
- **Stack:** Next.js App Router, TypeScript, Tailwind CSS, Stripe Checkout
- **Monetization:** Free preview (ranges + formula). Full card unlock = **$1**.

## Features

- Landing page that sells RateDeck itself
- Form: skills (required), years, market (city/remote), engagement (hourly/project/retainer), seniority vibe
- Deterministic rate heuristics — **base × market × scarcity × years** — formula shown in UI
- Free preview; $1 unlock for Markdown, client email, negotiation scripts, regenerate
- Stripe Checkout + signed httpOnly cookie; dev mock unlock when Stripe unset

## How rates are calculated

```
hourly ≈ round( base(seniority) × market_mult × scarcity_mult × years_adj )
```

| Factor | Source |
|--------|--------|
| **Base** | Junior $45 → Principal $185 |
| **Market** | SF/NYC ~1.35× · US remote 1.2× · global remote 1.0× · emerging ~0.65× |
| **Scarcity** | Skill tokens (AI, security, k8s…) add up to +40% capped |
| **Years** | ±2.5%/yr vs seniority band expectation, capped ±15% |

Project and retainer bands derive from the hourly anchor (fixed hour assumptions). Same inputs → same outputs.

## Run locally

```bash
npm install
cp .env.example .env.local
# Optional: add STRIPE_SECRET_KEY + UNLOCK_COOKIE_SECRET
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without Stripe keys, unlock uses a **development-only mock** (`/api/unlock/mock`). In production with no Stripe key, the UI shows “payments are being set up” (never leaks env names).

## Scripts

| Command        | Description                |
|----------------|----------------------------|
| `npm run dev`  | Local development server   |
| `npm run build`| Production build           |
| `npm run start`| Serve production build     |
| `npm test`     | Unit tests (Vitest)        |
| `npm run lint` | ESLint                     |

## Environment variables

See [`.env.example`](./.env.example). Never commit secrets.

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_APP_URL` | Recommended | Canonical URL for redirects |
| `STRIPE_SECRET_KEY` | Prod payments | Creates $1 Checkout sessions |
| `UNLOCK_COOKIE_SECRET` | Recommended | Signs the unlock cookie |

## Deploy (Vercel)

```bash
npx vercel --prod --yes
# Set env vars in Vercel dashboard: STRIPE_SECRET_KEY, UNLOCK_COOKIE_SECRET, NEXT_PUBLIC_APP_URL
```

## Docs in this repo

- [PLAN.md](./PLAN.md) — problem, audience, GTM, metrics, risks
- [MARKETING.md](./MARKETING.md) — ready-to-post drafts
- [MORNING_BRIEF.md](./MORNING_BRIEF.md) — **read this first** when you wake
- [OPEN_ITEMS.md](./OPEN_ITEMS.md) — secondary checklist

## License

MIT — charge what you're worth.
