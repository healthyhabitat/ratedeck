# RateDeck agent notes

- Product: freelance rate card generator ($1 unlock)
- Core logic: `src/lib/rates.ts` — keep formula deterministic and UI-visible
- Do not leak Stripe/env names in client-facing copy (`checkout-errors.ts`)
- Cookie: `rd_unlock`
